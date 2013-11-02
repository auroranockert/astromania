void (function () {
  var gp = new Gamepad(), utahime = new 歌姫(120), gamepads = {}
  
  gamepads[0] = {
    stick: [0, 0],
    a: false,
    b: false
  }

  window.Joysticks = gamepads
  window.Songstress = utahime

  document.onkeydown = function (event) {
    switch(event.keyCode) {
    case 37:
      gamepads[0].stick[0] = -1.0; break
    case 38:
      gamepads[0].stick[1] = -1.0; break
    case 39:
      gamepads[0].stick[0] =  1.0; break
    case 40:
      gamepads[0].stick[1] =  1.0; break
    case 65:
      gamepads[0].a = true; break
    case 83:
      gamepads[0].b = true; break
    }

    event.preventDefault()
  }

  document.onkeyup = function (event) {
    switch(event.keyCode) {
    case 37:
    case 39:
      gamepads[0].stick[0] = 0.0; break
    case 38:
    case 40:
      gamepads[0].stick[1] = 0.0; break
    case 65:
      gamepads[0].a = false; trigger_note(0, gamepads[0].stick); break
    case 83:
      gamepads[0].b = false; break
    }

    event.preventDefault()
  }

  gp.bind(Gamepad.Event.CONNECTED, function (device) {
    console.log("Connected " + (device.id + 1) + " as " + device.index)
  })

  gp.bind(Gamepad.Event.DISCONNECTED, function (device) {
    console.log("Disconnected " + (device.id + 1) + " from " + device.index)
  })

  gp.bind(Gamepad.Event.TICK, function (pads) {
    pads.map(function (pad) {
      if (pad.id.match(/Mayflash/)) {
        gamepads[pad.index + 1] = { stick: pad.axes.slice(0, 2), a: pad.buttons[6] === 1, b: pad.buttons[3] === 1 }
      } else {
        gamepads[pad.index + 1] = { stick: pad.axes.slice(0, 2), a: pad.buttons[0] === 1, b: pad.buttons[1] === 1 }
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

    if (a) {
      trigger_note(e.gamepad.index + 1, gamepads[e.gamepad.index + 1].stick)
    }
  })

  utahime.start()

  function trigger_note (index, stick) {
    if ((utahime[index] || 0) <= utahime.context.currentTime) {
      if (stick[0] === -1 && stick[1] === -1) { // TOP-LEFT
        var n0 = 'B#4', n1 = 'B#3', n2 = 'C#3', n3 = 'B#3'
      } else if (stick[0] === -1 && stick[1] === 1) { // BOTTOM-LEFT
        var n0 = 'D#4', n1 = 'D#3', n2 = 'E#3', n3 = 'D#3'
      } else if (stick[0] === -1) { // LEFT
        var n0 = 'C#4', n1 = 'C#3', n2 = 'D#3', n3 = 'C#3'
      } else if (stick[0] === 1 && stick[1] === -1) { // TOP-RIGHT
        var n0 = 'B4', n1 = 'B3', n2 = 'C3', n3 = 'B3'
      } else if (stick[0] === 1 && stick[1] === 1) { // BOTTOM-RIGHT
        var n0 = 'D4', n1 = 'D3', n2 = 'E3', n3 = 'D3'
      } else if (stick[0] === 1) { // RIGHT
        var n0 = 'C4', n1 = 'C3', n2 = 'D3', n3 = 'C3'
      } else if (stick[1] === -1) { // TOP
        var n0 = 'A4', n1 = 'A3', n2 = 'B3', n3 = 'A3'
      } else if (stick[1] === 1) { // BOTTOM
        var n0 = 'E4', n1 = 'E3', n2 = 'F3', n3 = 'E3'
      }

      if (n0) {
        var current_time = utahime.context.currentTime
        utahime[index] = piano.note('eighth', n0, current_time)
        var s2 = piano.note('tripletSixteenth', n1, current_time)
        var s3 = piano.note('tripletSixteenth', n2, s2)
        piano.note('tripletSixteenth', n3, s3)
      }
    }
  }
})()