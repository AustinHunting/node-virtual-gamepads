// Generated by CoffeeScript 1.10.0

/*
Created by MIROOF on 04/03/2015
Virtual gamepad class
 */

(function() {
  var Struct, TimeStruct, config, fs, ioctl, uinput, virtual_gamepad;

  fs = require('fs');

  ioctl = require('ioctl');

  uinput = require('../lib/uinput');

  Struct = require('struct');

  config = require('../config.json');

  if (!config.x64) {
    TimeStruct = function() {
      return Struct().word32Sle('tv_sec').word32Sle('tv_usec');
    };
  } else {
    TimeStruct = function() {
      return Struct().word64Sle('tv_sec').word64Sle('tv_usec');
    };
  }

  virtual_gamepad = (function() {
    function virtual_gamepad() {}

    virtual_gamepad.prototype.connect = function(callback, error) {
      return fs.open('/dev/uinput', 'w+', (function(_this) {
        return function(err, fd) {
          var buffer, input_id, uidev, uinput_user_dev;
          if (err) {
            return error(err);
          } else {
            _this.fd = fd;
            ioctl(_this.fd, uinput.UI_SET_EVBIT, uinput.EV_KEY);
            ioctl(_this.fd, uinput.UI_SET_KEYBIT, uinput.BTN_A);
            ioctl(_this.fd, uinput.UI_SET_KEYBIT, uinput.BTN_B);
            ioctl(_this.fd, uinput.UI_SET_KEYBIT, uinput.BTN_X);
            ioctl(_this.fd, uinput.UI_SET_KEYBIT, uinput.BTN_Y);
            ioctl(_this.fd, uinput.UI_SET_KEYBIT, uinput.BTN_TL);
            ioctl(_this.fd, uinput.UI_SET_KEYBIT, uinput.BTN_TR);
            ioctl(_this.fd, uinput.UI_SET_KEYBIT, uinput.BTN_START);
            ioctl(_this.fd, uinput.UI_SET_KEYBIT, uinput.BTN_SELECT);
            ioctl(_this.fd, uinput.UI_SET_EVBIT, uinput.EV_ABS);
            ioctl(_this.fd, uinput.UI_SET_ABSBIT, uinput.ABS_X);
            ioctl(_this.fd, uinput.UI_SET_ABSBIT, uinput.ABS_Y);
            input_id = Struct().word16Sle('bustype').word16Sle('vendor').word16Sle('product').word16Sle('version');
            uinput_user_dev = Struct().chars('name', uinput.UINPUT_MAX_NAME_SIZE).struct('id', input_id).word32Sle('ff_effects_max').array('absmax', uinput.ABS_CNT, 'word32Sle').array('absmin', uinput.ABS_CNT, 'word32Sle').array('absfuzz', uinput.ABS_CNT, 'word32Sle').array('absflat', uinput.ABS_CNT, 'word32Sle');
            uinput_user_dev.allocate();
            buffer = uinput_user_dev.buffer();
            uidev = uinput_user_dev.fields;
            uidev.name = "Virtual gamepad";
            uidev.id.bustype = uinput.BUS_USB;
            uidev.id.vendor = 0x3;
            uidev.id.product = 0x3;
            uidev.id.version = 2;
            uidev.absmax[uinput.ABS_X] = 255;
            uidev.absmin[uinput.ABS_X] = 0;
            uidev.absfuzz[uinput.ABS_X] = 0;
            uidev.absflat[uinput.ABS_X] = 15;
            uidev.absmax[uinput.ABS_Y] = 255;
            uidev.absmin[uinput.ABS_Y] = 0;
            uidev.absfuzz[uinput.ABS_Y] = 0;
            uidev.absflat[uinput.ABS_Y] = 15;
            return fs.write(_this.fd, buffer, 0, buffer.length, null, function(err) {
              if (err) {
                console.error(err);
                return error(err);
              } else {
                try {
                  ioctl(_this.fd, uinput.UI_DEV_CREATE);
                  return callback();
                } catch (_error) {
                  error = _error;
                  console.error(error);
                  fs.close(_this.fd);
                  _this.fd = void 0;
                  return _this.connect(callback, error);
                }
              }
            });
          }
        };
      })(this));
    };

    virtual_gamepad.prototype.disconnect = function(callback) {
      if (this.fd) {
        ioctl(this.fd, uinput.UI_DEV_DESTROY);
        fs.close(this.fd);
        this.fd = void 0;
        return callback();
      }
    };

    virtual_gamepad.prototype.sendEvent = function(event) {
      var ev, ev_buffer, ev_end, ev_end_buffer, input_event, input_event_end;
      if (this.fd) {
        input_event = Struct().struct('time', TimeStruct()).word16Ule('type').word16Ule('code').word32Sle('value');
        input_event.allocate();
        ev_buffer = input_event.buffer();
        ev = input_event.fields;
        ev.type = event.type;
        ev.code = event.code;
        ev.value = event.value;
        ev.time.tv_sec = Math.round(Date.now() / 1000);
        ev.time.tv_usec = Math.round(Date.now() % 1000 * 1000);
        input_event_end = Struct().struct('time', TimeStruct()).word16Ule('type').word16Ule('code').word32Sle('value');
        input_event_end.allocate();
        ev_end_buffer = input_event_end.buffer();
        ev_end = input_event_end.fields;
        ev_end.type = 0;
        ev_end.code = 0;
        ev_end.value = 0;
        ev_end.time.tv_sec = Math.round(Date.now() / 1000);
        ev_end.time.tv_usec = Math.round(Date.now() % 1000 * 1000);
        fs.writeSync(this.fd, ev_buffer, 0, ev_buffer.length, null);
        return fs.writeSync(this.fd, ev_end_buffer, 0, ev_end_buffer.length, null);
      }
    };

    return virtual_gamepad;

  })();

  module.exports = virtual_gamepad;

}).call(this);
