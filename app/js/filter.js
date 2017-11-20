/* global angular */
(function() {
	'use strict';
	angular
		.module('xProject.filter', [])
		.filter('isObjectEmpty', isObjectEmpty)
		.filter('resourceUrl', resourceUrl);

	function isObjectEmpty(){
		return function(object) {
			return angular.equals({}, object);
		};
	}

	function resourceUrl($sce){
		var version = __env.assetVersion;
		return function(url) {
			return $sce.trustAsResourceUrl(url+"?version="+version);
		};
	}
})();