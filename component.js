/* Copyright (c) 2017 Richard Rodger and other contributors, MIT License */
'use strict'


// NEXT: pretty print flows

module.exports = function component() {
  var seneca = this

  var map = {}
  
  this.decorate('component', function component(ctag) {
    var cmp = this.delegate()
    cmp.component$ = {
      id: cmp.did,
      ctag: ctag || cmp.did
    }
    return cmp
  })


  // TODO: Seneca should provide an API for this
  this.private$.action_modifiers.push(function component_action_modifier(actdef) {
    actdef.component = this.component$
  })


  this.inward(function(ctxt, data) {
    var m = data.meta
    var cmp = ctxt.seneca.component$ || {}
    var actcmp = ctxt.actdef.component

    if(!m.sync) return
    
    var msgspec = [
      'M',
      m.pattern,
      m.id,

      // receiver
      cmp.id || m.instance,
      cmp.ctag,

      m.version,
      's',
      m.start,
      m.parents.length,
      m.pattern,

      // sender
      actcmp.id,
      actcmp.ctag,
      
      m.version,
    ]

    // TODO: needs to sample
    update(map, msgspec)
  })


  // TODO: Seneca should provide an API for this
  if(this.private$.sub.tracers) {
    this.private$.sub.tracers.push(
      function component_sub_tracer(instance, msg, result, meta, actdef) {
        var m = meta
        var cmp = instance.component$ || {}
        var actcmp = actdef ? actdef.component || {} : {} 
    
        var msgspec = [
          'M',
          m.pattern,
          m.id,

          // receiver
          cmp.id || m.instance,
          cmp.ctag || m.tag,
          
          m.version,
          'a',
          m.start,
          m.parents.length,
          m.pattern,

          // sender
          actcmp.id || m.instance,
          actcmp.ctag || m.tag,

          m.version,
        ]

        // TODO: needs to sample
        update(map, msgspec)
      })
  }


  
  return {
    export: {
      map: map
    }
  }
}


// TODO: same as seneca-monitor; needs stadardising
function update(map, data) {
  var cmd = data[0]

  var o = 1

  var pattern = data[o + 0]

  if (-1 != pattern.indexOf('role:seneca')) {
    return
  }
  
  var sync = data[o + 5]
  var start = data[o + 6]
  
  var rid = data[o + 2]
  var rtag = data[o + 3]
  var rver = data[o + 4]
  
  var sid = data[o + 9]
  var stag = data[o + 10]
  var sver = data[o + 11]
  
  if ('' === pattern || rid === sid) {
    return
  }
  
  var r = (map[rid] = map[rid] || { r: {}, s: {}, t: rtag })
  var s = (map[sid] = map[sid] || { r: {}, s: {}, t: stag })
  
  var rr = (r.r[pattern] = r.r[pattern] || {})
  var sd = (rr[sid] = rr[sid] || {})
  sd.t = stag
  sd.v = sver
  sd.s = sync
  sd.c = 1 + (sd.c || 0)
  sd.w = start
  
  var ss = (s.s[pattern] = s.s[pattern] || {})
  var rd = (ss[rid] = ss[rid] || {})
  rd.t = rtag
  rd.v = rver
  rd.s = sync
  rd.c = 1 + (rd.c || 0)
  rd.w = start
  
  r.last = s.last = start
}
