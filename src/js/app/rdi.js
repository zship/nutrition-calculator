define(function(require) {

	var map = require('mout/object/map');

	var PhysicalQuantity = require('./PhysicalQuantity');
	var Units = require('./Units');

	/*
	 *{
	 *    rdi: NHMRC recommended daily intake
	 *    ul: NHMRC upper limit
	 *    rob: Soylent
	 *    dv: FDA daily value
	 *}
	 */


	var rdiList = {
		fiber: {
			rdi: '30g',
			rob: '40g',
			dv: '25g'
		},
		omega3: {
			rdi: '1.3g'
		},
		omega6: {
			rdi: '13g'
		},
		a: {
			rdi: '3000IU',
			ul: '10000IU',
			rob: '5000IU',
			dv: '5000IU'
		},
		thiamin: {
			rdi: '1.2mg',
			rob: '1.5mg',
			dv: '1.5mg'
		},
		riboflavin: {
			rdi: '1.3mg',
			rob: '1.7mg',
			dv: '1.7mg'
		},
		niacin: {
			rdi: '16mg',
			ul: '35mg',
			rob: '20mg',
			dv: '20mg'
		},
		b6: {
			rdi: '1.3mg',
			ul: '50mg',
			rob: '2mg',
			dv: '2mg'
		},
		b12: {
			rdi: '2.4ug',
			rob: '6ug',
			dv: '6ug'
		},
		folate: {
			rdi: '320ug',
			ul: '1000ug',
			rob: '400ug',
			dv: '400ug'
		},
		pantothenic: {
			rdi: '6mg',
			rob: '10mg',
			dv: '10mg'
		},
		biotin: {
			rdi: '30ug',
			rob: '300ug',
			dv: '300ug'
		},
		choline: {
			rdi: '550mg',
			ul: '3500mg',
		},
		c: {
			rdi: '45mg',
			ul: '1000mg',
			rob: '60mg',
			dv: '60mg'
		},
		d: {
			rdi: '200IU',
			ul: '3200IU',
			rob: '40IU',
			dv: '400IU'
		},
		e: {
			rdi: '10mg',
			ul: '320IU',
			rob: '30IU',
			dv: '30IU'
		},
		k: {
			rdi: '70ug',
			rob: '80ug',
			dv: '80ug'
		},
		calcium: {
			rdi: '1g',
			ul: '2.5g',
			rob: '1g',
			dv: '1000mg'
		},
		chromium: {
			rdi: '35ug',
			ul: '1mg',
			rob: '120ug',
			dv: '120ug'
		},
		copper: {
			rdi: '1.7mg',
			ul: '10mg',
			rob: '2mg',
			dv: '2mg'
		},
		iodine: {
			rdi: '150ug',
			ul: '1100ug',
			rob: '150ug',
			dv: '150ug'
		},
		iron: {
			rdi: '8mg',
			ul: '45mg',
			rob: '18mg',
			dv: '18mg'
		},
		magnesium: {
			rdi: '400mg',
			ul: '400mg',
			rob: '400mg',
			dv: '400mg'
		},
		manganese: {
			rdi: '5.5mg',
			rob: '2mg',
			dv: '2mg'
		},
		molybdenum: {
			rdi: '45ug',
			ul: '2000ug',
			rob: '75ug',
			dv: '75ug'
		},
		phosphorus: {
			rdi: '1g',
			ul: '4g',
			rob: '1g',
			dv: '1000mg'
		},
		potassium: {
			rdi: '3.8g',
			rob: '3.5g',
			dv: '3500mg'
		},
		selenium: {
			rdi: '70ug',
			ul: '400ug',
			rob: '70ug',
			dv: '70ug'
		},
		sodium: {
			rdi: '920mg',
			ul: '2300mg',
			rob: '2.4g',
			dv: '2400mg'
		},
		zinc: {
			rdi: '14mg',
			ul: '40mg',
			rob: '15mg',
			dv: '15mg'
		}
	};

	return map(rdiList, function(val, key) {
		return map(val, function(val) {
			return PhysicalQuantity.parse(val, key);
		});
	});
});
