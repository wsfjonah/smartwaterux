/* global angular, CanvasJS, moment */
(function() {
	'use strict';
	var modalEventDetails = angular.module('modal.event',[]);
	modalEventDetails.controller('modalEventDetailsCtrl', function ($scope, $uibModalInstance, items, apiService, $translate, commonService, sweetAlert) {
		var vm = this;
		vm.items = items;
		vm.selected = {
			item: vm.items[0]
		};
		console.log(vm.items);
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
			start: null,
			end: null,
			range:{
				start: null,
				end: null
			},
			tags: []
		};
		vm.multiChartTimeSeries = [
			{
				id: vm.items.info.datapoint.pressure._id,
				type: "line",
				xValueType: "dateTime",
				xValueFormatString:"YYYY MM DD HH:mm",
				dataPoints: vm.events.line
			},
			{
				type: "column",
				fillOpacity: .5, 
				visible: true,
				axisYType: "secondary",
				xValueType: "dateTime",
				xValueFormatString:"YYYY MM DD HH:mm",
				dataPoints: vm.events.column
			}
		];

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
				data: vm.multiChartTimeSeries,
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

		//adjust prev or next 5 minutes
		vm.toggleTime = function(status){
			var range = vm.events.range;
			vm.events.start = (status==="prev") ? moment(parseInt(range.start)).subtract('5', 'minute').format('x') : moment(parseInt(range.end)).format('x');
			vm.events.end = (status==="prev") ? moment(parseInt(range.start)).format('x') : moment(parseInt(range.end)).add('5', 'minute').format('x');
			if(status==="prev"){
				vm.events.range.start = moment(parseInt(vm.events.range.start)).subtract('5', 'minute').format('x');
			}else{ //next
				vm.events.range.end = moment(parseInt(vm.events.range.end)).add('5', 'minute').format('x');
			}
			var params = {
				datapoints: vm.items.info.datapoint.pressure._id,
				resolution: vm.items.duration,
				from: vm.events.start,
				to: vm.events.end,
				method: status
			};
			getBulkHighRateData(params);
		};

		//tagging
		vm.toggleTagging = function(type){
			setTagging(type);
		};

		getTagsList();
		//get tagging list
		function getTagsList(){
			apiService.eventTagsList().then(function(response){
				if(angular.isDefined(response.data)){
					angular.forEach(response.data, function(res){
						vm.events.tags.push({
							name: commonService.tagMapping(res),
							id: res
						});
					});
				}
			});
		}

		//tagging call
		function setTagging(type){
			apiService.eventSetApi(vm.items.eventId, type).then(function(response){
				if(angular.isDefined(response.data.message) && response.data.message==="success"){
					sweetAlert.success({
						title: $translate.instant('site_success_label'),
						text: $translate.instant('site_event_tagging_success')
					});
				}else{
					sweetAlert.error({
						text: $translate.instant('site_common_something_wrong')
					});
				}
				commonService.hidePace();
			});
		}

		function getEventDetailsData(eventId){
			if(angular.isDefined(eventId)){
				apiService.eventDetailsApi(eventId).then(function(response){
					if(angular.isDefined(response.data.tsda.data) && angular.isDefined(response.data.event)){
						vm.header = response.data.tsda.meta.name+" "+response.data.tsda.meta.unit;
						var start = moment(response.data.event.ts).subtract(1, 'minute').format('x');
						var end = moment(response.data.event.ts).add(2, 'minute').format('x');
						vm.events.start = start;
						vm.events.end = end;
						vm.events.range.start = start;
						vm.events.range.end = end;
						angular.forEach(response.data.tsda.data, function(value, key){
							vm.events.line.push({x: parseFloat(key), y: parseFloat(value)});
						});
						vm.events.column.push({x: parseFloat(response.data.event.ts), y: parseFloat(response.data.event.confidence)});
						vm.chartEvent.render();
					}
				});
			}else{
				sweetAlert.error({
					text: $translate.instant('site_common_something_wrong')
				});
			}
		}

		//bulk highrate with datapointid
		function getBulkHighRateData(params){
			apiService.batchTimeSeriesApi(params, '/highrate').then(function(response){
				commonService.hidePace();
				if(angular.isDefined(response.data) && response.data.length){
					//getting new data and append to chart
					var isUpdate = false;
					angular.forEach(response.data, function(row){
						angular.forEach(vm.multiChartTimeSeries, function(resChart, indexChart){
							if(row.meta.datapointid===resChart.id){
								isUpdate = true;
								var arr = [];
								angular.forEach(row.data, function(value, key){
									arr.push({
										x: parseFloat(key),
										y: parseFloat(value)
									});
								});
								//previous need to reverse
								if(params.method==="prev"){
									arr.reverse();
								}
								angular.forEach(arr, function(value){
									if(params.method==="prev"){
										vm.multiChartTimeSeries[indexChart].dataPoints.unshift(value);
									}else{ //next
										vm.multiChartTimeSeries[indexChart].dataPoints.push(value);
									}
								});
							}
						});
					});
					if(isUpdate){
						vm.chartEvent.render();
					}
				}
			});
		}
	});
})();