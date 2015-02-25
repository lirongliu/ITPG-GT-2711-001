'use strict';

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

var videoWidth = document.getElementById("video").width;
var videoHeight = document.getElementById("video").height;

/**
 *
 */
var tracker;

/************************************************/


var ball = new Ball(window.innerWidth / 2, window.innerHeight / 2, {x: 0, y: 0}, {x: 0, y: 0});

var startTime = new Date().getTime();

var bestScore = 0;

var end = false;

var last_a = {x: 0, y: 0};

var camera;

function restart() {
    console.log("restart button is clicked");
}

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
            CameraApp.createCanvas();
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

        tracker.on('track', function(event) {
            if (!end) {
                var ax, ay;
                // console.log(event.data);
                if (event.data.length > 0) {
                    event.data.forEach(function(face) {

                        // console.log("face: " + face.x + " " + face.y + " " + face.width + " " + face.height);
                        // console.log("center: " + (face.x + face.width / 2) + " " + (face.y + face.height / 2));
                        var multiplier = 1 + (new Date().getTime() - startTime) / 1000 / 15;
                        ax = -((face.x + face.width / 2) - videoWidth / 2) / videoWidth * multiplier;
                        ay = ((face.y + face.height / 2) - videoHeight / 2) / videoHeight * multiplier;
                        last_a.x = ax;
                        last_a.y = ay;
                        // $('#smiley img').css({
                        //     'left':face.x + $('#video').offset().left,
                        //     'top':face.y + $('#video').offset().top,
                        //     'width':face.width,
                        //     'height':face.height
                        // });
                    });
                } else {
                    ax = last_a.x;
                    ay = last_a.y;
                }
                // console.log(ax + " " + ay);
                ball.updateAcceleration({x: ax, y: ay});
                ball.updateVelocity();
                ball.move();
                CameraApp.updateCanvas(ball.x, ball.y);
                var score = (new Date().getTime() - startTime);
                document.getElementById("score").innerHTML = "Elapsed Time: " + score / 1000 + "s";
                if (ball.x < 0 || ball.x > window.innerWidth || 
                    ball.y < 0 || ball.y > window.innerHeight) {
                    console.log("lose!");
                    if (score > bestScore) {
                        bestScore = score;
                        document.getElementById("bestScore").innerHTML = "Best: " + score / 1000 + "s";
                    }
                    end = true;
                }
            }
        });
    },

    createCanvas: function() {
        this.canvas = document.getElementById("canvas");
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        var ctx = this.canvas.getContext("2d");

        var radius = 20;
        ctx.beginPath();
        ctx.arc(window.innerWidth / 2, window.innerHeight / 2, radius, 0, 2*Math.PI);
        ctx.fillStyle = 'yellow';
        ctx.fill();
    },

    updateCanvas: function(ball_x, ball_y) {
        var ctx = this.canvas.getContext("2d");
        ctx.clearRect ( 0 , 0 , canvas.width, canvas.height);
        // ctx.fillStyle = "#000000";
        // ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        var radius = 20;
        ctx.beginPath();
        // console.log("x: " + ball_x + ", y: " + ball_y);
        ctx.arc(ball_x, ball_y, radius, 0, 2*Math.PI);
        ctx.fillStyle = 'yellow';
        ctx.fill();

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
