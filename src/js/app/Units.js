define(function(require) {

	var isNumber = require('mout/lang/isNumber');


	var Units = {};


	Units.parse = function(str) {
		if (str === 0) {
			return;
		}

		if (isNumber(str) || str.search(/^\d+$/g) !== -1) {
			return {
				quantity: parseInt(str, 10),
				unit: 'pill'
			};
		}

		var matches = str.match(/^([\d\.]+)\s*([a-zA-Z%]+)/);
		if (!matches) {
			return;
		}
		return {
			quantity: parseFloat(matches[1], 10),
			unit: matches[2]
		};
	};


	Units.format = function(qty, unit) {
		var ret = qty.toFixed(2);
		ret += ' ';

		if (unit === 'ug') {
			ret += 'μg';
		}
		else {
			ret += unit;
		}

		return ret;
	};


	//key only needed for IU conversions
	var _unitToGramsFactor = function(unit, key) {
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
			case 'iu':
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
			break;
		}
	};


	Units.convert = function(opts) {
		var grams = Units.toGrams(opts.qty, opts.from);
		return grams * (1 / _unitToGramsFactor(opts.to, opts.key));
	};


	Units.toGrams = function(qty, unit, key) {
		return qty * _unitToGramsFactor(unit, key);
	};


	return Units;

});
