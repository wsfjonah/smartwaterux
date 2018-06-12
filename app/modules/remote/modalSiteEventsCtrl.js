/* global angular, CanvasJS */
(function() {
	'use strict';
	var modalSiteEventCtrl = angular.module('modal.siteEvent',[]);
	modalSiteEventCtrl.controller('modalSiteEventCtrl', function ($scope, $uibModalInstance, items, apiService, $translate, commonService) {
		var vm = this;
		vm.items = items;
		vm.selected = {
			item: vm.items
		};
		vm.ok = function () {
			$uibModalInstance.close(vm.selected.item);
		};
		vm.cancel = function () {
			$uibModalInstance.dismiss('cancel');
		};
		var title = {
			daily_event: $translate.instant("site_location_table_action_daily_event"),
			weekly_event: $translate.instant("site_location_table_action_weekly_event"),
			daily_reading: $translate.instant("site_location_table_action_daily_reading"),
			weekly_reading: $translate.instant("site_location_table_action_weekly_reading")
		};
		vm.header = title[items.type] +" - "+items.name;
		vm.events = {
			type: items.type,
			id: items.id,
			name: items.name,
			line_chart: []
		};

		/* modal unable to get DOM when initial loaded. used rendered or timeout to achieved.
		*/
		$uibModalInstance.rendered.then(function(){
			vm.chart = new CanvasJS.Chart("chartContainer", {
				theme: 'theme1',
				zoomEnabled: true,
				dataPointWidth: 10,
				title:{
					text: $translate.instant('site_location_timeseries_title'),
					fontSize: 20
				},
				axisY2: {
					includeZero: false,
					minimum: 5,
					title: $translate.instant('site_location_timeseries_event'),
					lineThickness:1,
					labelFontSize: 13,
					titleFontSize: 20
				},
				axisY: {
					includeZero: false,
					title: $translate.instant('site_location_timeseries_data'),
					labelFontSize: 13,
					lineThickness:1,
					titleFontSize: 20
				},
				axisX: {
					labelFontSize: 13,
					lineThickness:1,
					tickThickness:1,
				},
				legend:{
					cursor: "pointer",
					horizontalAlign: "center",
					verticalAlign: "bottom",
					fontSize: 15,
					fontFamily: "Roboto, Helvetica Neue, sans-serif",
					itemclick: vm.toggleDataSeries
				},
				legendText: "Numbers",
				data: vm.events.line_chart
			});
			vm.chart.render();
			initData();
		});

		vm.toggleDataSeries = function(e){
			if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
				e.dataSeries.visible = false;
			} else {
				e.dataSeries.visible = true;
			}
			e.chart.render();
		};

		function initData(){
			if(vm.events.type==="daily_event" || vm.events.type==="weekly_event"){
				getEventSummary();
			}else{
				getReadingSummary();
			}
		}

		function getEventSummary(){
			var type = (vm.events.type==="daily_event") ? "daily" : "weekly";
			apiService.siteEventSummaryApi(type, vm.events.id).then(function(response){
				if(angular.isDefined(response.data)){
					var obj = {};
					angular.forEach(response.data, function(value, index){
						obj = {};
						obj.type = "line";
						obj.name = value.meta.name;
						obj.color = commonService.getColors()[index];
						obj.showInLegend = true;
						obj.xValueType = "dateTime";
						obj.xValueFormatString = "YYYY MM DD HH:mm";
						obj.dataPoints = [];
						angular.forEach(value.event, function(res, time){
							obj.dataPoints.push({
								x: parseInt(time),
								y: parseFloat(res)
							});
						});
						vm.events.line_chart.push(obj);
					});
					vm.chart.render();
				}
			});
		}

		function getReadingSummary(){
			var type = (type==="daily_reading") ? "daily" : "weekly";
			apiService.siteReadingSummaryApi(type, vm.events.id).then(function(response){
				if(angular.isDefined(response.data)){
					var obj = {};
					angular.forEach(response.data, function(value, index){
						obj = {};
						obj.type = "line";
						obj.name = value.meta.name;
						obj.color = commonService.getColors()[index];
						obj.showInLegend = true;
						obj.xValueType = "dateTime";
						obj.xValueFormatString = "YYYY MM DD HH:mm";
						obj.dataPoints = [];
						angular.forEach(value.data, function(res, time){
							obj.dataPoints.push({
								x: parseInt(time),
								y: parseFloat(res)
							});
						});
						vm.events.line_chart.push(obj);
					});
					vm.chart.render();
				}
			});
		}
	});
})();