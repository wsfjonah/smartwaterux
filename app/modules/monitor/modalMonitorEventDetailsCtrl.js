/* global angular, dialogService, CanvasJS, __env, Pace, moment */
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
		vm.ok = function () {
			$uibModalInstance.close(vm.selected.item);
		};
		vm.cancel = function () {
			$uibModalInstance.dismiss('cancel');
		};
		vm.header = $translate.instant('site_location_event_title”');
		vm.events = {
			line: [],
			name: "",
			column: [],
			info: {},
			neighbors: [],
			start: null,
			end: null,
			range:{
				start: null,
				end: null
			}
		};
		vm.multiChartTimeSeries = [
			{
				id: "default",
				type: "column",
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

		vm.viewMap= function(){
			modalService.open(__env.modalMonitorEventMap, 'modalMonitorMapCtrl as vm', vm.events.info);
		};

		//add or remove plot
		vm.actionPlot = function(row){
			var isPlot = row.isPlot;
			var id = row.datapoint.pressure._id;
			row.isPlot = (isPlot) ? false : true;
			if(!isPlot){ //call highrate
				var params = {
					id: id,
					name: row.name,
					from: vm.events.start,
					to: vm.events.end
				};
				getHighRateData(params);
			}else{ //remove plot
				var found = false;
				angular.forEach(vm.multiChartTimeSeries, function(row, index){
					if(row.id===id){
						vm.multiChartTimeSeries.splice(index, 1);
						found = true;
					}
				});
				if(found){
					vm.chartEvent.render();
				}
			}
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
				datapoints: getId().join(","),
				resolution: "1n",
				from: vm.events.start,
				to: vm.events.end,
				method: status
			};
			getBulkHighRateData(params);
		};

		vm.chartToolbarOptions = {
			chartElem: 'chartEventContainer',
			min: 0,
			max: 0
		};

		function getId(){
			var ids = [];
			angular.forEach(vm.multiChartTimeSeries, function(row){
				if(row.type==="line"){
					ids.push(row.id);
				}
			});
			return ids;
		}

		function getEventDetailsData(eventId){
			if(angular.isDefined(eventId)){
				apiService.eventDetailsApi(eventId).then(function(response){
					if(angular.isDefined(response.data.tsda.data) && angular.isDefined(response.data.event)){
						vm.events.start = moment(response.data.event.ts).subtract(1, 'minute').format('x');
						vm.events.end = moment(response.data.event.ts).add(1, 'minute').format('x');
						vm.events.range.start = vm.events.start;
						vm.events.range.end = vm.events.end;
						getSiteData(response.data.event.siteid);
						vm.events.info = response.data.event;
						vm.header = response.data.tsda.meta.name+" "+response.data.tsda.meta.unit;
						vm.events.name = response.data.event.sitename;
						vm.events.column.push({x: parseFloat(response.data.event.ts), y: parseFloat(response.data.event.confidence)});
						var obj = {
							id: vm.items.datapointid,
							type: "line",
							xValueType: "dateTime",
							xValueFormatString:"YYYY MM DD HH:mm",
							dataPoints: [],
							name: vm.events.name,
							showInLegend: true
						};
						angular.forEach(response.data.tsda.data, function(value, key){
							obj.dataPoints.push({x: parseFloat(key), y: parseFloat(value)});
						});
						vm.multiChartTimeSeries.unshift(obj);
						vm.chartEvent.render();
					}
				});
			}else{
				dialogService.alert(null,{content:$translate.instant('site_common_something_wrong')});
			}
		}
		//site neighbor table
		function getSiteData(siteId){
			if(angular.isDefined(siteId)){
				apiService.monitorSiteNeighbor(siteId).then(function(response){
					if(angular.isDefined(response.data)){
						angular.forEach(response.data, function(value){
							var obj = value;
							obj.isPlot = false;
							vm.events.neighbors.push(obj);
						});
					}
				});
			}
		}

		function getBulkHighRateData(params){
			apiService.batchTimeSeriesHighRateApi(params).then(function(response){
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

		function getHighRateData(params){
			apiService.timeSeriesHighRateApi(params).then(function(response){
				if(angular.isDefined(response.data)){
					var obj = {
						id: params.id,
						type: "line",
						xValueType: "dateTime",
						xValueFormatString:"YYYY MM DD HH:mm",
						dataPoints: [],
						name: params.name,
						showInLegend: true
					};
					angular.forEach(response.data.data, function(value, key){
						obj.dataPoints.push({x: parseFloat(key), y: parseFloat(value)});
					});
					vm.multiChartTimeSeries.push(obj);
					vm.chartEvent.render();
				}
			});
		}
	});
})();