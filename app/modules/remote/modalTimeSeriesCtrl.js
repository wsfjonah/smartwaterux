/* global angular, moment, dialogService, CanvasJS, __env */
(function() {
	'use strict';
	var modalTimeSeriesModule = angular.module('modal.remote',['daterangepicker','modal.event','modal.highrate']);
	modalTimeSeriesModule.controller('modalTimeSeriesCtrl', function ($uibModalInstance, items, apiService, modalService, $scope, $translate, commonService) {
		var vm = this;
		vm.items = items;
		vm.selected = {
			item: vm.items[0]
		};
		vm.isBatchRequest = (angular.isArray(items)); //single or batch request
		vm.plotData = (vm.isBatchRequest) ? items : [items];
		vm.defaultrange = {
			from: null,
			to: null
		};
		vm.ok = function () {
			$uibModalInstance.close(vm.selected.item);
		};
		vm.cancel = function () {
			$uibModalInstance.dismiss('cancel');
		};
		vm.header = (vm.isBatchRequest) ?  vm.plotData.length +" "+ $translate.instant('site_network_toolbar_sensors') : vm.items.name;
		/*	type of auto data or custom filter result
		*	by default "auto"
		*/
		vm.typeTimeSeries = "auto";
		vm.duration = "1n";
		vm.updateTypeTimeSeries = function(type){ //TODO - make allowed array
			/*	if type not equal to current and type equal to auto
			*	fetch data only when "custom" switch to "auto" - fetch time series any data
			*/
			if(type!==vm.typeTimeSeries && type=="auto"){
				getTimeSeriesAnyData();
				vm.duration = "1n";
			}
			vm.typeTimeSeries = type;
		};

		/* 	toggle switch to view event time series
		*/
		vm.switchEvent = {
			status: false
		};
		/* 	on change event off/on to trigger api
		*/
		vm.onChangeEvent = function(state){
			if(!state){ //if status false, we need to remove event data[1]
				vm.eventData.length = 0;
				/*	remove column data
				*/
				if(vm.chart.options.data.length>=2 && vm.chart.options.data[1].type==="column"){
					vm.chart.options.data.splice(1, 1);
					vm.chart.render();
				}
			}else{ //if status true, we need to fetch data and pass to event updateΩ
				var params = getParams();
				if(vm.typeTimeSeries!=="custom"){ //default parameter to get event
					params.from = vm.defaultrange.from;
					params.to = vm.defaultrange.end;
					params.resolution = "1n";
				}
				apiService.eventSingleRangeApi(params.datapoints, params.from, params.to).then(function(response){
					updateEvent(response.data.event);
				});
			}
		};
		/* option for resolution and model
		*/
		var t_min = $translate.instant('site_location_timeseries_minute'),
			t_day = $translate.instant('site_location_timeseries_day'),
			t_hour = $translate.instant('site_location_timeseries_hour'),
			t_week = $translate.instant('site_location_timeseries_week'),
			t_month = $translate.instant('site_location_timeseries_month');
	    	vm.resolutions = {
	    		model: null,
	    		options: [{"label":"1 "+t_min,"value":"1n"},{"label":"5 "+t_min,"value":"5n"},{"label":"30 "+t_min,"value":"30n"},{"label":"1 "+t_hour,"value":"1h"},{"label":"6 "+t_hour,"value":"6h"},{"label":"12 "+t_hour,"value":"12h"},{"label":"1 "+t_day,"value":"1d"},{"label":"1 "+t_week,"value":"1w"},{"label":"1 "+t_month,"value":"1m"}]
	    	};
	    	/* set initial selected value in option
	    	*/
	    	vm.resolutions.model = vm.resolutions.options[0].value;
	    	/* daterange picker for time series
	    	*/
	    	var start = moment().subtract(1, 'months');
	    	var end = moment();
	    	/* setup daterange picker for filtering
	    	*/
		vm.datePickerDate = {
			date:{
				startDate: start,
				endDate: end
			},
			options:{
				applyClass: "btn-primary",
				cancelClass: "btn-secondary",
				timePicker: true,
				maxDate: new Date()
			}
		};

		/* loop plotdata (single or batch data) for config chart options
		*/
		vm.multiChartTimeSeries = [];
		angular.forEach(vm.plotData, function(value, index){
			vm.multiChartTimeSeries.push({
				type: "line",
				name: value.name,
				color: commonService.getColors()[index],
				showInLegend: true,
				xValueType: "dateTime",
				xValueFormatString:"YYYY MM DD HH:mm",
				dataPoints: []
			});
		});
		vm.eventData = [];

		/* modal unable to get DOM when initial loaded. used rendered or timeout to achieved.
		*/
		$uibModalInstance.rendered.then(function(){
			document.getElementById('daterange_timeseries').innerHTML = start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY');
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
					itemclick: toggleDataSeries,
					horizontalAlign: "center",
					verticalAlign: "bottom",
					fontSize: 15
				},
				legendText: "Numbers",
				rangeChanging: function(e){
					var min = Math.floor(e.axisX[0].viewportMinimum);
					var max = Math.floor(e.axisX[0].viewportMaximum);
					$scope.$apply(function() {
						vm.chartToolbarOptions.min = min;
						vm.chartToolbarOptions.max = max;
					});
				},
				data: vm.multiChartTimeSeries
			});
			vm.chart.render();
			if(vm.isBatchRequest){
				getTimeSeriesBatchData();
			}else{
				getTimeSeriesAnyData();
			}
		});

		vm.chartToolbarOptions = {
			chartElem: 'chartContainer',
			min: 0,
			max: 0
		};

		vm.viewHighRate = function(){
			var id = getId().join(",");
			if(vm.chartToolbarOptions.min>0){
				var params = {
					from: vm.chartToolbarOptions.min,
					to: vm.chartToolbarOptions.max,
					id: id,
					info: vm.plotData[0]
				};
				modalService.open(__env.modalHighRateUrl, 'modalHighRateCtrl as vm', params);
			}
		};

		vm.csvUrl = __env.downloadCsvUrl;

		/* filter button
		*/
		vm.getTimeSeriesFilter = function(){
			var params = getParams();
			if(angular.isDefined(params) && params.datapoints!==""){
				vm.typeTimeSeries = "custom";
				vm.duration = vm.resolutions.model;
				/* get time series by resolution, start & end date
				*/
				if(vm.isBatchRequest){
					apiService.batchTimeSeriesApi(params).then(function(response){
						angular.forEach(response.data, function(row, index){
							vm.multiChartTimeSeries[index].dataPoints.length = 0;
							angular.forEach(row.data, function(value, key){
								vm.multiChartTimeSeries[index].dataPoints.push({
									x: parseInt(key),
									y: parseFloat(value)
								});
							});
						});
						vm.chart.render();
					});
				}else{
					apiService.timeSeriesRangeApi(params).then(function(response){
						if(angular.isDefined(response.data.data)){
							vm.eventData.length = 0;
							vm.multiChartTimeSeries[0].dataPoints.length = 0;
							angular.forEach(response.data.data, function(value, key){
								vm.multiChartTimeSeries[0].dataPoints.push({
									x: parseInt(key),
									y: parseFloat(value)
								});
							});
							vm.chart.render();
						}
					});
				}

				/* if event status is true - we need to get event data as well
				*/
				if(vm.switchEvent.status){
					apiService.eventSingleRangeApi(params.datapoints, params.from, params.to).then(function(response){
						updateEvent(response.data.event);
					});
				}
			}else{
				dialogService.alert(null,{content: $translate.instant('site_common_something_wrong')});
			}
		};
		/* toggle chart legend
		*/
		function toggleDataSeries(e) {
			if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
				e.dataSeries.visible = false;
			} else {
				e.dataSeries.visible = true;
			}
			e.chart.render();
		}
		/* update event data to canvasjs from api
		*/
		function updateEvent(res){
			if(angular.isDefined(res)){
				vm.eventData.length = 0;
				angular.forEach(res, function(value, key){
					vm.eventData.push({x: parseInt(value.timestamp), y: parseFloat(value.confidence), z: key});
				});
				if(vm.chart.options.data.length<=1){
					vm.chart.options.data.push({
						type: "column",
						fillOpacity: .5,
						visible: true,
						axisYType: "secondary",
						xValueType: "dateTime",
						xValueFormatString:"YYYY MM DD HH:mm",
						dataPoints: vm.eventData,
						click: function(e){
							getEventDetails(e.dataPoint.z);
						}
					});
				}
				vm.chart.render();
			}
		}
		/*	get Event Details api
		*	PENDING
		*/
		function getEventDetails(eventId){
			var params = {
				eventId: eventId,
				info: vm.items,
				duration: vm.duration
			};
			modalService.open(__env.modalEventDetailsUrl, 'modalEventDetailsCtrl as vm', params);
		}
		/* get time series ANY data
		*/
		function getTimeSeriesAnyData(){
			var id = getId().join(",");
			if(angular.isDefined(id) && id!==""){
				apiService.timeSeriesAnyApi(id).then(function(response){
					if(angular.isDefined(response.data)){
						vm.defaultrange.from = response.data.meta.starttime;
						vm.defaultrange.end = response.data.meta.endtime;
						vm.multiChartTimeSeries[0].dataPoints.length = 0;
						angular.forEach(response.data.data, function(value, key){
							vm.multiChartTimeSeries[0].dataPoints.push({
								x: parseInt(key),
								y: parseFloat(value)
							});
						});
						vm.chart.render();
					}
				});
				if(vm.switchEvent.status){
					var params = getParams();
					params.from = vm.defaultrange.from;
					params.to = vm.defaultrange.end;
					apiService.eventSingleRangeApi(params.datapoints, params.from, params.to).then(function(response){
						updateEvent(response.data.event);
					});
				}
			}else{
				dialogService.alert(null,{content:$translate.instant('site_common_something_wrong')});
			}
		}
		/* get all the plot data id and return as array
		*/
		function getId(){
			var ids = [];
			if(vm.plotData.length){
				angular.forEach(vm.plotData, function(value){
					ids.push(value.datapoint.pressure._id);
				});
			}
			return ids;
		}
		/* get params
		*/
		function getParams(){
			var params = {},
				res_date = getStartEndDate(),
				ids = getId().join(",");

			params = {
				datapoints: ids,
				resolution: vm.resolutions.model,
				from: res_date.start,
				to: res_date.end
			};
			return params;
		}
		/* get time series batch query data
		*/
		function getTimeSeriesBatchData(){
			var params = getParams();
			if(angular.isDefined(params)){
				apiService.batchTimeSeriesApi(params).then(function(response){
					angular.forEach(response.data, function(row, index){
						vm.multiChartTimeSeries[index].dataPoints.length = 0;
						angular.forEach(row.data, function(value, key){
							vm.multiChartTimeSeries[index].dataPoints.push({
								x: parseInt(key),
								y: parseFloat(value)
							});
						});
					});
					vm.chart.render();
				});
			}else{
				dialogService.alert(null,{content:$translate.instant('site_common_something_wrong')});
			}
		}
		/* return start & end date
		*/
		function getStartEndDate(){
			var res = {
					start : null,
					end: null
				},
				elem = $("#daterange_timeseries"),
				elemData = elem.data('daterangepicker'),
				startDate = moment(elemData.startDate).format('x'),
				endDate = moment(elemData.endDate).format('x');

			res.start = startDate;
			res.end = endDate;
			return res;
		}
	});
})();