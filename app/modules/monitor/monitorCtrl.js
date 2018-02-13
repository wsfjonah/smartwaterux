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
*	- filtering - timerange, site, confidence, tags
*
*	- degree status
*	(low - green), (low-medium - yellow), (medium - orange), (high - red)
*/
(function() {
	'use strict';
	var monitor = angular.module('xProject.monitor', ['infinite-scroll']);
	monitor.$inject = ['$scope'];
	monitor.controller('monitorController', function monitorController ($scope, apiService, $window, $translate, $interval, Investigate) {
		var vm = this;
		vm.timer = 30000; //30 seconds
		vm.duration = 100000000000;
		vm.monitor = {};
		vm.tabMode = "monitor";
		vm.investigate = new Investigate();
		vm.invest = {
			paging: "-1",
			busy: false,
			results: []
		};
		vm.invRes = [];

		vm.empty = function(){
			vm.invest.results = [];
			vm.invest.paging = "-1";
			vm.invest.busy = true;
		}
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
				for(var key in response.data.event){
					vm.invest.results.push(response.data.event[key]);
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

		function hidePace(){
			$('.pace-running').addClass('pace-done').removeClass('pace-running');
			$('.pace-active').addClass('pace-inactive').removeClass('pace-active');
		}
		function loadAnyEvent(){
			if(vm.tabMode==="monitor"){ //only monitor mode need to refresh the data
				apiService.eventMonitorApi('-1', vm.duration).then(function(response){
					vm.monitor = response.data.event;
					hidePace();
				});
			}
		}
	});

	// Reddit constructor function to encapsulate HTTP and pagination logic
	//function Reddit($http) {
	monitor.factory('Investigate', function($http, apiService) {

		/*var investigate = {
			items: [],
			busy: false,
			page: 1
		};*/

		var Investigate = function() {
			this.items = [];
			this.busy = false;
			this.after = '';
			this.page = 1;
		};

		/*Investigate.prototype.reset = function() {
			this.items = [];
			this.page = 1;
			console.log(this);
		}
		Investigate.prototype.restart = function() {
			this.page = 1;
			this.busy = false;
			Investigate.prototype.nextPage(true);
		}*/

		Investigate.prototype.nextPage = function(restart) {
			console.log('#next page');
			var that = this;
			console.log(that);
			if (that.busy) return;
			that.busy = true;
			apiService.eventAnyApiPaging(that.page).then(function(response){
				//that.items = response.data.event;
				for(var key in response.data.event){
					that.items.push(response.data.event[key]);
				}
				console.log('Completed push');
				that.busy = false;
				that.page = that.page+1;
				if(!Object.keys(response.data.event).length){
					console.log('#STOP');
					that.busy = true;
				}
			}.bind(that));
		};
		return Investigate;
	});
})();