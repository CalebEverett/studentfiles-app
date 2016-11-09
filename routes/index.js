const express = require('express')
const router = express.Router()
const Promise = require('bluebird')
const db = require('../lib/db')
const encrypt = require('../lib/encrypt')

/* home page. !req.user */
router.get('/', (req, res, next) => {
  const studentSfId = req.user
  const { appCache } = req.app.locals
  const getUserCache = Promise.promisify(appCache.get, {context: appCache})

  getUserCache(req.user)
  .then(value => {
    if (value && value.allRecords) {
      return res.render('index', value.allRecords)
    } else {
      db.task((t) => {
        return t.batch([
          t.one('SELECT id, student_id__c, name, program__c, program_name__c, status__c, start_date__c, end_date__c, status_start_date__c FROM contact WHERE id=$1', studentSfId),
          t.any("SELECT id, name, echosign_dev1__datesigned__c FROM echosign_dev1__sign_agreement__c WHERE echosign_dev1__status__c = 'Signed' AND echosign_dev1__recipient__c = $1 ORDER BY echosign_dev1__datesigned__c DESC", studentSfId),
          t.any('SELECT id, pathonclient, contentmodifieddate FROM contentversion WHERE islatest = true and student__c = $1 ORDER BY contentmodifieddate DESC', studentSfId),
          t.any('SELECT id, name, createddate FROM attachment WHERE parentid = $1 ORDER BY createddate DESC', studentSfId),
          t.any("SELECT id, contentfilename, createddate, relatedrecordid FROM contactfeed WHERE type = 'ContentPost' AND parentid = $1 ORDER BY createddate DESC", studentSfId),
          t.any('SELECT id, name, createddate FROM attachment WHERE parentid IN (SELECT id FROM financing_package__c WHERE contact2__c = $1) ORDER BY createddate DESC', studentSfId),
          t.any("SELECT id, contentfilename, createddate, relatedrecordid FROM financing_package__feed WHERE type = 'ContentPost' AND parentid IN (SELECT id FROM financing_package__c WHERE contact2__c = $1) ORDER BY createddate DESC", studentSfId)
        ])
      })
      .then((data) => {
        const allRecords = {
          contact: data[0],
          agreements: data[1],
          content: data[2],
          attachments: data[3],
          contactfeed: data[4],
          fpattachments: data[5],
          fpfeed: data[6]
        }

        let userRecordIds = []
        data.forEach(result => {
          if (result.length > 0) {
            result.forEach(row => {
              userRecordIds.push(row.id)
            })
          }
        })

        appCache.set(req.user, { userRecordIds, allRecords })
        userRecordIds = []
        return res.render('index', allRecords)
      })
    }
    return null
  })
  .catch(function (error) {
    console.log(error)
  })
})

router.get('/download/:id', (req, res) => {
  const { appCache } = req.app.locals
  const getUserCache = Promise.promisify(appCache.get, {context: appCache})

  getUserCache(req.user)
  .then(value => {
    if (!value || !value.userRecordIds || value.userRecordIds.indexOf(req.params.id) === -1) {
      return res.redirect('/auth')
    } else {
      db.one('SELECT id, name, contenttype, cipherfile FROM cipherfiles where id = $1', req.params.id)
      .then((download) => {
        return encrypt.getDecryptedFile(download.id, download.cipherfile)
        .then(decrypted => {
          res.set({
            'Content-Type': download.contenttype,
            'Content-Disposition': "inline; filename='" + download.name + "'"
          })
          res.end(Buffer.from(decrypted, 'base64'))
        })
      })
      .catch(error => console.log(error))
    }
  })
})

module.exports = router
