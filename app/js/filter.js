/* global angular */
(function() {
	'use strict';
	angular
		.module('xProject.filter', [])
		.filter('isObjectEmpty', isObjectEmpty)
		.filter('fromNow', fromNow)
		.filter('objLimitTo', objLimitTo)
		.filter('resourceUrl', resourceUrl);

	function objLimitTo(){
		return function(obj, limit){
			var keys = Object.keys(obj);
			if(keys.length < 1) return [];
			var ret = new Object();
			var count = 0;
			angular.forEach(keys, function(key, arrayIndex){
				if(count >= limit) return false;
				ret[key] = obj[key];
				count++;
			});
			return ret;
		}
	}

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