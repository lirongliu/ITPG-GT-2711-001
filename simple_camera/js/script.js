'use strict';

// fullscreen kiosk mode
chrome.windows.getCurrent(null, function(win) {
    chrome.windows.update(win.id, {state: 'fullscreen'});
});

/**
 * CONFIGURABLE SETTINGS
 */

/**
 * width of on-screen 'preview' video in pixels
 */
var cameraWidth = 960;

/**
 * height of on-screen 'preview' video in pixels
 */
var cameraHeight = 720;

/**
 *
 */
var tracker;

/************************************************/

var camera;

var CameraApp = {
    /**
     * Instantiate the Camera object.
     */
    init: function()
    {
        // camera = new Camera();
        // camera.startCapture(this.onCameraReady.bind(this), this.onCameraError);

        tracker = new tracking.ObjectTracker('face');
        tracker.setInitialScale(4);
        tracker.setStepSize(2);
        tracker.setEdgesDensity(0.1);

        tracking.track('#video', tracker, { camera: true });

        this.start();
    },

    /**
     * Set a CLICK event listener on the "start" html element. When it is clicked, call the startCamera function
     */
    start: function()
    {
        $('#start').bind('click', function(){
            CameraApp.startCamera();
        });
    },

    /**
     * If the camera is available and ready, create the "monitor" canvas element and its dimensions
     */
    onCameraReady: function() {
        this.monitor = new CanvasImage($('#monitor'), cameraWidth, cameraHeight);
        $('#monitor').css({
            'min-width': cameraWidth,
            'min-height': cameraHeight
        });
    },

    /**
     * If the camera is not available or ready, attempt to re-connect it
     */
    onCameraError: function() {
        if ( this.onCameraReady) {
            camera.startCapture(this.onCameraReady.bind(this), this.onCameraError);
        }
    },

    /**
     * Call the onNewFrame function, but set the camera mode to be ON before making the call
     */
    startCamera: function() {
        $('#start').hide();

        this.cameraEnabled = true;
        // this.onNewFrame();

        var canvas = document.getElementById('canvas');
        var context = canvas.getContext('2d');

        $('#smiley').css({
            'z-index':'10'
        });
        $('#Maria').css({
            'z-index':'10',
            'max-width': '5%',
            'max-height': '10%',
            'bottom': '0',
            'left': '-240px',
            'margin': 'auto', 
            'overflow': 'auto',
            'position': 'fixed',
            'right': '0',
            'top': '-140px',
            'border-style': 'solid',
            'border-color': '#ffffff'
        });
        $('#Will').css({
            'z-index':'10',
            'max-width': '5%',
            'max-height': '10%',
            'bottom': '0',
            'left': '240px',
            'margin': 'auto', 
            'overflow': 'auto',
            'position': 'fixed',
            'right': '0',
            'top': '-140px',
            'border-style': 'solid',
            'border-color': '#ffffff'
        });
        $('#ITP').css({
            'z-index':'10',
            'max-width': '5%',
            'max-height': '10%',
            'bottom': '-260px',
            'left': '240px',
            'margin': 'auto', 
            'overflow': 'auto',
            'position': 'fixed',
            'right': '0',
            'top': '-140px',
            'border-style': 'solid',
            'border-color': '#ffffff'
        });
        $('#Zhen').css({
            'z-index':'10',
            'max-width': '5%',
            'max-height': '10%',
            'bottom': '-260px',
            'left': '-240px',
            'margin': 'auto', 
            'overflow': 'auto',
            'position': 'fixed',
            'right': '0',
            'top': '-140px',
            'border-style': 'solid',
            'border-color': '#ffffff'
        });

        tracker.on('track', function(event) {

            event.data.forEach(function(face) {
                $('#smiley img').css({
                    'left':face.x + $('#video').offset().left,
                    'top':face.y + $('#video').offset().top,
                    'width':face.width,
                    'height':face.height
                });
            //Make boxes relative to video preview width/height
            if(face.x>150 && face.y<50){
                window.location.href = 'http://willjfield.com';
            }
            if(face.x<50 && face.y<50){
                window.location.href = 'http://www.mariafangitp.com/';
            }
            if(face.x<50 && face.y>100){
                window.location.href = 'http://www.kathsome.com/itp2014/';
            }
            if(face.x>150 && face.y>100){
                window.location.href = 'http://itp.nyu.edu/itp/';
            }
                console.log("x: "+face.x);
                console.log("y: "+face.y)
            });

        });
    },

    /**
     * Call the onNewFrame function, but set the camera mode to be OFF before making the call
     */
    stopCamera: function() {
        this.cameraEnabled = false;
    },

    /**
     * Set the "monitor" html element to receive image data from live camera video and render it
     */
    onNewFrame: function() {
        this.monitor.setImage(camera.video);
        if (this.cameraEnabled) {
            requestAnimationFrame(this.onNewFrame.bind(this));
        }
    }
};

/*
* When the html document model is loaded and ready, start the CameraApp's init function
*/
$(document).ready(CameraApp.init.bind(CameraApp));
