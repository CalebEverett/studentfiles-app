'use strict'

const debug = require('debug')('routes/login')
const url = require('url')
const express = require('express')
const router = express.Router()
const Promise = require('bluebird')

const jwt = require('jsonwebtoken')
const jwtVerify = Promise.promisify(jwt.verify, {context: jwt})
const login = require('../lib/login')
const { JWT_EXP, JWT_NAME } = process.env

var adminIds = [process.env.SALESFORCE_ADMIN_ID, '003F000001OKbRtIAL']
let profileData = {}

/* login page. */
router.get('/', function(req, res, next){
  profileData = {}
  res.render('login')
})

/* google auth. */ 
router.get('/google', (req, res) => {
  debug(`google auth: ${JSON.stringify(login.getAuthUrl, null, 4)}`)
  login.getAuthUrl
  .then(url => res.redirect(url))
})

router.get('/google/callback', (req, res) => {
  debug(`headers: ${JSON.stringify(req.headers, null, 4)}`)
  debug('JWT_NAME: ', JSON.stringify(JWT_NAME, null, 4))
  login.getJWToken(req.query.code)
  .then(({ token, profile }) => {
    debug(`auth result: ${JSON.stringify({ token, profile }, null, 4)}`)
    if (token) {
     res.cookie(JWT_NAME, token, { httpOnly: true, secure: true, maxAge: JWT_EXP * 1000 })
     return res.redirect('/')
    } else {
      return res.render('loginfailed', profile)
    }
  })
  .catch(error => { debug(error) })
})

router.get('/logout', (req, res) => {
  res.redirect('/auth')
})

module.exports = router
