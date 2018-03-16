/* global angular, CanvasJS */
(function() {
	'use strict';
	var dashboardNetwork = angular.module('xProject.networkdashboard',[]);
	dashboardNetwork.$inject = ['$scope'];
	dashboardNetwork.controller('dashboardNetworkController', function dashboardNetworkController ($scope, apiService, $timeout, $translate) {
		var vm = this;
		vm.networkChart = [];
		vm.chartTitle = [];
		vm.langMapping = function(key, title){
			var mapping = {
				eventsummary : $translate.instant("site_dashboard_network_event_summary"),
				variation : $translate.instant("site_dashboard_network_variation_summary")
			};
			return (mapping.hasOwnProperty(key)) ? mapping[key] : title;
		};

		/* watch language changed and apply for network chart title
		*/
		$scope.$parent.$watch('vm.currLang', function(newVal, oldVal){
			if(newVal!==oldVal){
				vm.chartTitle.length = 0;
				angular.forEach(vm.networkChart, function(row){
					vm.chartTitle.push(vm.langMapping(row.id, row.desc));
				});
			}
		});

		getNetworkSummary();

		function getNetworkSummary(){
			apiService.dashboardNetworkSummaryApi().then(function(response){
				if(angular.isDefined(response.data)){
					var prefix = "chartContainer_";
					var obj = {};
					vm.chartTitle.length = 0;
					angular.forEach(response.data, function(row, keyChart){
						obj = {};
						obj.id = keyChart;
						obj.desc = row.desc;
						obj.chartId = prefix+obj.id;
						obj.data = [];
						angular.forEach(row.chart, function(value, key){
							obj.data.push({label: key, y: value});
						});
						vm.chartTitle.push(vm.langMapping(obj.id, obj.desc));
						vm.networkChart.push(obj);
					});
					$timeout(function() {
						angular.forEach(vm.networkChart, function(value){
							if (angular.element('#'+value.chartId).length) {
								var chart = new CanvasJS.Chart(value.chartId, {
									theme: 'theme1',
									animationEnabled: true,
									zoomEnabled: true,
									dataPointWidth: 30,
									data: [
										{
											type: "column",
											visible: true,
											dataPoints: value.data
										}
									]
								});
								chart.render();
							}
						});
					});
				}
			});
		}
	});
})();