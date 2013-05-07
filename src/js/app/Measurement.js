define(function(require) {

	var isNumber = require('mout/lang/isNumber');
	var isString = require('mout/lang/isString');
	var every = require('mout/object/every');
	var forOwn = require('mout/object/forOwn');


	var _siPrefixes = {
		Y: 24,
		Z: 21,
		E: 18,
		P: 15,
		T: 12,
		G: 9,
		M: 6,
		k: 3,
		h: 2,
		da: 1,
		d: -1,
		c: -2,
		m: -3,
		u: -6,
		'μ': -6,
		n: -9,
		p: -12,
		f: -15,
		a: -18,
		z: -21,
		y: -24
	};

	var _rSiPrefixes = function(unit) {
		var sPrefix = Object.keys(_siPrefixes).join('|');
		return new RegExp('(' + sPrefix + ')*' + unit);
	};

	var _units = {
		mass: [
			_rSiPrefixes('g'),
			'oz',
			'lb'
		],
		volume: [
			'fl oz',
			'tsp',
			'tbsp',
			_rSiPrefixes('L'),
		]
	};


	var Measurement = function(qty, unit) {
		if (arguments.length === 1) {
			return Measurement.parse(qty);
		}

		this.qty = qty;
		this.unit = unit;

		every(_units, function(tplList, type) {
			var isUnit = tplList.some(function(tpl) {
				if (isString(tpl)) {
					return unit.toLowerCase() === tpl;
				}
				return unit.search(tpl) !== -1;
			});

			if (isUnit) {
				switch(type) {
					case 'mass':
						this.type = Measurement.Types.MASS;
					break;
					case 'volume':
						this.type = Measurement.Types.VOLUME;
					break;
				}
				return false;
			}
		}.bind(this));
	};


	Measurement.Types = {
		MASS: 1,
		VOLUME: 2
	};


	Measurement.parse = function(str) {
		if (isNumber(str) || str.search(/^\d+$/g) !== -1) {
			return new Measurement(
				parseInt(str, 10),
				'unit'
			);
		}

		var matches = str.match(/^([\d\.]+)\s*([a-zA-Z%\s]+)/);
		if (!matches) {
			return;
		}

		var qty = matches[1].trim();
		var unit = matches[2].trim();

		if (qty.search(/\//) !== -1) {
			matches = qty.match(/(\d+)\/(\d+)/);
			qty = matches[1] / matches[2];
		}
		else {
			qty = parseFloat(qty, 10);
		}

		return new Measurement(qty, unit);
	};


	var _siUnit = (function() {
		var unitList = {
			mass: 'g',
			volume: 'L'
		};
		var ret = {};
		forOwn(Measurement.Types, function(type, key) {
			ret[type] = unitList[key.toLowerCase()];
		});
		return ret;
	})();


	Measurement.prototype.toSiBaseUnit = function() {
		var qty = this.qty;
		var unit = this.unit;

		//convert all non-SI to SI
		switch(unit) {
			case 'oz':
				qty *= 28.3495231;
				unit = 'g';
				break;
			case 'lb':
				qty *= 0.453592;
				unit = 'kg';
				break;
			case 'fl oz':
				qty *= 29.5735;
				unit = 'mL';
				break;
			case 'tsp':
				qty *= 4.92892;
				unit = 'mL';
				break;
			case 'tbsp':
				qty *= 14.7868;
				unit = 'mL';
				break;
		}

		//convert prefixed SI to unprefixed
		var baseUnit = _siUnit[this.type];
		var prefix = unit.match(_rSiPrefixes(baseUnit))[1];
		var exp = _siPrefixes[prefix] || 0;
		qty *= Math.pow(10, exp);
		unit = baseUnit;

		return new Measurement(qty, unit);
	};


	return Measurement;

});
