/* global angular, CanvasJS */
(function() {
	'use strict';
	var dashboardScatter = angular.module('xProject.scatterdashboard',[]);
	dashboardScatter.$inject = ['$scope'];
	dashboardScatter.controller('dashboardScatterController', function dashboardScatterController ($scope, apiService, $timeout, $translate) {
		var vm = this;

		var chartData = [
			{id:1, title: "异常大小与时间对比 - 第一路口"},
			{id:2, title: "异常大小与时间对比 - 第二路口"},
			{id:3, title: "异常大小与时间对比 - 第三路口"},
			{id:4, title: "异常大小与时间对比 - 第四路口"},
			{id:5, title: "异常大小与时间对比 - 第五路口"},
			{id:6, title: "异常大小与时间对比 - 第六路口"},
		];
		vm.scatterChart = [];

		getScatterSummary();
		function getScatterSummary(){
			var obj = {};
			var prefix = "chartContainer_";
			for(var i=0, len=chartData.length; i<len; i++){
				obj = {};
				obj.title = chartData[i].title;
				obj.chartId = prefix+chartData[i].id;
				obj.data = scatterData[chartData[i].id];
				vm.scatterChart.push(obj);
			}
			$timeout(function() {
				angular.forEach(vm.scatterChart, function(value){
					if (angular.element('#'+value.chartId).length) {
						var chart = new CanvasJS.Chart(value.chartId, {
							animationEnabled: true,
							zoomEnabled: true,
							colorSet: "red",
							title: {
								text: value.title
							},
							axisX: {
								title:"时间",
								includeZero: true,
								suffix: "",
								crosshair: {
									enabled: true,
									snapToDataPoint: true
								}
							},
							axisY:{
								title: "异常大小",
								includeZero: true,
								gridThickness: 0,
								crosshair: {
									enabled: true,
									snapToDataPoint: true
								}
							},
							data: [{
								type: "scatter",
								xValueType: "dateTime",
								xValueFormatString:"HH:mm",
								toolTipContent: "<b>时间: </b>{x}<br/><b>异常大小: </b>{y}",
								dataPoints: value.data
							}]
						});
						chart.render();
					}
				});
			});
		}
	});
})();