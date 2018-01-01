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
      
      var c0 = this.component('c0')
      c0.add('a:1', function a1(msg, reply) {
        reply({x:++x})
      })
      
      var c1 = this.component('c1')

      // console.log('c0', c0.component$, 'c1', c1.component$)

      var c0_id = c0.component$.id
      var c1_id = c1.component$.id
      var map = this.export('component').map
      
      c1.act('a:1', function(ignore, out) {
        expect(1).equal(out.x)
        expect(map[c0_id].s['a:1'][c1_id].c).equal(1)
        expect(map[c1_id].r['a:1'][c0_id].c).equal(1)

        expect(map[c0_id].s['a:1'][c1_id].t).equal('c1')
        expect(map[c1_id].r['a:1'][c0_id].t).equal('c0')

        expect(map[c0_id].s['a:1'][c1_id].t).equal('s')
        expect(map[c1_id].r['a:1'][c0_id].t).equal('s')
        
        c1.act('a:1', function(ignore, out) {
          expect(2).equal(out.x)
          expect(map[c0_id].s['a:1'][c1_id].c).equal(2)
          expect(map[c1_id].r['a:1'][c0_id].c).equal(2)

          expect(map[c0_id].s['a:1'][c1_id].t).equal('c1')
          expect(map[c1_id].r['a:1'][c0_id].t).equal('c0')
          
          // console.dir(map, {color:true,depth:null})

          fin()
        })
      })
    })
})


lab.test('simple-sub', fin => {
  Seneca()
    .test(fin)
    .use('..')
    .ready(function() {
      var tmp = {c1:0,c2:0}
      
      var c0 = this.component('c0')
      c0.add('a:1')
      
      var c1 = this.component('c1')
      var c2 = this.component('c2')


      var c0_id = c0.component$.id
      var c1_id = c1.component$.id
      var c2_id = c2.component$.id
      var map = this.export('component').map

      c1.sub('a:1', function c1sub() {
        tmp.c1++
      })

      
      c0
        .act('a:1')
        .ready(function () {
          expect(1).equal(tmp.c1)
          expect(map[c0_id].s['a:1'][c1_id].c).equal(1)
          expect(map[c1_id].r['a:1'][c0_id].c).equal(1)
          expect(map[c0_id].s['a:1'][c1_id].t).equal('c1')
          expect(map[c1_id].r['a:1'][c0_id].t).equal('c0')
          expect(map[c0_id].s['a:1'][c1_id].s).equal('a')
          expect(map[c1_id].r['a:1'][c0_id].s).equal('a')

          c2.sub('a:1', function c2sub() {
            tmp.c2++
          })

          c0
            .act('a:1')
            .ready(function () {
              //console.dir(map, {color:true,depth:null})

              expect(map[c0_id].s['a:1'][c1_id].c).equal(2)
              expect(map[c1_id].r['a:1'][c0_id].c).equal(2)

              expect(map[c0_id].s['a:1'][c2_id].c).equal(1)
              expect(map[c2_id].r['a:1'][c0_id].c).equal(1)
              
              expect(2).equal(tmp.c1)
              expect(1).equal(tmp.c2)
              
              fin()
            })
        })
    })    
})
