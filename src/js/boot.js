require.config({

	baseUrl: 'js/',

	paths: {
		'require': './require.js',
		'jquery': 'https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min',
		'mout': 'lib/mout/src',
		'jade': 'lib/jade/jade'
	},

	shim: {
		'jquery': {
			exports: '$'
		},
		'jade': {
			exports: 'jade'
		}
	}

});

require(['app/app']);
