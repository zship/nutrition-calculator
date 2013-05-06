define(function(require) {

	var $ = require('jquery');
	var jade = require('jade');
	var map = require('mout/object/map');
	var deepClone = require('mout/lang/deepClone');

	var PhysicalQuantity = require('./PhysicalQuantity');
	var Nutrient = require('./Nutrient');
	var products = require('./products');
	var rdi = require('./rdi');


	var tpl;

	var redraw = function() {
		var adjusted = products
			.map(function(prod) {
				var entered = $('tr[data-prod="' + prod.id + '"]').find('.adjust input').val();
				if (!entered) {
					return prod;
				}
				prod.adjusted = PhysicalQuantity.parse(entered);
				return prod;
			})
			.map(function(prod) {
				if (!prod.adjusted) {
					return prod;
				}

				var ratio;

				if (prod.adjusted.unit === 'pill') {
					ratio = prod.adjusted.qty / prod.serving.qty;
				}
				else {
					ratio = prod.adjusted.asGrams() / prod.serving.asGrams();
				}

				return map(prod, function(nutrient) {
					if (nutrient.constructor === Nutrient) {
						return new Nutrient(nutrient.name, nutrient.qty * ratio + 'g');
					}
					return nutrient;
				});
			});

		var total = adjusted.reduce(function(memo, prod) {
			return map(prod, function(nutrient, key) {
				if (nutrient.constructor === Nutrient || nutrient.constructor === PhysicalQuantity) {
					return nutrient.add(memo[key]);
				}
				return '';
			});
		}, {});

		var errors = map(total, function(nutrient, key) {
			if (['title', 'url', 'serving'].indexOf(key) !== -1) {
				return false;
			}
			if (!rdi[key]) {
				return false;
			}

			if (nutrient.qty < new Nutrient(key, rdi[key].rdi.qty + rdi[key].rdi.unit).qty) {
				return 'low';
			}
			/*
			 *if (rdi[key].dv && nutrient.qty < rdi[key].dv.asGrams()) {
			 *    return 'mid';
			 *}
			 */
			if (rdi[key].ul && nutrient.qty > new Nutrient(key, rdi[key].ul.qty + rdi[key].ul.unit).qty) {
				return 'high';
			}
		});


		var doFormat = function(obj) {
			if (obj.constructor === PhysicalQuantity) {
				if (obj.qty === 0) {
					return '-';
				}
				return obj.format();
			}
			if (obj.constructor === Nutrient) {
				if (obj.qty === 0) {
					return '-';
				}
				return obj.format();
			}
			if (obj === 0) {
				return '-';
			}
			return obj;
		};


		var delta = map(total, function(nutrient, key) {
			if (nutrient.constructor !== Nutrient) {
				return false;
			}

			if (!rdi[key]) {
				return false;
			}

			var d = nutrient.qty - new Nutrient(key, rdi[key].rdi.qty + rdi[key].rdi.unit).qty;
			var sign = (d < 0) ? '-' : '+';
			return sign + (new Nutrient(key, Math.abs(d) + 'g')).format();
		});


		var formatted = {};
		formatted.adjusted = adjusted.map(function(prod) {
			return map(prod, doFormat);
		});
		formatted.total = map(total, doFormat);
		formatted.rdi = map(rdi, function(obj, key) {
			return doFormat(obj.rdi, key);
		});
		formatted.ul = map(rdi, function(obj, key) {
			if (!obj.ul) {
				return '';
			}
			return doFormat(obj.ul, key);
		});


		var html = tpl({
			products: formatted.adjusted,
			rdi: formatted.rdi,
			ul: formatted.ul,
			total: formatted.total,
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
			redraw();
		});
	};


	$.ajax({
		url: 'tpl.jade',
		async: false,
		dataType: 'text'
	}).then(function(response) {
		tpl = jade.compile(response);
		redraw();
	});

});
