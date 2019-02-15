/* global angular, __env, moment */
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
/*
*   1.添加过滤删选条件-datapoint
*   - 弹出datapoint弹出框 - 远程终端-信息 - 将‘行动’中的内容换成单选框  - 选择后弹框自动消失
*   - 加到筛选url中进行url编码
* */

(function() {
	'use strict';
	var monitor = angular.module('xProject.monitor', ['infinite-scroll', 'daterangepicker']);
	monitor.$inject = ['$scope'];
	monitor.controller('monitorController', function monitorController ($scope, apiService, $window, $translate, $interval, modalService, commonService) {
		var vm = this;
		vm.timer = 30000; //30000 - 30 seconds
		vm.duration = 86400000; //10000000000 - 115days - 86400000 - 1day
		vm.monitor = [];
		vm.monitorPage = {
			limitTo: 500,
			max: 0,
			button: false

		};
		vm.isTimer = true;
		vm.source = "";
		vm.tabMode = "monitor";
		vm.filterOn = false;
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
						name: $translate.instant('site_monitor_tag_opt_valve_open')
					},{
						id: 'valve_close',
						name: $translate.instant('site_monitor_tag_opt_valve_close')
					},{
						id: 'burst',
						name: $translate.instant('site_monitor_tag_opt_burst')
					},{
						id: 'hammer',
						name: $translate.instant('site_monitor_tag_opt_hammer')
					},{
						id: 'data_error',
						name: $translate.instant('site_monitor_tag_opt_data_error')
					},{
						id: 'anomaly',
						name: $translate.instant('site_monitor_tag_opt_anomaly')
					},{
						id: 'unknown',
						name: $translate.instant('site_monitor_tag_opt_unknown')
					}
				]
			},
			operation:{
				model: null,
				options:[
					{
						id: 'auto',
						name: $translate.instant('site_monitor_operation_opt_auto')
					},{
						id: 'manual',
						name: $translate.instant('site_monitor_operation_opt_manual')
					},{
						id: 'adjusted',
						name: $translate.instant('site_monitor_operation_opt_adjusted')
					}
				]
			},
            dplists:{
			    model:null,
                options:[
                ]
            },
			duration:{
				model: null,
				options:[
					{
						id: "1hr",
						name: $translate.instant('site_monitor_duration_opt_1hr')
					},{
						id: "2hr",
						name: $translate.instant('site_monitor_duration_opt_2hr')
					},{
						id: "6hr",
						name: $translate.instant('site_monitor_duration_opt_6hr')
					},{
						id: "12hr",
						name: $translate.instant('site_monitor_duration_opt_12hr')
					},{
						id: "1d",
						name: $translate.instant('site_monitor_duration_opt_1d')
					},{
						id: "2d",
						name: $translate.instant('site_monitor_duration_opt_2d')
					}
				]
			},
			confidence:{
				model: null,
				options: {
					min: 0.1,
					max: 100
				}
			}
		};
		loadFilterDplist();
		vm.filter.duration.model = vm.filter.duration.options[0];
		vm.filter.tag.model = vm.filter.tag.options;
		vm.filter.dplists.model= vm.filter.dplists.options;
		vm.filter.confidence.model = 50;
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

		vm.toggleFilter = function(){
			vm.filterOn = (vm.filterOn) ? false : true;
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
			var duration = 0;
			switch (vm.filter.duration.model.id){
				case "1hr":
					duration = 1*3600*1000;
					break;
				case "2hr":
					duration = 2*3600*1000;
					break;
				case "6hr":
					duration = 6*3600*1000;
					break;
				case "12hr":
					duration = 12*3600*1000;
					break;
				case "1d":
					duration = 1*24*3600*1000;
					break;
				case "2d":
					duration = 2*24*3600*1000;
					break;
			}
			var res = {
				tag: [],
				duration: duration,
				operation: [],
                datapoint:[],
				// end: (isToday) ? "-1" : end.format('x'),
				// end: (isToday) ? end.format('x') : end.format('x'),
                end: end.format('x'),
				confidence: vm.filter.confidence.model
			};
			angular.forEach(vm.filter.operation.model, function(v){
				res.operation.push(v.id);
			});
			angular.forEach(vm.filter.tag.model, function(v){
				res.tag.push(v.id);
			});
			console.log(vm.filter.dplists.model.length);
			if(vm.filter.dplists.model.length=== 11){    //datapoint全选
                delete res.datapoint;
            }else if (vm.filter.dplists.model.length>5 && vm.filter.dplists.model.length<11){
			    alert('添加站点请选择五个之内或全选');
            }else {
                angular.forEach(vm.filter.dplists.model,function (v) {
                    res.datapoint.push(v.id);
                });
            }
            
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

		vm.switchMode = function(mode, source){
			vm.tabMode = mode;
			vm.source = source;
			if(mode==="investigate"){
				vm.nextPage(true);
			}
		};

		vm.viewEventDetails = function(row){
			getEventDetails(row);
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

		function loadFilterDplist() {
            // {
            //     id: '5a6eb4e70b272a1f64fa26ba-pressure',
            //         name:'江山路妙香路'
            // },
            // {
            //     id: '5a6eb4e70b272a1f64fa26b2-pressure',
            //         name:'江山路云水路（新昇半导体）'
            // }
            var dplistsArr=[
                {
                    id: '5a6eb4e70b272a1f64fa26ba-pressure',
                    name:'江山路妙香路'
                },
                {
                    id: '5a6eb4e70b272a1f64fa26b2-pressure',
                    name:'江山路云水路（新昇半导体）'
                },
                {
                    id: '5a6eb4e70b272a1f64fa26b3-pressure',
                    name:'沧海路妙香路（五七路妙香路泵站）'
                },
                {
                    id: '5a6eb4e70b272a1f64fa26b4-pressure',
                    name:'江山路倚天路'
                },
                {
                    id: '5a6eb4e70b272a1f64fa26b5-pressure',
                    name:'万水路新元南路'
                },
                {
                    id: '5a6eb4e70b272a1f64fa26b6-pressure',
                    name:'沧海路中（中港柴油机制造）'
                },
                {
                    id: '5a6eb4e70b272a1f64fa26b7-pressure',
                    name:'南芦公路（芦潮港，果园泵站）'
                },
                {
                    id: '5a6eb4e70b272a1f64fa26b8-pressure',
                    name:'芦五公路'
                },
                {
                    id: '5a6eb4e70b272a1f64fa26b9-pressure',
                    name:'倚天路沧海路'
                },
                {
                    id: '5a6eb4e70b272a1f64fa26bc-pressure',
                    name:'层林路沧海路（上海电气）'
                },
                {
                    id: '5a6eb4e70b272a1f64fa26bb-pressure',
                    name:'江山路天高路'
                }
                ];
            
            vm.filter.dplists.options=dplistsArr;
        }
		
		function getEventDetails(row){
			var params = {
				eventId: row.key,
				datapointid: row.datapointid,
				name: ""
			};
			vm.isTimer = false;
			modalService.open(__env.modalMonitorEventDetailsUrl, 'modalMonitorEventDetailsCtrl as vm', params, function(){
				vm.isTimer = true;
			});
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
						obj.key = key;
						vm.monitor.push(obj);
					});
					commonService.hidePace();
					if(vm.monitor.length>500){
						vm.monitorPage.button = true;
					}
					vm.monitorPage.max = vm.monitor.length;
					vm.monitorPage.limitTo = 500;
					vm.isTimer = true;
				}, function(){ //error callback
					vm.isTimer = true;
				});
			}
		}
		function loadInvestigateEvent(init){
			var getData = vm.getFilterData();
			var params = {end: vm.invest.paging, duration: vm.duration, source: "", filter: ""};
			if(vm.invest.isFilter){
				params = {
					end: (angular.isDefined(init)) ? getData.end : vm.invest.paging,
					duration: getData.duration,
					source: "",
					filter: ""
				};
				delete getData.end;
				delete getData.duration;
				params.filter = "filter="+encodeURIComponent(JSON.stringify(getData));
				vm.invest.isFilter = true;
			}
			params.source = "source="+vm.source;
			apiService.eventMonitorApi(params).then(function(response){
				var objKey = {};
				if(angular.isDefined(init)){
					vm.invest.results.length = 0;
				}
				for(var key in response.data.event){
					objKey = response.data.event[key];
					objKey.key = key;
					vm.invest.results.push(objKey);
				}
				vm.invest.paging = (angular.isDefined(response.data.oldest)) ? response.data.oldest : null;
				vm.invest.busy = false;
				if(vm.isObjectEmpty(response.data.event)){
					vm.invest.busy = true;
				}
				commonService.hidePace();
			});
		}
	});
})();