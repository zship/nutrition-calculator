define(function(require) {

	//var $ = require('jquery');
	var mixin = require('mout/object/mixIn');
	var map = require('mout/object/map');

	var defaults = require('./defaults');
	var PhysicalQuantity = require('./PhysicalQuantity');
	var Nutrient = require('./Nutrient');
	var Measurement = require('./Measurement');


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
			size: '8 lb',
			price: '$27.99',
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
			serving: '50g', // 1/2 cup
			size: '8 lb',
			price: '$23.48',
			carbohydrate: '47g'
		},
		{
			title: 'Now Foods WHEY PROTEIN',
			url: 'http://www.amazon.com/dp/B0015AQL1Q',
			serving: '28g',
			size: '5 lb',
			price: '$59.19',
			fat: '0.3g',
			carbohydrate: '1g',
			protein: '25g',
			calcium: '125mg',
			phosphorus: '70mg',
			magnesium: '22mg',
			sodium: '40mg',
			potassium: '168mg'
		},
		{
			title: 'Casein Powder',
			url: 'http://www.amazon.com/dp/B002PYLOX6',
			serving: '22g',
			size: '4 lb',
			price: '$51.99',
			fat: '0.4g',
			sodium: '20mg',
			potassium: '19mg',
			protein: '20.4g',
			a: '2%',
			calcium: '71%',
			magnesium: '6%',
			phosphorus: '3%'
		},
		{
			title: 'Fitness Fiber',
			url: 'http://www.amazon.com/dp/B003VUHU0O',
			serving: '1tsp',
			size: '30tsp',
			price: '$4.89',
			adjusted: '6tsp',
			carbohydrate: '6g',
			fiber: '5g'
		},
		{
			title: 'Walnut Oil',
			url: 'http://www.amazon.com/dp/B001EQ5EJQ/',
			serving: '1 tbsp (14g)',
			size: (16.9 * 3) + 'fl oz',
			price: '$23.97',
			fat: '14g',
			omega3: '1.414g',
			omega6: '7.194g'
		},
		{
			title: 'Nature\'s Way Alive! Liquid',
			url: 'http://www.amazon.com/dp/B0019I8NXS',
			serving: '2tbsp',
			size: '30 fl oz',
			//size: '887mL',
			price: '$19.09',
			a: '10000IU',
			c: '500mg',
			d: '400IU',
			e: '200IU',
			k: '80ug',
			thiamin: '25mg',
			riboflavin: '25mg',
			niacin: '20mg',
			b6: '50mg',
			folate: '400ug',
			b12: '200ug',
			biotin: '300ug',
			pantothenic: '125mg',
			calcium: '100mg',
			iron: '450ug',
			iodine: '150ug',
			magnesium: '40mg',
			zinc: '15mg',
			selenium: '70ug',
			copper: '2mg',
			manganese: '4mg',
			chromium: '120ug',
			molybdenum: '75ug',
			sodium: '10mg',
			potassium: '50mg'
		},
		{
			title: 'Potassium Gluconate',
			url: 'http://www.amazon.com/dp/B0015C2ZI2',
			serving: '1 tsp (3.48g)',
			size: '1lb',
			price: '$14.59',
			adjusted: '8 tsp',
			potassium: '540mg'
		},
		{
			title: 'Now Foods Calcium Carbonate',
			url: 'http://www.amazon.com/dp/B000ZL1XUK',
			serving: '1/2 tsp (1.5g)',
			adjusted: 1,
			size: '12oz',
			price: '$10.23',
			calcium: '600mg'
		},
		{
			title: 'NOW Foods Magnesium Citrate Powder',
			url: 'http://www.amazon.com/dp/B004189JCW',
			serving: '0.5tsp (1.9g)',
			size: '8oz',
			price: '$6.99',
			magnesium: '315mg'
		},
		{
			title: 'NOW Foods Iron',
			url: 'http://www.amazon.com/dp/B000WQDD2O',
			serving: 1,
			size: 120,
			price: '$7.78',
			iron: '18mg'
		},
		{
			title: 'Nature\'s Way Choline',
			url: 'http://www.amazon.com/dp/B00024CRC8',
			serving: 1,
			adjusted: 2,
			size: 100,
			price: '$9.17',
			choline: '500mg'
		},
		{
			title: 'Swanson Monosodium Phosphate',
			url: 'http://www.amazon.com/dp/B008BRBVZW',
			serving: '1g',
			adjusted: '4g',
			size: '113g',
			price: '$3.99',
			phosphorus: '250mg',
			sodium: '190mg'
		},
		{
			title: 'Jarrow Formulas MSM Sulfur Powder',
			url: 'http://www.amazon.com/dp/B0013OVVHI',
			serving: '1g',
			size: '200g',
			price: '$10.02',
			sulfur: '1g'
		},
		{
			title: 'Morton Iodized Salt 26oz',
			url: 'http://www.amazon.com/dp/B0019N87XE',
			serving: '0.25tsp (1.5g)',
			size: '26oz',
			price: '$7.49',
			sodium: '590mg',
			iodine: '45%'
		}
	];


	products.forEach(function(prod) {
		console.log(new Measurement(prod.size).toSiBaseUnit());
		if (prod.serving.constructor !== String) {
			return;
		}
		console.log(prod.title, prod.serving.search(/g/));
		/*
		 *if (prod.size) {
		 *    return;
		 *}
		 *var url = prod.url.match(/amazon\.com\/(.*)/)[1];
		 *$.get('/api/' + url).then(function(response) {
		 *    var weightNode = $(response).find('#product-description_feature_div .disclaim:contains("Size")');
		 *    if (!weightNode.length) {
		 *        var title = $(response).find('#btAsinTitle').text();
		 *        console.log(prod.title, title);
		 *        return;
		 *    }
		 *    var weight = weightNode.text();
		 *    console.log(prod.title, weight);
		 *});
		 */
	});


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
				if (['id', 'title', 'url', 'price'].indexOf(key) !== -1) {
					return val;
				}

				if (['serving', 'adjusted'].indexOf(key) !== -1) {
					return PhysicalQuantity.parse(val);
				}

				return new Nutrient(key, val);
			});
		});

});
