'use strict';

// fullscreen
// chrome.windows.getCurrent(null, function(win) {
// 	chrome.windows.update(win.id, {state: 'fullscreen'});
// });

/**
 * CONFIGURABLE SETTINGS
 */

/**
 * width of on-screen 'preview' video in pixels
 *
 */
var cameraWidth = 960;

/**
 * height of on-screen 'preview' video in pixels
 *
 */
var cameraHeight = 720;

/**
 * number of countdown reps before the snapshot sequence begins
 * 
 */
var countDownCount = 3;

/**
 * duration time in milliseconds between countdown reps
 * 
 */
var countDownInterval = 2000;

/**
 * number of snapshots to capture and then render as animated GIF
 * 
 */
var numberOfImages = 4;

/**
 * duration time in milliseconds between snapshots
 * 
 */
var sequenceInterval = 2000;

/**
 * width of animated GIF
 * 
 */
var outputWidth = 320;

/**
 * height of animated GIF
 * 
 */
var outputHeight = 240;

/**
 * duration time in milliseconds between animated GIF frames
 * 
 */
var playbackInterval = 500;

/**
 * content for pre-populated tweets
 * 
 */
if (!localStorage.getItem('statuses')) {
	localStorage.setItem('statuses',
		[
			'{handles} at the @{}!',
			'{handles} at the @{}!',
			'{handles} at the @{}!'
		].join(',')
	);
}

/************************************************/

/**
 * global variable objects
 * 
 */
var camera, recorder;

