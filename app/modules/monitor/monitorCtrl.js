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
		vm.duration = 100000000000;
		vm.monitor = {};
		vm.isTimer = true;
		vm.tabMode = "monitor";
		vm.invest = {
			paging: "-1",
			busy: false,
			results: []
		};
		vm.filter = {
			tag:{
				model: null,
				options:[
					{
						id: 'valve',
						name: 'Valve'
					},{
						id: 'burst',
						name: 'Burst'
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
						id: 'adjusted',
						name: 'Adjusted'
					}
				]
			},
			duration:{
				model: null,
				options:[
					{
						id: '1d',
						name: 'Last 1 Day'
					},{
						id: '2d',
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

		vm.getFilterData = function(){
			var res = {
				tag: vm.filter.tag.model,
				duration: vm.filter.duration.model,
				operation: vm.filter.operation.model,
				end: moment($("#date_filter_monitor").data('daterangepicker').startDate).format('x')
			};
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
			console.log('#paging : '+vm.invest.paging);
			apiService.eventMonitorApi(vm.invest.paging, vm.duration).then(function(response){
				var objKey = {};
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
				apiService.eventMonitorApi('-1', vm.duration).then(function(response){
					vm.monitor = response.data.event;
					hidePace();
				});
			}
		}
	});
})();