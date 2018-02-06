/* global angular, dialogService, CanvasJS */
(function() {
	'use strict';
	var modalEventDetails = angular.module('modal.event',[]);
	modalEventDetails.controller('modalEventDetailsCtrl', function ($scope, $uibModalInstance, items, apiService, $translate) {
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
			column: []
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

		vm.chartToolbarOptions = {
			chartElem: 'chartEventContainer',
			min: 0,
			max: 0
		};


		function getEventDetailsData(eventId){
			if(angular.isDefined(eventId)){
				apiService.eventDetailsApi(eventId).then(function(response){
					if(angular.isDefined(response.data.tsda.data)){
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