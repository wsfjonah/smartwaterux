/* global angular, CanvasJS */
(function() {
	'use strict';
	var dashboardNetwork = angular.module('xProject.main',[]);
	dashboardNetwork.$inject = ['$scope', 'authService', '$location', '$http'];
	dashboardNetwork.controller('dashboardNetworkController', function dashboardNetworkController ($scope, authService, $location, apiService) {
		var vm = this;
		vm.project = {
			events: [],
			variations: []
		};

		vm.eventChart = new CanvasJS.Chart("chartEventContainer", {
			theme: 'theme1',
			animationEnabled: true,
			zoomEnabled: true,
			dataPointWidth: 30,
			data: [
				{
					type: "column",
					visible: true,
					//yValueFormatString: "#####0.##\" km\"",
					dataPoints: vm.project.events
				}
			]
		});

		vm.variationChart = new CanvasJS.Chart("chartVariationContainer", {
			theme: 'theme1',
			animationEnabled: true,
			zoomEnabled: true,
			dataPointWidth: 30,
			data: [
				{
					type: "column",
					visible: true,
					//yValueFormatString: "#####0.##\" km\"",
					dataPoints: vm.project.variations
				}
			]
		});
		getEventSummary();
		getVariationSummary();

		function getEventSummary(){
			apiService.dashboardSiteEventSummaryApi().then(function(response){
				if(angular.isDefined(response.data)){
					angular.forEach(response.data, function(value, key){
						vm.project.events.push({label: key, y: value});
					});
					vm.eventChart.render();
				}
			});
		}
		function getVariationSummary(){
			apiService.dashboardSiteVariationSummaryApi().then(function(response){
				if(angular.isDefined(response.data)){
					angular.forEach(response.data, function(value, key){
						vm.project.variations.push({label: key, y: value});
					});
					vm.variationChart.render();
				}
			});
		}
	});
})();