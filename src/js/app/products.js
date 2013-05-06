define(function(require) {

	var mixin = require('mout/object/mixIn');
	var map = require('mout/object/map');

	var defaults = require('./defaults');
	var PhysicalQuantity = require('./PhysicalQuantity');
	var Nutrient = require('./Nutrient');


	var products = [
		/*
		 *{
		 *    title: 'Jevity',
		 *    url: '',
		 *    serving: 1,
		 *    adjusted: 4,
		 *    protein: '13.2g',
		 *    fat: '9.3g',
		 *    omega3: 0,
		 *    omega6: 0,
		 *    carbohydrate: '40.2g',
		 *    fiber: '4.3g',
		 *    a: '1190 IU',
		 *    thiamin: '145ug',
		 *    riboflavin: '0.62mg',
		 *    niacin: '7.2mg',
		 *    b6: '0.72mg',
		 *    b12: '2.2ug',
		 *    folate: '145ug',
		 *    pantothenic: '3.6mg',
		 *    biotin: '110ug',
		 *    choline: '145mg',
		 *    c: '72mg',
		 *    d: '96 IU',
		 *    e: '11 IU',
		 *    k: '20ug',
		 *    calcium: '285mg',
		 *    chromium: '29ug',
		 *    copper: '0.48mg',
		 *    iodine: '36ug',
		 *    iron: '4.3mg',
		 *    magnesium: '96mg',
		 *    manganese: '1.2mg',
		 *    molybdenum: '36ug',
		 *    phosphorus: '285mg',
		 *    potassium: '440mg',
		 *    selenium: '17ug',
		 *    sodium: '325mg',
		 *    zinc: '5.5mg'
		 *},
		 */
		{
			title: 'Whole Oat Powder',
			url: 'http://www.amazon.com/dp/B008QHPVO4',
			serving: '40g',
			fat: '3.2g',
			carbohydrate: '26.4g',
			fiber: '4.1g',
			sodium: '1.7mg',
			potassium: '146mg',
			protein: '5.6g'
		},
		{
			title: 'NOW Foods Carbo Gain Maltodextrin',
			url: 'http://www.amazon.com/dp/B0013OUNRM/',
			serving: '50g',
			carbohydrate: '47g'
		},
		{
			title: 'Whey Powder',
			url: 'http://www.amazon.com/dp/B000QSNYGI',
			serving: '30.4g',
			fat: '1g',
			sodium: '130mg',
			carbohydrate: '3g',
			protein: '24g',
			calcium: '6%',
			iron: '2%'
		},
		{
			title: 'Fitness Fiber',
			url: 'http://www.amazon.com/dp/B003VUHU0O',
			serving: '1tsp',
			adjusted: '6tsp',
			carbohydrate: '6g',
			fiber: '5g'
		},
		{
			title: 'Walnut Oil',
			url: 'http://www.amazon.com/La-Tourangelle-Roasted-Walnut-16-9-Ounce/dp/B001EQ5EJQ/',
			serving: '1 tbsp',
			fat: '14g',
			omega3: '1.414g',
			omega6: '7.194g'
		},
		{
			title: 'Nature\'s Way Alive!',
			url: 'http://www.amazon.com/Alive-Potency-Added-Multivitamin-tablets/dp/B0009F3ROC',
			serving: 3,
			a: '15000IU',
			c: '1000mg',
			d: '1000IU',
			e: '200IU',
			k: '80ug',
			thiamin: '25mg',
			riboflavin: '25mg',
			niacin: '125mg',
			b6: '50mg',
			folate: '400ug',
			b12: '200ug',
			biotin: '325ug',
			pantothenic: '125mg',
			calcium: '250mg',
			iron: '800ug',
			iodine: '150ug',
			magnesium: '125mg',
			zinc: '15mg',
			selenium: '200ug',
			copper: '2mg',
			manganese: '5mg',
			chromium: '250ug',
			molybdenum: '75ug',
			sodium: '15mg',
			potassium: '50mg'
		},
		{
			title: 'Potassium Gluconate',
			url: 'http://www.amazon.com/dp/B0015C2ZI2',
			serving: '1 tsp',
			adjusted: '8 tsp',
			potassium: '540mg'
		},
		{
			title: 'Kirkland Signature Calcium',
			url: 'http://www.amazon.com/Kirkland-Signature-Calcium-500-Count-Tablets',
			serving: 1,
			adjusted: 2,
			calcium: '600mg',
			d: '200%'
		},
		{
			title: 'Life Extension Magnesium Citrate',
			url: 'http://www.amazon.com/Life-Extension-Magnesium-Citrate-Capsules/dp/B000LLULUM/',
			serving: 1,
			adjusted: 2,
			magnesium: '160mg'
		},
		{
			title: 'NOW Foods Iron',
			url: 'http://www.amazon.com/dp/B000WQDD2O',
			serving: 1,
			iron: '18mg'
		},
		{
			title: 'Nature\'s Way Choline',
			url: 'http://www.amazon.com/dp/B00024CRC8',
			serving: 1,
			adjusted: 2,
			choline: '500mg'
		},
		{
			title: 'Swanson Monosodium Phosphate',
			url: 'http://www.amazon.com/gp/product/B008BRBVZW',
			serving: 1,
			adjusted: 4,
			phosphorus: '250mg',
			sodium: '190mg'
		},
		{
			title: 'Jarrow Formulas MSM Sulfur Powder',
			url: 'http://www.amazon.com/dp/B0013OVVHI',
			serving: '1g',
			sulfur: '1g'
		},
		{
			title: 'Morton Iodized Salt 26oz',
			url: 'http://www.amazon.com/Unknown-Morton-Iodized-Salt-26oz/dp/B0019N87XE',
			serving: '0.25tsp',
			sodium: '590mg',
			iodine: '45%'
		}
	];


	return products
		.map(function(prod, i) {
			prod.id = i;
			return prod;
		})
		.map(function(prod) {
			return mixin({}, defaults, prod);
		})
		.map(function(prod) {
			return map(prod, function(val, key) {
				if (['id', 'title', 'url'].indexOf(key) !== -1) {
					return val;
				}

				if (['serving', 'adjusted'].indexOf(key) !== -1) {
					return PhysicalQuantity.parse(val);
				}

				return new Nutrient(key, val);
			});
		});

});
