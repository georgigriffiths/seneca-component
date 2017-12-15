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


lab.test('id', fin => {
  Seneca()
    .test(fin)
    .use('..')
    .ready(function() {
      var c0 = this.component()
      var c1 = this.component()
      var c01 = c0.component()

      var c0_id = c0.component$.id
      var c1_id = c1.component$.id
      var c01_id = c01.component$.id

      expect(c0_id).equal(c0.did)
      expect(c1_id).equal(c1.did)
      expect(c01_id).equal(c01.did)
      expect(c01_id).startsWith(c0_id+'/')
      
      fin()
    })
})


lab.test('id', fin => {
  Seneca()
    .test(fin)
    .use('..')
    .ready(function() {
      var c0 = this.component()
      c0.add('a:1')
      var a1_def = c0.find('a:1')

      expect(a1_def.component.id).equal(c0.component$.id)
      
      fin()
    })
})


lab.test('simple-act', fin => {
  Seneca()
    .test(fin)
    .use('..')
    .ready(function() {
      var x = 0
      
      var c0 = this.component()
      c0.add('a:1', function a1(msg, reply) {
        reply({x:++x})
      })
      
      var c1 = this.component()

      console.log('c0', c0.component$, 'c1', c1.component$)
      
      c1.act('a:1', function(ignore, out) {
        console.log(out)
        console.dir(this.export('component').map, {depth: null, colors: true})

        c1.act('a:1', function(ignore, out) {
          console.log(out)
          console.dir(this.export('component').map, {depth: null, colors: true})
          
          fin()
        })
      })
    })
})
