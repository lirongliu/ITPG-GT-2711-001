'use strict';

function Ball(x, y, a, v) {
	this.x = x;
	this.y = y;
	this.a = a;
	this.v = v;
 	this.init = function() {
 	};

 	this.move = function() {
 		this.x += this.v.x;
 		this.y += this.v.y;
 	};

 	this.updateAcceleration = function(a) {
 		this.a = a;
 	};

 	this.updateVelocity = function() {
 		this.v.x += this.a.x;
 		this.v.y += this.a.y;
 	};
}