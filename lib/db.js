const fs = require('fs')
const Promise = require('bluebird');
const pgpOptions = { promiseLib: Promise }
const pgp = require('pg-promise')(pgpOptions)
const cn = {
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    database: process.env.PG_DB,
    user: process.env.PG_USER,
    password: process.env.PG_PASS,
    ssl: {
        rejectUnauthorized: false,
        ca: process.env.PG_CERT
    }
}
const db = pgp(cn)

module.exports = db

