/* Copyright (c) 2017 Richard Rodger and other contributors, MIT License */
'use strict'


module.exports = function component() {
  var seneca = this

  this.decorate('component', function component() {
    return 'component'
  })
}
