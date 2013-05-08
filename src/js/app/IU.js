define(function() {

	var _toIuFactor = function(key) {
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
	};


	var IU = {};


	IU.toGrams = function(type, value) {
		return (1 / _toIuFactor(type)) * value;
	};


	IU.fromGrams = function(type, value) {
		return _toIuFactor(type) * value;
	};


	return IU;

});
