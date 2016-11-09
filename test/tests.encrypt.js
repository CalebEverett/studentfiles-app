"use strict";

let should = require('chai').should;
var expect = require('chai').expect;
var pgp = require('pg-promise')(pgpOptions);
var db = pgp(process.env.PG_URL);
var encrypt = require('../lib/encrypt');
import encrypt from '../lib/encrypt.js';

const data = db.one('SELECT id, body FROM attachment WHERE id NOT IN (SELECT id FROM cipherfiles) LIMIT 1');

describe('Combined Encryption Buffer', function () {
  it('should have four keys', function () {
     
     console.log(getIv)
     let iv = getIv();
    console.log(iv);
    expect(iv).to.eql(iv);
  });
});