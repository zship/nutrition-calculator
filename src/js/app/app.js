define(function(require) {

	var $ = require('jquery');
	var jade = require('jade');
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
		var adjusted = products
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
				prod.serving.pricePerServing = '$' + (parseFloat(prod.meta.price.replace(/\$/, ''), 10) / servingsPerUnit).toFixed(2);


				var ratio = prod.serving.adjusted.qty / prod.serving.serving[0].qty;

				prod.nutrients = map(prod.nutrients, function(n) {
					return n * ratio;
				});

				prod.nutrients.calories = prod.nutrients.protein * 4 + prod.nutrients.carbohydrate * 4 + prod.nutrients.fat * 9;

				return prod;
			});

		var total = reduce(adjusted, function(memo, prod) {
			var ret = {};
			forOwn(prod.nutrients, function(nutrient, key) {
				ret[key] = nutrient + (memo[key] || 0);
			});
			ret.pricePerServing = parseFloat(prod.serving.pricePerServing.replace(/\$/,''), 10) + (memo.pricePerServing || 0);
			return ret;
		}, {});

		total.pricePerServing = '$' + total.pricePerServing.toFixed(2);

		var errors = map(total, function(nutrient, key) {
			if (!rdi[key]) {
				return false;
			}

			if (nutrient < rdi[key].rdi) {
				return 'low';
			}
			/*
			 *if (rdi[key].dv && nutrient.qty < rdi[key].dv.asGrams()) {
			 *    return 'mid';
			 *}
			 */
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


		var delta = map(total, function(nutrient, key) {
			if (!rdi[key]) {
				return '';
			}

			var d = nutrient - rdi[key].rdi;
			var sign = (d < 0) ? '-' : '+';
			return sign + (new Measurement(Math.abs(d), 'g')).format();
		});


		var flattened = map(adjusted, function(prod) {
			var ret = {};
			ret.id = prod.id;
			forOwn(prod, function(section, sectionKey) {
				forOwn(section, function(val, key) {
					if (!val) {
						ret[key] = '-';
					}
					else if (sectionKey === 'nutrients') {
						ret[key] = doFormat(new Measurement(val, 'g'));
					}
					else if (sectionKey === 'serving') {
						if (key === 'serving') {
							ret[key] = val[0].format();
							if (val[1]) {
								ret[key] += ' (' + val[1].format() + ')';
							}
						}
						else {
							ret[key] = doFormat(val);
						}
					}
					else {
						ret[key] = val;
					}
				});
			});
			return ret;
		});


		var html = tpl({
			products: flattened,
			rdi: map(rdi, function(obj, key) {
				return doFormat(obj.rdi, key);
			}),
			ul: map(rdi, function(obj, key) {
				if (!obj.ul) {
					return '';
				}
				return doFormat(obj.ul, key);
			}),
			total: map(total, doFormat),
			delta: delta,
			errors: errors
		});
		$('body').html(html);

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
