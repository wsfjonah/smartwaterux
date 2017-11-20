/* global angular, dialogService, CanvasJS, Pace */
(function() {
	'use strict';
	var modalHighRate = angular.module('modal.highrate',[]);
	modalHighRate.controller('modalHighRateCtrl', function ($scope, $uibModalInstance, items, apiService, $translate) {
		var vm = this;
		vm.items = items;
		vm.selected = {
			item: vm.items[0]
		};
		vm.ok = function () {
			$uibModalInstance.close(vm.selected.item);
		};
		vm.cancel = function () {
			$uibModalInstance.dismiss('cancel');
		};
		vm.header = vm.items.info.name+" - "+vm.items.info.datapoint.pressure.type+" "+vm.items.info.datapoint.pressure.unit;
		vm.events = {
			line: [],
			column: []
		};
		$uibModalInstance.rendered.then(function(){
			vm.chartHighRate = new CanvasJS.Chart("chartHighRateContainer", {
				theme: 'theme1',
				zoomEnabled: true,
				dataPointWidth: 10,
				title:{
					text: $translate.instant('site_location_highrate_graph_title'),
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
			vm.chartHighRate.render();
			getHighRateData(vm.items);
			getEventData(vm.items);
		});

		vm.chartToolbarOptions = {
			chartElem: 'chartHighRateContainer',
			min: 0,
			max: 0
		};

		function getEventData(res){
			if(angular.isDefined(res)){
				var params = {
					to: res.to,
					duration: Number(res.to) - Number(res.from)
				};
				apiService.eventDurationApi(params).then(function(response){
					if(angular.isDefined(response.data.event)){
						angular.forEach(response.data.event, function(value/*, key*/){
							vm.events.column.push({x: parseFloat(value.timestamp), y: parseFloat(value.sigma)});
						});
						vm.chartHighRate.render();
					}
				});
			}else{
				dialogService.alert(null,{content:$translate.instant('site_common_something_wrong')});
			}
		}


		function getHighRateData(res){
			if(angular.isDefined(res)){
				Pace.restart();
				Pace.track(function(){
					apiService.timeSeriesHighRateApi(res).then(function(response){
						if(angular.isDefined(response.data.data)){
							angular.forEach(response.data.data, function(v, k){
								vm.events.line.push({x: parseFloat(k), y: parseFloat(v)});
							});
							vm.chartHighRate.render();
						}
					});
				});
			}else{
				dialogService.alert(null,{content:$translate.instant('site_common_something_wrong')});
			}
		}
	});
})();