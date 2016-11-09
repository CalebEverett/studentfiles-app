'use strict'

const debug = require('debug')('lib/login')
const {
  GOOGLE_CLIENTID,
  GOOGLE_CLIENTSECRET,
  GOOGLE_CALLBACKURL,
  JWT_EXP,
  JWT_ISSUER,
  JWT_SECRET
} = process.env
const Promise = require('bluebird')
const google = require('googleapis')
const plus = google.plus('v1')
const OAuth2 = google.auth.OAuth2
const oauth2Client = new OAuth2(GOOGLE_CLIENTID, GOOGLE_CLIENTSECRET, GOOGLE_CALLBACKURL)
const getAuthUrl = Promise.resolve(oauth2Client.generateAuthUrl({
  access_type: 'online',
  scope: [ 'profile', 'email' ]
}))
const getGoogleToken = Promise.promisify(oauth2Client.getToken, {context: oauth2Client})
const getProfile = Promise.promisify(plus.people.get, {context: plus.people})
const db = require('../lib/db.js')
const qrec = require('pg-promise').errors.queryResultErrorCode
const jwt = require('jsonwebtoken')
const jwtSign = Promise.promisify(jwt.sign, {context: jwt})

/**
 *Takes code returned to callback from auth url, gets user email from google then
 *returns id from database if it exists or the profile from google if it doesn't
 *@param {string} code -returned by google to GOOGLE_CALLBACKURL
 */
const getJWToken = (code) => {
  return new Promise((resolve, reject) => {

    debug(`code: ${code}`)
    getGoogleToken(code)
    .then(tokens => {
      debug('tokens: ', JSON.stringify(tokens, null, 4))
      return oauth2Client.setCredentials(tokens)
    })
    .then(() => { return getProfile({ userId: 'me', auth: oauth2Client }) })
    .then((profile) => {
      debug('profile: ', JSON.stringify(profile, null, 4))
      const email = profile.emails[0].value
      return db.one("SELECT id from contact where recordtypeid = '012A0000000uUcEIAU' and email_school__c = $1", email)
      .then(result => {
        debug(`database: ${JSON.stringify(result, null, 4)}`)
        return jwtSign({id: result.id}, JWT_SECRET, {issuer: JWT_ISSUER, expiresIn: Number(JWT_EXP)})
          .then(token => {
            debug(`token: ${JSON.stringify(token, null, 4)}`)
            return resolve({ token }) })
      })
      .catch(error => {
         if (error.hasOwnProperty('code')) {
           debug(`email not found in database: ${JSON.stringify(error.code === qrec.noData, null, 4)}`)
           return error.code === qrec.noData ? resolve({ profile }) : reject(error)
         }
      })
    })
  })
}

module.exports = { getAuthUrl, getJWToken }
