'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Constraints = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _CameraModel = require('./CameraModel');

var _CameraModel2 = _interopRequireDefault(_CameraModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Constraints = exports.Constraints = function () {
    function Constraints() {
        _classCallCheck(this, Constraints);

        this.video = {
            facingMode: 'environment'
        };
        this.audio = false;
    }

    _createClass(Constraints, [{
        key: 'switchFacingMode',
        value: function switchFacingMode() {
            var tryAgain = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            if (this.video.facingMode === 'user') {
                this.video.facingMode = 'environment';
            } else if (tryAgain) {
                this.video.facingMode = {
                    exact: 'environment'
                };
            } else {
                this.video.facingMode = 'user';
            }
            return this;
        }
    }, {
        key: 'getConstraint',
        value: function getConstraint() {
            return {
                video: this.video,
                audio: this.audio
            };
        }
    }]);

    return Constraints;
}();

var Camera = function () {
    function Camera(video, canvas) {
        _classCallCheck(this, Camera);

        this.devices = [];
        this.stream = null;
        this.canvasElement = canvas;
        this.videoElement = video;
        this.constraints = new Constraints();
    }

    _createClass(Camera, [{
        key: 'getDevices',
        value: function getDevices() {
            var _this = this;

            return new Promise(async function (resolve, reject) {
                if (_this.devices.length > 0) {
                    resolve(_this.devices);
                    return;
                }
                try {
                    var devices = await navigator.mediaDevices.enumerateDevices();
                    devices.forEach(function (device) {
                        if (device.kind && device.kind.toLocaleLowerCase() === 'videoinput') _this.devices.push(new _CameraModel2.default(device));
                    });
                    resolve(_this.devices);
                } catch (error) {
                    console.error('GetDevices', error);
                    reject(error);
                }
            });
        }
    }, {
        key: 'setVideoConstraints',
        value: function setVideoConstraints(videoConstraints) {
            if (!this.constraints) {
                this.constraints = new Constraints();
            }
            this.constraints.video = videoConstraints;
            return this;
        }
    }, {
        key: 'snap',
        value: function snap() {
            this.canvasElement.width = this.videoElement.videoWidth;
            this.canvasElement.height = this.videoElement.videoHeight;
            var context = this.canvasElement.getContext('2d');
            context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
            context.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);
            return this.canvasElement;
        }
        /**
         * @return String
         */

    }, {
        key: 'snapAsDataUrl',
        value: function snapAsDataUrl() {
            this.snap();
            var data = this.canvasElement.toDataURL('image/png');
            return data;
        }
        /**
         * @return Promise
         */

    }, {
        key: 'snapAsBlob',
        value: function snapAsBlob() {
            var _this2 = this;

            this.snap();
            return new Promise(function (resolve) {
                _this2.canvasElement.toBlob(function (blob) {
                    resolve(blob);
                }, 'image/png', 1);
            });
        }
    }, {
        key: 'start',
        value: function start() {
            var _this3 = this;

            return new Promise(async function (resolve, reject) {
                try {
                    await _this3.getDevices();
                    var stream = await navigator.mediaDevices.getUserMedia(_this3.constraints.getConstraint());
                    _this3.videoElement.srcObject = stream;
                    _this3.stream = stream;
                    resolve();
                } catch (error) {
                    console.error('StartCamera', error);
                    reject(error);
                }
            });
        }
    }, {
        key: 'stop',
        value: function stop() {
            if (!this.videoElement && !this.videoElement.srcObject) return;
            var tracks = this.videoElement.srcObject.getTracks();
            tracks.forEach(function (track) {
                return track.stop();
            });
        }
    }, {
        key: 'switch',
        value: function _switch() {
            var _this4 = this;

            var tryAgain = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            return new Promise(async function (resolve, reject) {
                _this4.constraints = _this4.constraints.switchFacingMode(tryAgain);
                _this4.stop();
                try {
                    await _this4.start();
                    resolve();
                } catch (error) {
                    console.error('SwitchCamera', error);
                    reject(error);
                }
            });
        }
    }], [{
        key: 'isCameraSupported',
        value: function isCameraSupported() {
            return 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
        }
    }, {
        key: 'tryInvokePermission',
        value: function tryInvokePermission(video, canvas) {
            return new Promise(async function (resolve, reject) {
                try {
		            var devices = await navigator.mediaDevices.getUserMedia(new Constraints());
		            resolve(new Camera(video, canvas));
		            
		            devices.getTracks().forEach(function (track) {
				return track.stop();
			 });
                } catch (error) {
                    console.error('MediaDevices', error);
                    reject(error);
                }
            });
        }
    }]);

    return Camera;
}();

exports.default = Camera;
