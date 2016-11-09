'use strict'

const debug = require('debug')('app')
const express = require('express')
const favicon = require('serve-favicon')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const url = require('url')
const auth = require('./routes/login')
const routes = require('./routes/index')
const app = express()
const jwt = require('jsonwebtoken')
const { JWT_EXP, JWT_ISSUER, JWT_NAME, JWT_SECRET } = process.env
const NodeCache = require('node-cache')
const appCache = new NodeCache({ stdTTL: JWT_EXP, checkperiod: 120 })
app.locals.appCache = appCache
const adminIds = [process.env.SALESFORCE_ADMIN_ID, '003F000001OKbRtIAL']

require('./lib/hbsHelpers')
app.set('trust proxy', 1)
app.set('views', './views')
app.set('view engine', 'hbs')

app.use(favicon('./public/favicon.ico'))
app.use(logger('dev'))
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static('./public'))

const loggedOutRoutes = [
  '/auth',
  '/auth/google',
  '/auth/google/callback',
  '/logout',
  '/loginfailed'
]

const studentRoutes = [
  '/'
]

app.use((req, res, next) => {
  if (loggedOutRoutes.indexOf(url.parse(req.originalUrl).pathname) !== -1) {
    debug('logged out route')
    next()
  } else {
    if (!req.cookies.hasOwnProperty(JWT_NAME)) {
      res.redirect('/auth')
    } else {
      debug(`cookie: ${JSON.stringify(req.cookies[JWT_NAME], null, 4)}`)
      jwt.verify(req.cookies[JWT_NAME], JWT_SECRET, { issuer: JWT_ISSUER }, (error, decodedToken) => {
        debug(`token decoded: ${JSON.stringify(decodedToken, null, 4)}`)
        if (error) {
          debug(`token error: ${JSON.stringify(error, null, 4)}`)
          res.redirect('/auth')
        } else {
          debug(`seconds to exp: ${JSON.stringify(Math.floor(decodedToken.exp - Date.now() / 1000), null, 4)}`)
          if (decodedToken.exp - Date.now() / 1000 < 30) {
            const newToken = jwt.sign({id: decodedToken.id}, JWT_SECRET, {issuer: JWT_ISSUER, expiresIn: Number(JWT_EXP)})
            res.cookie(JWT_NAME, newToken, { httpOnly: true, secure: true, maxAge: JWT_EXP * 1000 })
            debug('token refreshed')
            res.redirect(req.originalUrl)
          } else {
            debug('valid token')
            req.user = decodedToken.id
            debug(`appCache: ${JSON.stringify(appCache.get(req.user), null, 4)}`)
            if (appCache.get(req.user)) appCache.ttl(req.user, JWT_EXP)
            next()
          }
        }
      })
    }
  }
})

app.use((req, res, next) => {
  if (loggedOutRoutes.indexOf(url.parse(req.originalUrl).pathname) !== -1) {
    debug('admin routes: logged out route')
    next()
  } else if (adminIds.indexOf(req.user) !== -1 || studentRoutes.indexOf(url.parse(req.originalUrl).pathname) !== -1) {
    next()
  } else {
    res.redirect('/auth')
  }
})

app.use('/auth', auth)

app.get('/logout', (req, res) => {
  userRecordIds = []
  req.logout()
  res.redirect('/auth')
})


app.use('/', routes)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: err
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: {}
  })
})

module.exports = app

