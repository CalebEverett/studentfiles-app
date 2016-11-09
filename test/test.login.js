'use strict'

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const expect = chai.use(chaiAsPromised).expect
const fetch = require('node-fetch')
const https = require('https')

const login = require('../lib/login.js')
const {
  GOOGLE_CLIENTID,
  GOOGLE_CLIENTSECRET,
  GOOGLE_CALLBACKURL,
  PG_URL,
  PORT
} = process.env

const makeServer = () => {
    const express = require('express')
    const app = express()
    const server = app.listen(PORT, () => {
      const port = server.address().port
      console.log(`Test app listening at port ${port}`)
    })
    return { app, server }
}

describe('Authorize, Create Token, Set Cookie, Redirect', function () {
  this.timeout(50000)
  before((done) => {
    const { app, server } = makeServer()
    console.log('hello', server.address().port)
    app.get(GOOGLE_CALLBACKURL, (req, res) => {
      console.log(res.query.code)
      expect(res.query.code).to.be.a('string')
      res.end()
      done()
    })
  })
  it('should have environment variables loaded', () => {
    expect(GOOGLE_CLIENTID, 'GOOGLE_CLIENTID').to.be.a('string')
    .and.to.have.length.above(15)
    expect(GOOGLE_CLIENTSECRET, 'GOOGLE_CLIENTSECRET').to.be.a('string')
    .and.have.length.above(15)
    expect(GOOGLE_CALLBACKURL, 'GOOGLE_CALLBACKURL').to.be.a('string')
    .and.have.length.above(15)
    expect(PG_URL, 'PG_URL').be.a('string')
    .and.have.length.above(15)
    expect(PORT, 'PORT').to.be.a('string')
    .and.have.length(4)
  })

  it('should return a code to request an oAuth token', (done) => {
    login.getAuthUrl
    .then(url => fetch(url))
    .then(result => { return console.log(JSON.stringify(result, null, 4))})
  })
  it('return a user profile with an email address', () => {})
  it('establish a connection to the database', () => {})
  it('return an id if the email address is in the database', () => {})
  it('return the google profile if the email address is not in the database', () => {})
})

describe('Check Cookie, Decode Token', function () {
})
