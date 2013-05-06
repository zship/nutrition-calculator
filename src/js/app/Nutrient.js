define(function(require) {

	var map = require('mout/object/map');

	var PhysicalQuantity = require('./PhysicalQuantity');
	var rdi = require('./rdi');


	var _standardUnit = map(rdi, function(val) {
		return val.rdi.unit;
	});


	var _iuToGramsFactor = function(key) {
		switch(key) {
			case 'a':
				return 0.3 * 1000 * 1000;
			case 'c':
				return 50 * 1000 * 1000;
			case 'd':
				return 0.025 * 1000 * 1000;
			case 'e':
				return 0.667 * 1000;
		}
	};


	var Nutrient = function(name, qty) {
		this.name = name;
		qty = PhysicalQuantity.parse(qty);

		if (qty.unit === '%') {
			qty = new PhysicalQuantity(rdi[name].dv.qty * 0.01 * qty.qty, rdi[name].dv.unit);
		}
		if (qty.unit.toLowerCase() === 'iu') {
			qty = new PhysicalQuantity((1 / _iuToGramsFactor(this.name)) * qty.qty, 'g');
		}

		this.unit = _standardUnit[this.name] || 'g';
		this.qty = qty.asGrams();
	};


	Nutrient.prototype.add = function(other) {
		if (!other) {
			return this;
		}
		var grams = this.qty + other.qty;
		return new Nutrient(this.name, grams + 'g');
	};


	Nutrient.prototype.format = function() {
		var ret;
		if (this.unit.toLowerCase() === 'iu') {
			ret = this.qty * _iuToGramsFactor(this.name);
		}
		else {
			ret = new PhysicalQuantity(this.qty, 'g').asUnit(this.unit).toFixed(2);
		}
		ret += ' ';

		if (this.unit === 'ug') {
			ret += 'μg';
		}
		else {
			ret += this.unit;
		}

		return ret;
	};


	return Nutrient;

});
