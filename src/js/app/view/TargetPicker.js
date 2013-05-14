define(function(require) {

	require('document.register');


	var TargetPicker = function() {};


	TargetPicker.prototype = Object.create((window.HTMLSelectElement || window.HTMLElement).prototype);


	TargetPicker.prototype.readyCallback = function() {
		//console.log(this);
	};


	TargetPicker.prototype.insertedCallback = function() {
		console.log('here');
	};


	document.register('x-target-picker', {
		'prototype': TargetPicker.prototype
	});

});
