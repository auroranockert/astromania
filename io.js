void (function () {
  var gp = new Gamepad(), utahime = new 歌姫(180), gamepads = {}
  
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
      gamepads[pad.index + 1] = gamepads[pad.index + 1] || {}
      gamepads[pad.index + 1].stick = pad.axes.slice(0, 2)
      if (pad.id.match(/Mayflash/)) {
        gamepads[pad.index + 1].a = pad.buttons[6] === 1
        gamepads[pad.index + 1].b = pad.buttons[3] === 1
      } else {
        gamepads[pad.index + 1].a = pad.buttons[0] === 1
        gamepads[pad.index + 1].b = pad.buttons[1] === 1
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

  function trigger_note (index, button, stick) {
    var current_time = utahime.context.currentTime

    utahime[button] = utahime[button] || {}

    if (stick[0] < -0.5 && stick[1] < -0.5) { // TOP-LEFT
      var n = 'B#'
    } else if (stick[0] < -0.5 && stick[1] > 0.5) { // BOTTOM-LEFT
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

    if (n && (utahime[button][index] || 0) <= current_time) {
      if (button === 'a') {
        if (n) {
          var timing = utahime.pulse(current_time, n + '3', 0.5, {
            attack: 0.01, decay: 'eighth', sustain: 0.8, release: 0.1, volume: 2.0
          })

          if (gamepads[index].on_a) {
            gamepads[index].on_a(new Date(utahime.started_at_date.getTime() + 1000 * timing.start), stick)
          }
        }
      } else if (button === 'b') {
        var timing = utahime.triangle(current_time, n + '3', {
          attack: 0.01, decay: 'eighth', sustain: 4.0, release: 0.1, volume: 5.0
        })
        utahime.noise(current_time, {
          attack: 0.01, decay: 'quarter', sustain: 1.0, release: 0.1, volume: 4.0
        })

        if (gamepads[index].on_b) {
          gamepads[index].on_b(new Date(utahime.started_at_date.getTime() + 1000 * timing.start), stick)
        }
      }

      utahime[button][index] = timing.end
    }
  }

  utahime.start()
  
  function bg_music(start_at) {
    adsr = {
      attack: 0.01, decay: 'eighth', sustain: 0.4, release: 0.1, volume: 0.5
    }

    var s00 = start_at
    var s01 = utahime.pulse(s00, 'A#3', 0.5, adsr).end
    var s02 = utahime.pulse(s01, 'D#3', 0.5, adsr).end
    var s03 = utahime.pulse(s02, 'F#3', 0.5, adsr).end
    var s04 = utahime.pulse(s03, 'D#3', 0.5, adsr).end
    var s05 = utahime.pulse(s04, 'F#3', 0.5, adsr).end
    var s06 = utahime.pulse(s05, 'D#3', 0.5, adsr).end
    var s07 = utahime.pulse(s06, 'D#2', 0.5, adsr).end
    var s08 = utahime.pulse(s07, 'A#2', 0.5, adsr).end
    var s09 = utahime.pulse(s08, 'D#3', 0.5, adsr).end
    var s10 = utahime.pulse(s09, 'A#2', 0.5, adsr).end
    var s11 = utahime.pulse(s10, 'F#2', 0.5, adsr).end
    var s12 = utahime.pulse(s11, 'D#2', 0.5, adsr).end
    var s13 = utahime.pulse(s12, 'G#3', 0.5, adsr).end
    var s14 = utahime.pulse(s13, 'D#3', 0.5, adsr).end
    var s15 = utahime.pulse(s14, 'A#2', 0.5, adsr).end
    var s16 = utahime.pulse(s15, 'G#3', 0.5, adsr).end
    var s17 = utahime.pulse(s16, 'A#3', 0.5, adsr).end
    var s18 = utahime.pulse(s17, 'G#3', 0.5, adsr).end
    var s19 = utahime.pulse(s18, 'D3', 0.5, adsr).end
    var s20 = utahime.pulse(s19, 'F3', 0.5, adsr).end
    var s21 = utahime.pulse(s20, 'G#3', 0.5, adsr).end
    var s22 = utahime.pulse(s21, 'D3', 0.5, adsr).end
    var s23 = utahime.pulse(s22, 'F3', 0.5, adsr).end
    var s24 = utahime.pulse(s23, 'D3', 0.5, adsr).end
    var s25 = utahime.pulse(s24, 'F3', 0.5, adsr).end
    var s26 = utahime.pulse(s25, 'D3', 0.5, adsr).end
    var s27 = utahime.pulse(s26, 'F2', 0.5, adsr).end
    var s28 = utahime.pulse(s27, 'A#2', 0.5, adsr).end
    var s29 = utahime.pulse(s28, 'D3', 0.5, adsr).end
    var s30 = utahime.pulse(s29, 'F2', 0.5, adsr).end
    var s31 = utahime.pulse(s30, 'A#2', 0.5, adsr).end
    var s32 = utahime.pulse(s31, 'F2', 0.5, adsr).end
    var s33 = utahime.pulse(s32, 'D3', 0.5, adsr).end
    var s34 = utahime.pulse(s33, 'F3', 0.5, adsr).end
    var s35 = utahime.pulse(s34, 'F2', 0.5, adsr).end

    setTimeout(bg_music.bind(this, s35), (s35 - s00 - 5) * 1000)
  }

  bg_music(utahime.context.currentTime)
})()

void (function () {
  window.Joysticks[0].on_a = function (start, direction) {
    console.log('A: ', start)
  }

  window.Joysticks[0].on_b = function (start, direction) {
    console.log('B: ', start)
  }
})()