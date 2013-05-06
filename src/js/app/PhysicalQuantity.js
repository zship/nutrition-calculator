define(function(require) {

	var isNumber = require('mout/lang/isNumber');


	var PhysicalQuantity = function(qty, unit) {
		this.qty = qty;
		this.unit = unit;
	};


	PhysicalQuantity.prototype.add = function(other) {
		if (!other) {
			return this;
		}
		var qty = this.qty + other.asUnit(this.unit);
		return new PhysicalQuantity(qty, this.unit);
	};


	PhysicalQuantity.parse = function(str) {
		if (str === 0) {
			return new PhysicalQuantity(0, '');
		}

		if (isNumber(str) || str.search(/^\d+$/g) !== -1) {
			return new PhysicalQuantity(
				parseInt(str, 10),
				'pill'
			);
		}

		var matches = str.match(/^([\d\.]+)\s*([a-zA-Z%]+)/);
		if (!matches) {
			return;
		}
		return new PhysicalQuantity(
			parseFloat(matches[1], 10),
			matches[2]
		);
	};


	PhysicalQuantity.prototype.format = function() {
		var ret = this.qty.toFixed(2);
		ret += ' ';

		if (this.unit === 'ug') {
			ret += 'μg';
		}
		else {
			ret += this.unit;
		}

		return ret;
	};


	//key only needed for IU conversions
	var _unitToGramsFactor = function(unit) {
		switch(unit.toLowerCase()) {
			case 'g':
				return 1;
			case 'mg':
				return 0.001;
			case 'ug':
				return 0.000001;
			case 'tsp':
				return 4.92892161458;
			case 'tbsp':
				return 15;
			default:
				return 1;
		}
	};


	PhysicalQuantity.prototype.asUnit = function(unit) {
		var grams = this.asGrams();
		return grams * (1 / _unitToGramsFactor(unit));
	};


	PhysicalQuantity.prototype.asGrams = function() {
		return this.qty * _unitToGramsFactor(this.unit);
	};


	return PhysicalQuantity;

});
