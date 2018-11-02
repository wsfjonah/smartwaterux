/* global angular, CanvasJS */
(function() {
	'use strict';
	var dashboardScatter = angular.module('xProject.scatterdashboard',[]);
	dashboardScatter.$inject = ['$scope'];
	dashboardScatter.controller('dashboardScatterController', function dashboardScatterController ($scope, apiService, $timeout, $translate) {
		var vm = this;

		var chartData = [
			{id:1, title: "异常大小与时间对比 - 江山路云水路（新昇半导体）5a6eb4e70b272a1f64fa26b2"},
			{id:2, title: "异常大小与时间对比 - 江山路妙香路 5a6eb4e70b272a1f64fa26ba"},
			{id:3, title: "异常大小与时间对比 - 沧海路妙香路（五七路妙香路泵站） 5a6eb4e70b272a1f64fa26b3"},
			{id:4, title: "异常大小与时间对比 - 江山路倚天路 5a6eb4e70b272a1f64fa26b4"},
			{id:5, title: "异常大小与时间对比 - 万水路新元南路 5a6eb4e70b272a1f64fa26b5"},
			{id:6, title: "异常大小与时间对比 - 南芦公路（芦潮港，果园泵站） 5a6eb4e70b272a1f64fa26b7"},
			{id:7, title: "异常大小与时间对比 - 芦五公路 5a6eb4e70b272a1f64fa26b8"},
			{id:8, title: "异常大小与时间对比 - 倚天路沧海路 5a6eb4e70b272a1f64fa26b9"},
			{id:9, title: "异常大小与时间对比 - 层林路沧海路（上海电气） 5a6eb4e70b272a1f64fa26bc"},
			{id:10, title: "异常大小与时间对比 - 江山路天高路 5a6eb4e70b272a1f64fa26bb"},
			{id:11, title: "异常大小与时间对比 - 沧海路中（中港柴油机制造）5a6eb4e70b272a1f64fa26b6"},
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
								click: function(e){window.open("/ux/transient/transient.html?eventid="+e.dataPoint.id);},
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