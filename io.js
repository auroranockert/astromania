void (function () {
  var gp = new Gamepad(), gamepads = {}, utahime = new 歌姫(120)

  window.Joysticks = gamepads
  window.Songstress = utahime

  gp.bind(Gamepad.Event.CONNECTED, function (device) {
    console.log("Connected " + device.id + " as " + device.index)
  })

  gp.bind(Gamepad.Event.DISCONNECTED, function (device) {
    console.log("Disconnected " + device.id + " from " + device.index)
  })

  gp.bind(Gamepad.Event.TICK, function (pads) {
    pads.map(function (pad) {
      if (pad.id.match(/Mayflash/)) {
        gamepads[pad.index] = { stick: pad.axes.slice(0, 2), a: pad.buttons[6] === 1, b: pad.buttons[3] === 1 }
      } else {
        gamepads[pad.index] = { stick: pad.axes.slice(0, 2), a: pad.buttons[0] === 1, b: pad.buttons[1] === 1 }
      }
    })
  })

  if (!gp.init()) { console.log('failed to init') }

  var piano = utahime.create_instrument()

  gp.bind(Gamepad.Event.BUTTON_DOWN, function (e) {
    if (e.gamepad.id.match(/Mayflash/)) {
      var a = (e.control === 'LEFT_BOTTOM_SHOULDER') ? true : false
      var b = (e.control === 'FACE_4') ? true : false
    } else {
      var a = (e.control === 'FACE_1') ? true : false
      var b = (e.control === 'FACE_2') ? true : false
    }

    if (a && ((utahime[e.gamepad.index] || 0) <= utahime.context.currentTime)) {
      var stick = gamepads[e.gamepad.index].stick

      if (stick[0] === -1 && stick[1] === -1) { // TOP-LEFT
        var n = 'B#4'
      } else if (stick[0] === -1 && stick[1] === 1) { // BOTTOM-LEFT
        var n = 'D#4'
      } else if (stick[0] === -1) { // LEFT
        var n = 'C#4'
      } else if (stick[0] === 1 && stick[1] === -1) { // TOP-RIGHT
        var n = 'B4'
      } else if (stick[0] === 1 && stick[1] === 1) { // BOTTOM-RIGHT
        var n = 'D4'
      } else if (stick[0] === 1) { // RIGHT
        var n = 'C4'
      } else if (stick[1] === -1) { // TOP
        var n = 'A4'
      } else if (stick[1] === 1) { // BOTTOM
        var n = 'E4'
      }

      if (n) {
        utahime[e.gamepad.index] = piano.note('quarter', n)
      }
    }
  })

  // piano.note('quarter', 'C4')
  // piano.note('quarter', 'C4')
  // piano.note('quarter', 'D4')
  // piano.note('quarter', 'E4')
  // piano.note('quarter', 'F4')

  utahime.start()

  window.piano = piano
})()