var TwitterBooth = {
	/**
	 * content for pre-populated tweets
	 * 
	 */
	init: function() {
		// var videoConstraints = {
		// 	audio: false,
		// 	video: {
		// 		mandatory: { },
		// 		optional: []
		// 	}
		// };

		// navigator.getUserMedia(videoConstraints, function(stream) {
		// 	video.src = URL.createObjectURL(stream);
		// });

		// TwitterBooth.start();

		camera = new Camera();
		camera.startCapture(this.onCameraReady.bind(this), this.onCameraError);
	},

	start: function() {
		this.monitor = new CanvasImage($('#monitor'), cameraWidth, cameraHeight);
		$('#monitor').css({
			'min-width': cameraWidth,
			'min-height': cameraHeight
		});

		TwitterBooth.enableCamera();

		$('#overlay').on('click', function() {
			TwitterBooth.hideDiv('div#overlay');
			TwitterBooth.scenePhotobooth.start(false);
		});

		// $('#startGif').on('click', function() {
		// 	TwitterBooth.hideDiv('div#overlay');
		// 	TwitterBooth.scenePhotobooth.start(false);
		// });

		// $('#startVideo').on('click', function() {
		// 	TwitterBooth.hideDiv('div#overlay');
		// 	TwitterBooth.scenePhotobooth.start(true);
		// });
	},

	restart: function() {
		TwitterBooth.hideDiv('div#interface');
		TwitterBooth.hideDiv('div#preview');
		TwitterBooth.showDiv('div#overlay');
		TwitterBooth.enableCamera();
	},

	onCameraReady: function() {
		this.start();
	},

	onCameraError: function() {
		if ( this.onCameraReady) {
			camera.startCapture(this.onCameraReady.bind(this), this.onCameraError);
		}
	},

	enableCamera: function() {
		this.cameraEnabled = true;
		this.onNewFrame();
	},

	disableCamera: function() {
		this.cameraEnabled = false;
	},

	onNewFrame: function() {
		this.monitor.setImage(camera.video);
		if (this.cameraEnabled) {
			webkitRequestAnimationFrame(this.onNewFrame.bind(this));
		}
	},

	scenePhotobooth: {
		start: function(isVideo) {
			this.countdown = countDownCount;
			this.isVideo = isVideo;
			this.imageCounter = numberOfImages;
			this.gif = null;
			TwitterBooth.imagesArray = [];

			this.countdownShutter();
		},

		countdownShutter: function() {
			if (this.countdown > 0) {
				playSound('chirp');
				$('#countdown').html(this.countdown);

				--this.countdown;
				setTimeout(this.countdownShutter.bind(this), countDownInterval);
			}
			else {
				$('#countdown').html('');

				this.gif = new GIF({
					workers: 4,
					workerScript: 'js/lib/gif.worker.js',
					quality: 10,
					width: outputWidth,
					height: outputHeight
				});

				this.captureSequence();
			}
		},

		captureSequence: function() {
			TwitterBooth.enableCamera();

			if (this.imageCounter > 0) {
				TwitterBooth.disableCamera();
				playSound('shutter');

				//code for capturing sequenced canvas frames
				var imageObject = {};

				imageObject.thumb = new CanvasImage($('<canvas/>'), outputWidth, outputHeight);
				imageObject.thumb.setImage(camera.video);

				this.gif.addFrame(imageObject.thumb.canvas, {delay: playbackInterval});

				TwitterBooth.imagesArray.push(imageObject);				

				// loop for sequence snapshots
				--this.imageCounter;

				setTimeout(function(){
					TwitterBooth.enableCamera();
				}, 1000);
				setTimeout(this.captureSequence.bind(this), sequenceInterval);
			}
			else {
				TwitterBooth.disableCamera();
				TwitterBooth.showLoader();

				this.gif.on('finished', function(blob) {				
					$('#interface button#back').unbind().on('click', function(){
						TwitterBooth.restart();
					});

					$('#interface button#next').unbind().on('click', function(){
						$('#preview img').css({
							'width': 960,
							'height': 720
						});
						var url = URL.createObjectURL(blob)
						$('#preview img').attr('src', url);

						TwitterBooth.scenePhotobooth.loadPreview(blob);
					});

					TwitterBooth.showDiv($('#interface'));
					TwitterBooth.hideLoader();
				});

				this.gif.render();
			}
		},

		loadPreview: function(blob) {
			TwitterBooth.hideDiv($('#interface'));
		
			$('#preview button#back').unbind().on('click', function(){
				TwitterBooth.restart();
			});

			// $('#preview button#next').unbind().on('click', function(){
			// 	// console.log(URL.createObjectURL(blob));
			// 	DropboxBooth.convert( blob );
			// });

			TwitterBooth.showDiv($('#preview'));
		},

		/*
		 * code for starting RTCRecorder which has performance issues on the Nexus 10
		 */
		// startRecording: function() {
		// 	var options = {
		// 		type: this.isVideo ? 'video' : 'gif',
		// 		video: {
		// 			width: $('video').width(),
		// 			height: $('video').height()
		// 		},
		// 		canvas: {
		// 			width: outputWidth,
		// 			height: outputHeight
		// 		}
		// 	};

		// 	recorder = window.RecordRTC(camera.video.src, options);
		// 	recorder.startRecording();

		// 	setTimeout(TwitterBooth.scenePhotobooth.stopRecording, outputDuration);
		// },

		/*
		 * code for stopping RTCRecorder which has performance issues on the Nexus 10
		 */
		// stopRecording: function() {
		// 	if (recorder) {
		// 		recorder.stopRecording(function(url) {
		// 			$('#interface button#back').unbind().on('click', function(){
		// 				TwitterBooth.restart();
		// 			});
		// 			$('#interface button#next').unbind().on('click', function(){
		// 				window.open(url,'_blank');
		// 			});
		// 			TwitterBooth.showDiv($('#interface'));
		// 		});
		// 	}
		// }
	},

	showLoader: function () {
		TwitterBooth.showDiv($('#loader'));
		TwitterBooth.loader.start();

	},

	hideLoader: function () {
		TwitterBooth.hideDiv($('#loader'));
		TwitterBooth.loader.stop();
	},

	loader: {
		start: function () {
			$('#loader img').transition({
				perspective: '200px',
				rotateY: '360deg',
				delay: 1000
			}, function(){
				$('#loader img').transition({rotateY:'0deg'}, 0);
				TwitterBooth.loader.start();
			});
		},

		stop: function () {
			$('#loader img').transitionStop();
		}
	},

	hideDiv: function(div) {
		$(div).transition({opacity:0}, 750, 'snap', function(){
			$(div).css({
				'display':'none',
				'opacity':0
			});
		});
	},

	showDiv: function(div) {
		$(div).css({
			'display':'block',
			'opacity':0
		});
		$(div).transition({opacity:1}, 750, 'snap');
	}
};

$('body').ready(TwitterBooth.init.bind(TwitterBooth));
