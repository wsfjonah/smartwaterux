/* global angular */
/* 	requirement
*	1. monitor mode
*	- use api - api/tsevent/search/-1/100000000
*	- without paging
*	- view details
*	- setTimer to refresh (no refresh while dialog is open)
*	2. investigate mode
*	- use api - api/tsevent/search/-1/100000000/0
*	- with paging (infinite scroll)
*	- view details
*	- filtering - enddate, duration, confidence, tags
*	- If filtering enddate is today date, then assign -1 instead - /api/tsevent/search/-1{end}/432000000{duration}/
*	- filter duration formula - (1d) 24x3600x1000 - /api/tsevent/search/-1/432000000{duration}/
*
*	- degree status
*	(low - green), (low-medium - yellow), (medium - orange), (high - red)
*/
(function() {
	'use strict';
	var monitor = angular.module('xProject.monitor', ['infinite-scroll', 'daterangepicker']);
	monitor.$inject = ['$scope'];
	monitor.controller('monitorController', function monitorController ($scope, apiService, $window, $translate, $interval, modalService) {
		var vm = this;
		vm.timer = 30000; //30 seconds
		vm.duration = 2592000000; //10000000000 - 115days - 2592000000 - 30days
		vm.monitor = [];
		vm.monitorPage = {
			limitTo: 500,
			max: 0,
			button: false
		};
		vm.isTimer = true;
		vm.tabMode = "monitor";
		vm.invest = {
			paging: "-1",
			busy: false,
			results: [],
			isFilter: false
		};
		vm.filter = {
			tag:{
				model: null,
				options:[
					{
						id: 'valve_open',
						name: 'Valve Open'
					},{
						id: 'valve_close',
						name: 'Valve Close'
					}
				]
			},
			operation:{
				model: null,
				options:[
					{
						id: 'auto',
						name: 'Auto'
					},{
						id: 'manual',
						name: 'Manual'
					}
				]
			},
			duration:{
				model: null,
				options:[
					{
						id: 1,
						name: 'Last 1 Day'
					},{
						id: 2,
						name: 'Last 2 Days'
					}
				]
			}
		};
		vm.filter.duration.model = vm.filter.duration.options[0];
		vm.filter.tag.model = vm.filter.tag.options;
		vm.filter.operation.model = vm.filter.operation.options;
    		var start = moment();
		vm.datePickerDate = {
			date:{
				startDate: start
			},
			options:{
				singleDatePicker: true,
				applyClass: "btn-primary",
				cancelClass: "btn-secondary",
				timePicker: true,
				maxDate: new Date()
			}
		};

		vm.loadmoreMonitor = function(){
			if(vm.monitorPage.limitTo < vm.monitorPage.max){
				vm.monitorPage.limitTo = vm.monitorPage.limitTo+500;
				vm.monitorPage.button = true;
			}else{
				vm.monitorPage.button = false;
			}
		};

		vm.showFilterMonitor = function(){
			vm.invest.isFilter = true;
			loadInvestigateEvent(true);
		};

		vm.getFilterData = function(){
			var end = moment($("#date_filter_monitor").data('daterangepicker').startDate);
			var isToday = moment(end).isSame(moment(), 'day');
			var duration = parseInt(vm.filter.duration.model.id)*24*3600*1000;//(1d) 24x3600x1000
			var res = {
				tag: [],
				duration: duration,
				operation: [],
				end: (isToday) ? "-1" : end.format('x')
			};
			angular.forEach(vm.filter.operation.model, function(v){
				res.operation.push(v.id);
			});
			angular.forEach(vm.filter.tag.model, function(v){
				res.tag.push(v.id);
			});
			console.log(res);
			return res;
		};

		vm.empty = function(){
			vm.invest.results = [];
			vm.invest.paging = "-1";
			vm.invest.busy = true;
		};
		vm.restart = function(){
			vm.invest.busy = false;
			vm.invest.paging = "-1";
			vm.invest.busy = false;
			vm.nextPage();
		};
		vm.nextPage = function(switchOver){
			if (vm.invest.busy || vm.invest.paging===null || vm.tabMode==="monitor" || (angular.isDefined(switchOver) && switchOver && $('#investigate_container .row-event').length)){
				return;
			}
			vm.invest.busy = true;
			loadInvestigateEvent();
		};

		vm.switchMode = function(mode){
			vm.tabMode = mode;
			if(mode==="investigate"){
				vm.nextPage(true);
			}
		};

		vm.viewEventDetails = function(id){
			getEventDetails(id);
		};

		$scope.$on("$destroy",function(){
		    if (angular.isDefined(monitorInterval)) {
		        $interval.cancel(monitorInterval);
		    }
		});

		//Put in interval, first trigger after x seconds
		var monitorInterval = $interval(function(){
			loadAnyEvent();
		}, vm.timer);

		/* in future need to kill the interval just follow
		*  $interval.cancel(monitorInterval)l
		*/

		vm.isObjectEmpty = function(res){
			return Object.keys(res).length === 0;
		};

		loadAnyEvent();

		function getEventDetails(eventId){
			var params = {
				eventId: eventId
			};
			vm.isTimer = false;
			modalService.open(__env.modalMonitorEventDetailsUrl, 'modalMonitorEventDetailsCtrl as vm', params, function(){
				vm.isTimer = true;
			});
		}

		function hidePace(){
			$('.pace-running').addClass('pace-done').removeClass('pace-running');
			$('.pace-active').addClass('pace-inactive').removeClass('pace-active');
		}
		function loadAnyEvent(){
			if(vm.tabMode==="monitor" && vm.isTimer){ //only monitor mode need to refresh the data
				vm.isTimer = false;
				var params = {
					end: "-1", 
					duration: vm.duration,
					filter: ""
				};
				apiService.eventMonitorApi(params).then(function(response){
					var obj = {};
					vm.monitor.length = 0;
					angular.forEach(response.data.event, function(v, key){
						obj = v;
						obj.key = key
						vm.monitor.push(obj);
					})
					hidePace();
					if(vm.monitor.length){
						vm.monitorPage.button = true;
					}
					vm.monitorPage.max = vm.monitor.length;
					vm.monitorPage.limitTo = 500;
					vm.isTimer = true;
				});
			}
		}
		function loadInvestigateEvent(init){
			var getData = vm.getFilterData();
			var params = {end: vm.invest.paging, duration: vm.duration, filter: ""};
			if(vm.invest.isFilter){
				params = {
					end: (angular.isDefined(init)) ? getData.end : vm.invest.paging,
					duration: getData.duration,
					filter: ""
				}
				delete getData.end;
				delete getData.duration;
				params.filter = "/?filter="+encodeURIComponent(JSON.stringify(getData))
				vm.invest.isFilter = true;
			}
			console.log(params);
			apiService.eventMonitorApi(params).then(function(response){
				var objKey = {};
				if(angular.isDefined(init)){
					vm.invest.results.length = 0;
				}
				console.log('total : '+Object.keys(response.data.event).length);
				for(var key in response.data.event){
					objKey = response.data.event[key];
					objKey.key = key;
					vm.invest.results.push(objKey);
				}
				vm.invest.paging = (angular.isDefined(response.data.oldest)) ? response.data.oldest : null;
				vm.invest.busy = false;
				if(vm.isObjectEmpty(response.data.event)){
					console.log('#STOP');
					vm.invest.busy = true;
				}
				hidePace();
			});
		}
	});
})();