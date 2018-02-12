/* global angular */
(function() {
	'use strict';
	angular
		.module('xProject.filter', [])
		.filter('isObjectEmpty', isObjectEmpty)
		.filter('fromNow', fromNow)
		.filter('resourceUrl', resourceUrl);

	function isObjectEmpty(){
		return function(object) {
			return angular.equals({}, object);
		};
	}

	function fromNow(){
		return function(timestamp) {
			return moment(timestamp).fromNow();
		};
	}

	function resourceUrl($sce){
		var version = __env.assetVersion;
		return function(url) {
			return $sce.trustAsResourceUrl(url+"?version="+version);
		};
	}
})();