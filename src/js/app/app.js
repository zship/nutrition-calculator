define(function(require) {

	var $ = require('jquery');
	var jade = require('jade');
	var clone = require('mout/lang/deepClone');
	var forOwn = require('mout/object/forOwn');
	var isString = require('mout/lang/isString');
	var isNumber = require('mout/lang/isNumber');
	var map = require('mout/object/map');
	var reduce = require('mout/object/reduce');

	var Measurement = require('./Measurement');
	var products = require('./products');
	var rdi = require('./rdi');


	var tpl;

	var draw = function() {
		var adjusted = clone(products)
			.map(function(prod) {
				var entered = $('tr[data-prod="' + prod.id + '"]').find('.adjust input').val();
				if (!entered) {
					return prod;
				}
				prod.serving.adjusted = Measurement.parse(entered);
				return prod;
			})
			.map(function(prod) {
				if (!prod.serving.adjusted) {
					prod.serving.adjusted = prod.serving.serving[0];
				}

				var servingsPerUnit;
				//requested serving size type (volume or mass) matches product
				//size type, so they're directly comparable
				if (prod.serving.size.type === prod.serving.adjusted.type) {
					try {
						servingsPerUnit = prod.serving.size.toSiBaseUnit().qty / prod.serving.adjusted.toSiBaseUnit().qty;
					}
					//could not be converted to SI ("unit" pill)
					catch(e) {
						servingsPerUnit = prod.serving.size.qty / prod.serving.adjusted.qty;
					}
				}
				//else, use (volume serving size) / (mass serving size)
				else if (
					(prod.serving.adjusted.type === prod.serving.serving[0].type)
					&&
					(prod.serving.size.type === prod.serving.serving[1].type)
				) {
					var volumeToWeight = 1;
					if (prod.serving.serving.length === 2) {
						volumeToWeight = prod.serving.serving[1].toSiBaseUnit().qty / prod.serving.serving[0].qty;
					}
					servingsPerUnit = prod.serving.size.toSiBaseUnit().qty / (prod.serving.adjusted.qty * volumeToWeight);
				}
				prod.serving.servingsPerUnit = servingsPerUnit;
				prod.serving.pricePerServing = prod.meta.price / servingsPerUnit;


				var ratio = prod.serving.adjusted.qty / prod.serving.serving[0].qty;

				prod.nutrients = map(prod.nutrients, function(n) {
					return n * ratio;
				});

				prod.calories = {
					protein: prod.nutrients.protein * 4,
					carbohydrate: prod.nutrients.carbohydrate * 4,
					fat: prod.nutrients.fat * 9
				};

				prod.calories.total = reduce(prod.calories, function(cal, memo) {
					return cal + memo;
				}, 0);

				return prod;
			});


		var total = reduce(adjusted, function(memo, prod) {
			return map(prod, function(section, sectionKey) {
				return map(section, function(val, key) {
					return val + (memo[sectionKey] && memo[sectionKey][key] || 0);
				});
			});
		});


		var errors = map(total.nutrients, function(nutrient, key) {
			if (!rdi[key]) {
				return false;
			}
			if (nutrient < rdi[key].rdi) {
				return 'low';
			}
			if (rdi[key].ul && nutrient > rdi[key].ul) {
				return 'high';
			}
		});


		var doFormat = function(obj) {
			if (isString(obj)) {
				return obj;
			}
			if (obj === 0) {
				return '-';
			}
			if (obj.constructor === Measurement) {
				return obj.format();
			}
			if (isNumber(obj)) {
				return obj.toFixed(1);
			}
			return new Measurement(obj, 'g').format();
		};


		var delta = map(total, function(section, sectionKey) {
			return map(section, function(val, key) {
				if (sectionKey !== 'nutrients') {
					return '';
				}
				if (!rdi[key]) {
					return '';
				}

				var d = val - rdi[key].rdi;
				if (d === 0) {
					return '';
				}
				var sign = (d < 0) ? '-' : '+';
				return sign + (new Measurement(Math.abs(d), 'g')).format();
			});
		});


		adjusted = map(adjusted, function(prod) {
			return map(prod, function(section, sectionKey) {
				if (sectionKey === 'id') {
					return section;
				}
				return map(section, function(val, key) {
					if (!val) {
						return '-';
					}
					else if (sectionKey === 'nutrients') {
						return new Measurement(val, 'g').format();
					}
					else if (sectionKey === 'serving') {
						if (key === 'serving') {
							var f = val[0].format();
							if (val[1]) {
								f += ' (' + val[1].format() + ')';
							}
							return f;
						}
						else {
							return doFormat(val);
						}
					}
					else {
						return val;
					}
				});
			});
		});


		var formatted = {
			products: adjusted,
			rdi: {
				meta: {},
				serving: {},
				calories: {},
				nutrients: map(rdi, function(obj) {
					return new Measurement(obj.rdi, 'g').format();
				}),
			},
			ul: {
				meta: {},
				serving: {},
				calories: {},
				nutrients: map(rdi, function(obj) {
					if (!obj.ul) {
						return '';
					}
					return new Measurement(obj.ul, 'g').format();
				}),
			},
			total: map(total, function(section, sectionKey) {
				return map(section, function(val, key) {
					if (sectionKey === 'nutrients') {
						if (['protein', 'carbohydrate', 'fat'].indexOf(key) !== -1) {
							return (100 * total.calories[key] / total.calories.total).toFixed(1) + '%';
						}
						return new Measurement(val, 'g').format();
					}
					if (sectionKey === 'calories') {
						return val.toFixed(1);
					}
					return '';
				});
			}),
			delta: delta,
			errors: errors
		};

		$('body').html(tpl(formatted));

		$('td').each(function() {
			var className = $(this).attr('class');
			if (errors[className]) {
				$(this).addClass(errors[className]);
			}
		});

		$('.adjust input').on('change', function() {
			draw();
		});
	};


	$.ajax({
		url: 'tpl.jade',
		async: false,
		dataType: 'text'
	}).then(function(response) {
		tpl = jade.compile(response);
		draw();
	});

});
