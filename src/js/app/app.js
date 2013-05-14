define(function(require) {

	var $ = require('jquery');
	var jade = require('jade');
	var clone = require('mout/lang/deepClone');
	var isString = require('mout/lang/isString');
	var isNumber = require('mout/lang/isNumber');
	var map = require('mout/object/map');
	var reduce = require('mout/object/reduce');
	var parallel = require('deferreds/parallel');

	var Measurement = require('./Measurement');
	var products = require('./products');
	var rdi = require('./rdi');

	require('./view/TargetPicker');


	var _scrollbarWidth = (function() {
		var measure = $('<div></div>').css({
			width: 100,
			height: 100,
			overflow: 'scroll',
			position: 'absolute',
			top: -9999
		}).appendTo('body');
		var ret = measure[0].offsetWidth - measure[0].clientWidth;
		measure.remove();
		return ret;
	})();


	var mainTpl;
	var breakdownTpl;

	var opts = {
		subtractFiber: true
	};

	var draw = function() {
		var adjusted = clone(products)
			.map(function(prod) {
				var entered = $('.e tr[data-prod="' + prod.id + '"]').first().find('.adjust input').val();
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

				if (opts.subtractFiber) {
					if (prod.nutrients.fiber && prod.nutrients.carbohydrate) {
						prod.nutrients.carbohydrate -= prod.nutrients.fiber;
					}
				}

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

		total.percentage = {
			protein: (100 * total.calories.protein / total.calories.total),
			carbohydrate: (100 * total.calories.carbohydrate / total.calories.total),
			fat: (100 * total.calories.fat / total.calories.total)
		};


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
					else if (key === 'price' || key === 'pricePerServing') {
						return val.toFixed(2);
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
						return new Measurement(val, 'g').format();
					}
					if (sectionKey === 'calories') {
						return val.toFixed(0);
					}
					if (sectionKey === 'percentage') {
						return val.toFixed(1) + '%';
					}
					if (key === 'pricePerServing') {
						return val.toFixed(2);
					}
					return '';
				});
			}),
			delta: delta,
			errors: errors
		};

		var html = $(mainTpl(formatted));

		html.find('td').each(function() {
			var className = $(this).attr('class');
			if (errors[className]) {
				$(this).addClass(errors[className]);
			}
		});

		$('#main-content').html(html.clone());

		var widths = $('#main-content tr:first th').map(function() {
			return $(this).outerWidth();
		}).toArray();
		var heights = $('#main-content').find('th:first-child, td:first-child').map(function() {
			return $(this).outerHeight();
		}).toArray();

		$('#main-content').hide();

		heights.forEach(function(height, i) {
			$('#main-content').find('tr').eq(i).css('height', height);
		});

		$('#main-content').show();

		var colgroup = $('<colgroup></colgroup>');
		widths.forEach(function(width) {
			colgroup.append($('<col>').css('width', width));
		});
		var fullWidth = widths.reduce(function(memo, width) {
			return width + memo;
		}, 0);

		$('.table-slice-wrapper').remove();
		var wrapper = $('<div></div>').addClass('table-slice-wrapper');
		['nw', 'ne', 'w', 'e', 'sw', 'se'].forEach(function(direction) {
			var slice = $('<div></div>').addClass('table-slice ' + direction);
			slice.html($('#main-content table').clone());
			slice.find('table').prepend(colgroup.clone());
			slice.find('table').css({
				'table-layout': 'fixed',
				'width': fullWidth
			});
			wrapper.append(slice);
		});

		[
			{
				sections: ['nw', 'w', 'sw'],
				remove: [
					'th:not(:first-child)',
					'td:not(:first-child)',
					'col:not(:first-child)'
				]
			},
			{
				sections: ['nw', 'ne'],
				remove: [
					'tbody',
					'tfoot'
				]
			}
		].forEach(function(obj) {
			obj.sections.forEach(function(section) {
				var slice = wrapper.find('.table-slice.' + section);
				obj.remove.forEach(function(selector) {
					slice.find(selector).remove();
				});
			});
		});

		wrapper.find('.table-slice.nw, .table-slice.w, .table-slice.sw').find('table').css('width', 'auto');

		wrapper.find('.table-slice.w').css('bottom', _scrollbarWidth);
		wrapper.find('.table-slice.sw').css('bottom', _scrollbarWidth);
		wrapper.find('.table-slice.se').css('bottom', _scrollbarWidth);
		wrapper.find('.table-slice.ne').css('right', _scrollbarWidth);
		wrapper.find('.table-slice.se').css('right', _scrollbarWidth);

		$('body').append(wrapper);

		html = breakdownTpl({total: formatted.total});
		$('#breakdown').css({
			width: $('.table-slice.sw').outerWidth(),
			height: $('.table-slice.sw').outerHeight()
		});
		$('#breakdown').html(html);

		$('.adjust input').on('change', function() {
			draw();
		});

		$('.table-slice.e').on('scroll', function() {
			$('.table-slice.w')[0].scrollTop = this.scrollTop;
			$('.table-slice.ne')[0].scrollLeft = this.scrollLeft;
			$('.table-slice.se')[0].scrollLeft = this.scrollLeft;
		});
	};


	parallel(
		$.ajax({
			url: 'tpl.jade',
			dataType: 'text'
		}),
		$.ajax({
			url: 'breakdown.jade',
			dataType: 'text'
		})
	).then(function(mainText, breakdownText) {
		mainTpl = jade.compile(mainText);
		breakdownTpl = jade.compile(breakdownText);
		draw();
	});

});
