'use strict'

const Lab = require('lab')
const Code = require('code')
const lab = (exports.lab = Lab.script())
const expect = Code.expect

const PluginValidator = require('seneca-plugin-validator')
const Seneca = require('seneca')
const Plugin = require('..')


lab.test('validate', PluginValidator(Plugin, module))

lab.test('happy', fin => {
  Seneca()
    .test(fin)
    .use('..')
    .ready(function() {
      expect(this.component()).not.null()
      fin()
    })
})
