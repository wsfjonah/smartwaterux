/* global angular, __env */
(function() {
	'use strict';
	angular
		.module('xProject.services', [])
		.service('authService', authService)
		.service('commonService', commonService)
		.service('apiService', apiService);

	authService.$inject = ['$http','localStorageService','$httpParamSerializerJQLike'];
	apiService.$inject = ['$http','localStorageService','$httpParamSerializerJQLike','authService'];

	function authService($http, localStorageService, $httpParamSerializerJQLike) {
		var _authentication_info = { //default object
			isAuth: false,
			username: "",
			token: "",
			role: "",
			projects:[],
			current_project: {
				name: ""
			},
			timezone: "",
			lang: "",
			apps: {}
		};
		/*jshint validthis: true */
		this.login = function(user) {
			return $http({
				method: 'POST',
				url: __env.userLoginUrl,
				data: $httpParamSerializerJQLike(user),
				headers: {'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'} //due to xproject backend required this
				//headers: {'Content-Type': 'application/json'} //application/json
			});
		};
		this.switchProject = function(projectId){
			var params = {projectid: projectId, token: this.getAuthentication().token};
			return $http({
				method: 'POST',
				url: __env.switchProjectUrl,
				data: $httpParamSerializerJQLike(params),
				headers: {'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'}
			});
		};
		this.updateProject = function(res){
			var opts_res = angular.extend({}, this.getAuthentication(), res);
			if(angular.isDefined(res.token) && res.token!==""){
				opts_res.isAuth = true;
			}
			localStorageService.set('authorizationData', opts_res);
		};
		/*this.ensureAuthenticated = function(token) { //unused for now
			return $http({
				method: 'GET',
				url: userBaseURL + 'user',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + token
				}
			});
		};*/
		this.setAuthentication = function(res){
			var opts_res = angular.extend({}, _authentication_info, res);
			if(angular.isDefined(res.token) && res.token!==""){
				opts_res.isAuth = true;
			}
			//console.log('#set authorizationData');
			//console.log(opts_res);
			localStorageService.set('authorizationData', opts_res);
			this.getAuthentication();
		};
		this.isLoggedIn = function(){
			var user_info = this.getAuthentication();
			var isAuth = (angular.isDefined(user_info.isAuth) && user_info.isAuth);
			var isToken = (angular.isDefined(user_info.token) && user_info.token!=="");
			return (isAuth && isToken);
		};
		this.getAuthentication = function(){
			var auth_res = localStorageService.get('authorizationData');
			if(auth_res===null){
				auth_res = _authentication_info;
			}
			return auth_res;
		};
		this.logout = function(){
			localStorageService.set('authorizationData', _authentication_info);
			this.updateProject(_authentication_info);
		};
	}

	function commonService($translate){
		/*jshint validthis: true */
		this.getColors = function() {
			return ["#FF1493","#FFA500","#0f7ca8","#3867c4","#96137c","#b79494","#f9b49d","#c60303","#008066","#823f5e","#687759","#d14959","#703e7f","#000000","#e8c2ef","#efa7b1","#282268"];
		};
		this.markerConfig = function(){
			return {
				icon: 'assets/images/map/marker_n.png',
				width: 30,
				height: 38,
				title: '',
				content: ''
			};
		};
		this.hidePace = function(){
			$('.pace-running').addClass('pace-done').removeClass('pace-running');
			$('.pace-active').addClass('pace-inactive').removeClass('pace-active');
		};
		this.tagMapping = function(value){
			var lists = {
				hammer: $translate.instant('site_monitor_tag_opt_hammer'),
				valve_open: $translate.instant('site_monitor_tag_opt_valve_open'),
				valve_close: $translate.instant('site_monitor_tag_opt_valve_close'),
				burst: $translate.instant('site_monitor_tag_opt_burst'),
				data_error: $translate.instant('site_monitor_tag_opt_data_error'),
				anomaly: $translate.instant('site_monitor_tag_opt_anomaly'),
				unknown: $translate.instant('site_monitor_tag_opt_unknown')
			};
			return (angular.isDefined(value) && lists.hasOwnProperty(value)) ? lists[value] : value;
		};
	}

	function apiService($http, localStorageService, $httpParamSerializerJQLike, authService){
		var apiBaseURL = __env.baseUrl;
		var headers = {'Pragma': undefined, 'Cache-Control': undefined, 'X-Requested-With': undefined, 'If-Modified-Since': undefined, 'Content-Type': 'application/json'};
		//var headers = {'Content-Type': 'application/json'};
		/*jshint validthis: true */
		this.siteApi = function(string){
			var configArr = {
				method: 'GET',
				url: apiBaseURL + 'site/search',
				headers: headers,
				data: $httpParamSerializerJQLike()
			};
			if(typeof string!=="undefined" && string!==""){
				configArr.url = configArr.url+"?query="+string;
			}
			return $http(configArr);
		};

		this.projectApi = function(){
			return $http({
				method: 'GET',
				url: __env.projectUrl,
				headers: headers
			});
		};

		this.dashboardCoverageApi = function(){
			return $http({
				method: 'GET',
				url: __env.dashboardCoverageUrl,
				headers: headers
			});
		};

		this.customerApi = function(){
			return $http({
				method: 'GET',
				url: __env.customerUrl,
				headers: headers
			});
		};

		this.timeSeriesAnyApi = function(id){
			return $http({
				method: 'GET',
				url: __env.timeSeriesAnyUrl+"/"+id+"/any",
				headers: headers
			});
		};

		this.timeSeriesHighRateApi = function(res){
			return $http({
				method: 'GET',
				url: __env.timeSeriesAnyUrl+"/"+res.id+"/highrate/"+res.from+"/"+res.to,
				headers: headers
			});
		};

		this.timeSeriesRangeApi = function(params){
			return $http({
				method: 'GET',
				url: __env.timeSeriesRangeUrl+"/"+params.datapoints+"/"+params.resolution+"/"+params.from+"/"+params.to,
				headers: headers
			});
		};

		this.batchTimeSeriesApi = function(params, extraPath){
			var defaultParams = {
				datapoints: "",
				resolution: "1n",
				from: "1498875720000", //july
				to: "1515549960000", //jan 2018
				token: authService.getAuthentication().token
			};
			var userParams = $.extend(true, defaultParams, params);
			var path = (angular.isDefined(extraPath)) ? extraPath : "";
			return $http({
				method: 'POST',
				url: __env.batchTimeSeriesUrl+path,
				data: $httpParamSerializerJQLike(userParams),
				headers: {'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'}
			});
		};

		this.batchTimeSeriesHighRateApi = function(params){
			var defaultParams = {
				datapoints: "",
				resolution: "1n",
				from: "1498875720000", //july
				to: "1515549960000", //jan 2018
				token: authService.getAuthentication().token
			};
			var userParams = $.extend(true, defaultParams, params);
			return $http({
				method: 'POST',
				url: __env.batchTimeSeriesUrl+"/highrate",
				data: $httpParamSerializerJQLike(userParams),
				headers: {'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'}
			});
		};

		this.eventSetApi = function(id, type){
			return $http({
				method: 'POST',
				url: __env.eventSetUrl+"/"+id+"/tag/"+type,
				headers: headers
			});
		};

		this.eventAnyApi = function(){
			return $http({
				method: 'GET',
				url: __env.eventAnyUrl,
				headers: headers
			});
		};

		this.eventAnyApiPaging = function(page){
			return $http({
				method: 'GET',
				url: __env.eventAnyUrl+"/"+page,
				headers: headers
			});
		};

		this.eventDurationApi = function(res){
			return $http({
				method: 'GET',
				url: __env.eventDurationUrl+"/"+res.to+"/"+res.duration,
				headers: headers
			});
		};

		this.eventMonitorApi = function(res){
			return $http({
				method: 'GET',
				url: __env.eventDurationUrl+"/"+res.end+"/"+res.duration+res.filter,
				headers: headers
			});
		};

		this.eventRangeApi = function(from, to){
			return $http({
				method: 'GET',
				url: __env.eventRangeUrl+"/"+from+"/"+to,
				headers: headers
			});
		};

		this.eventSingleRangeApi = function(datapointId, from, to){
			return $http({
				method: 'GET',
				url: __env.eventSingleRangeUrl+"/"+datapointId+"/"+from+"/"+to,
				headers: headers
			});
		};

		this.eventDetailsApi = function(eventId){
			return $http({
				method: 'GET',
				url: __env.eventDetailsUrl+"/"+eventId,
				headers: headers
			});
		};

		this.boundaryApi = function(){
			return $http({
				method: 'GET',
				url: apiBaseURL + 'map/boundary',
				headers: headers
			});
		};

		this.heatMapApi = function(){
			return $http({
				method: 'GET',
				url: apiBaseURL + 'map/heatmap',
				headers: headers
			});
		};
		this.sensorApi = function(query){
			return $http({
				method: 'GET',
				url: apiBaseURL + 'map/sensorjunction?query='+query,
				headers: headers
			});
		};
		this.pipeApi = function(query){
			return $http({
				method: 'GET',
				url: apiBaseURL + 'map/pipe?query='+query,
				headers: headers
			});
		};
		this.networkSensorApi = function(query){
			return $http({
				method: 'GET',
				url: __env.networkSensorUrl,
				headers: headers
			});
		};
		this.networkPipeApi = function(query){
			return $http({
				method: 'GET',
				url: __env.networkPipeUrl,
				headers: headers
			});
		};
		this.networkPipeSummaryApi = function(){
			return $http({
				method: 'GET',
				url: __env.networkPipeSummaryUrl,
				headers: headers
			});
		};
		this.networkAnalysisPipeApi = function(query){
			return $http({
				method: 'GET',
				url: __env.networkAnalysisPipeUrl,
				headers: headers
			});
		};
		this.networkAnalysisCoverageApi = function(id){
			return $http({
				method: 'GET',
				url: __env.networkAnalysisSensorCoverageUrl+'?site='+id,
				headers: headers
			});
		};
		this.networkPumpApi = function(){
			return $http({
				method: 'GET',
				url: __env.networkPumpUrl,
				headers: headers
			});
		};
		this.networkHydrantApi = function(mapcenter){
			return $http({
				method: 'GET',
				url: __env.networkHydrantUrl+'?mapcenter='+mapcenter,
				headers: headers
			});
		};
		this.networkPipeDetailsApi = function(mapcenter){
			return $http({
				method: 'GET',
				url: __env.networkPipeDetailsUrl+'?mapcenter='+mapcenter,
				headers: headers
			});
		};
		this.monitorSiteNeighbor = function(siteid){
			return $http({
				method: 'GET',
				url: __env.monitorSiteNeighborUrl+siteid+'/neighbors',
				headers: headers
			});
		};
		this.eventTagsList = function(){
			return $http({
				method: 'GET',
				url: __env.eventTagsUrl,
				headers: headers
			});
		};
		this.dmaList = function(){
			return $http({
				method: 'GET',
				url: __env.dmaUrl,
				headers: headers
			});
		}
		this.siteEventSummaryApi = function(type, id){
			return $http({
				method: 'GET',
				url: __env.siteEventSummaryUrl+"/"+type+"/"+id,
				headers: headers
			});
		};
		this.siteReadingSummaryApi = function(type, id){
			return $http({
				method: 'GET',
				url: __env.siteReadingSummaryUrl+"/"+type+"/"+id,
				headers: headers
			});
		};
		this.dashboardNetworkSummaryApi = function(){
			return $http({
				method: 'GET',
				url: __env.dashboardNetworkSummaryUrl,
				headers: headers
			});
		};

	}
})();