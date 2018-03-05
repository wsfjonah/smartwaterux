/* global angular, dialogService, CanvasJS */
/* requirements:
*	Event Popup
*	Showing Event Graph - event details API
*	Showing Site Table - neighbour api
*		- display info with "add to plot"
		- added/append to existing event details data
*	Showing Map when open popup by using event details - localization (pipe, sensor)
*		- just display without any action
		- toggle by button
*	Prev 5 Mins & Next 5 Mins - to call highrate api api/tsda/batchquery/highrate
*	https://101.132.100.22/api/tsda/batchquery?token=8905c0ac-1d24-4bb4-9767-dfb3c6ebd784
*/
(function() {
	'use strict';
	var modalMonitorEventDetails = angular.module('modal.monitor.event',[]);
	modalMonitorEventDetails.controller('modalMonitorEventDetailsCtrl', function ($scope, $uibModalInstance, items, apiService, $translate, modalService) {
		var vm = this;
		vm.items = items;
		vm.selected = {
			item: vm.items[0]
		};
		console.log(vm.items);
		//console.log(vm.items);
		vm.ok = function () {
			$uibModalInstance.close(vm.selected.item);
		};
		vm.cancel = function () {
			$uibModalInstance.dismiss('cancel');
		};
		vm.header = $translate.instant('site_location_event_title”');
		vm.events = {
			line: [],
			column: [],
			info: {}
		};
		$uibModalInstance.rendered.then(function(){
			vm.chartEvent = new CanvasJS.Chart("chartEventContainer", {
				theme: 'theme1',
				zoomEnabled: true,
				dataPointWidth: 10,
				title:{
					text: $translate.instant('site_location_event_graph_title'),
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
				data: [
					{
						type: "line",
						xValueType: "dateTime",
						xValueFormatString:"YYYY MM DD HH:mm",
						dataPoints: vm.events.line
					}, {
						type: "column",
						visible: true,
						axisYType: "secondary",
						xValueType: "dateTime",
						xValueFormatString:"YYYY MM DD HH:mm",
						dataPoints: vm.events.column
					}
				],
				rangeChanging: function(e){
					var min = Math.floor(e.axisX[0].viewportMinimum);
					var max = Math.floor(e.axisX[0].viewportMaximum);
					$scope.$apply(function() {
						vm.chartToolbarOptions.min = min;
						vm.chartToolbarOptions.max = max;
					});
				},
			});
			vm.chartEvent.render();
			getEventDetailsData(vm.items.eventId);
		});

		vm.viewMap= function(){
			modalService.open(__env.modalMonitorEventMap, 'modalInfoMap as vm', {name:"Test", longitude: 121.81920253300011, latitude: 30.88555332900003});
		};

		vm.chartToolbarOptions = {
			chartElem: 'chartEventContainer',
			min: 0,
			max: 0
		};


		function getEventDetailsData(eventId){
			if(angular.isDefined(eventId)){
				apiService.eventDetailsApi(eventId).then(function(response){
					Pace.stop();
					console.log('#event details');
					console.log(response.data);
					if(angular.isDefined(response.data.tsda.data)){
						vm.events.info = response.data.event;
						vm.header = response.data.tsda.meta.name+" "+response.data.tsda.meta.unit;
						angular.forEach(response.data.tsda.data, function(value, key){
							vm.events.line.push({x: parseFloat(key), y: parseFloat(value)});
						});
						vm.events.column.push({x: parseFloat(response.data.event.ts), y: parseFloat(response.data.event.confidence)});
						vm.chartEvent.render();
					}
				});
			}else{
				dialogService.alert(null,{content:$translate.instant('site_common_something_wrong')});
			}
		}
	});
})();