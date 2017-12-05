'use strict'

const Lab = require('lab')
const Code = require('code')
const lab = (exports.lab = Lab.script())
const expect = Code.expect

const Seneca = require('seneca')

lab.test('happy', fin => {
  Seneca()
    .test(fin)
    .use('..')
    .ready(function() {
      expect(this.component()).not.null()
      fin()
    })
})
