define(function(require) {

	var tpl = require('jade!./TargetPicker');
	var $ = require('jquery');
	require('document.register');


	var TargetPicker = function() {};


	TargetPicker.prototype = Object.create((window.HTMLSelectElement || window.HTMLElement).prototype);


	TargetPicker.prototype.readyCallback = function() {
		var $el = $(this);
		var active = $el.find('x-option').first().text();
		this.innerHTML = tpl({active: active});
		//console.log(this);
	};


	TargetPicker.prototype.insertedCallback = function() {
		//console.log('here');
	};


	document.register('x-target-picker', {
		'prototype': TargetPicker.prototype
	});

});
