/* global angular */
/* 	requirement
*	1. monitor mode
*	- use api - api/tsevent/search/-1/100000000
*	- without paging
*	- view details
*	- setTimer to refresh (no refresh while dialog is open)
*	2. investigate mode
*	- use api - api/tsevent/search/-1/100000000/0
*	- with paging (infinite scroll)
*	- view details
*	- filtering - timerange, site, confidence, tags
*
*	- degree status
*	(low - green), (low-medium - yellow), (medium - orange), (high - red)
*/
(function() {
	'use strict';
	var monitor = angular.module('xProject.monitor',[]);
	monitor.$inject = ['$scope'];
	monitor.controller('monitorController', function monitorController ($scope, apiService, $window, authService, $translate, commonService) {
		var vm = this;
		vm.monitor = {};
		getAnyEvent();

		function getAnyEvent(){
			apiService.eventAnyApi().then(function(response){
				vm.monitor = response.data.event;
			});
		}
		function isObjectEmpty(res){
			return Object.keys(res).length === 0;
		}
	});


})();