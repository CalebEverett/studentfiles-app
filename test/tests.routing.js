"use strict";

let should = require('chai').should;
var expect = require('chai').expect;
var pgpOptions = {
  promiseLib: Promise
};
var pgp = require('pg-promise')(pgpOptions);
var db = pgp(process.env.PG_URL);
var content = db.one('SELECT id, body FROM attachment WHERE id NOT IN (SELECT id FROM cipherfiles) LIMIT 1');

describe('Content Download', function () {
  var route = '/downloadcontent/068F0000002EmniIAC'

  describe('Content Download', function () {
  	it('should ')
  })