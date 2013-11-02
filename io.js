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
      gamepads[0].a = false; trigger_note(0, 'a', gamepads[0].stick); break
    case 83:
      gamepads[0].b = false; trigger_note(0, 'b', gamepads[0].stick); break
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
      gamepads[0].a = false; break
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

  gp.bind(Gamepad.Event.BUTTON_DOWN, function (e) {
    if (e.gamepad.id.match(/Mayflash/)) {
      var a = (e.control === 'LEFT_BOTTOM_SHOULDER') ? true : false
      var b = (e.control === 'FACE_4') ? true : false
    } else {
      var a = (e.control === 'FACE_1') ? true : false
      var b = (e.control === 'FACE_2') ? true : false
    }

    if (a) {
      trigger_note(e.gamepad.index + 1, 'a', gamepads[e.gamepad.index + 1].stick)
    } else if (b) {
      trigger_note(e.gamepad.index + 1, 'b', gamepads[e.gamepad.index + 1].stick)
    }
  })

  utahime.start()

  function trigger_note (index, button, stick) {
    var current_time = utahime.context.currentTime

    utahime[button] = utahime[button] || {}

    if (stick[0] === -1 && stick[1] === -1) { // TOP-LEFT
      var n = 'B#'
    } else if (stick[0] === -1 && stick[1] === 1) { // BOTTOM-LEFT
      var n = 'D#'
    } else if (stick[0] === -1) { // LEFT
      var n = 'C#'
    } else if (stick[0] === 1 && stick[1] === -1) { // TOP-RIGHT
      var n = 'B'
    } else if (stick[0] === 1 && stick[1] === 1) { // BOTTOM-RIGHT
      var n = 'D'
    } else if (stick[0] === 1) { // RIGHT
      var n = 'C'
    } else if (stick[1] === -1) { // TOP
      var n = 'A'
    } else if (stick[1] === 1) { // BOTTOM
      var n = 'E'
    }

    if ((utahime[button][index] || 0) <= current_time) {
      if (button === 'a') {
        if (n) {
          utahime[button][index] = utahime.pulse(current_time, n + '3', 0.5, {
            attack: 0.01, decay: 'eighth', sustain: 0.8, release: 0.1
          })
        }
      } else if (button === 'b') {
        utahime.triangle(current_time, n + '3', {
          attack: 0.01, decay: 'eighth', sustain: 4.0, release: 0.1
        })
        utahime.noise(current_time, {
          attack: 0.01, decay: 'eighth', sustain: 4.0, release: 0.1
        })
      }
    }
  }
})()