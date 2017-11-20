/* global angular */
(function() {
	'use strict';
	angular
		.module('xProject.map', [])
		.directive('xMap', xMap);

	//xMap.$inject = [];
	function xMap() {
		console.log('init xmap');
		return{
			restrict: 'AE',
			replace: 'true',
			template: '<h3>Hello World!!</h3>'
		};
	}
})();