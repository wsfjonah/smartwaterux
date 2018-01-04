/* global angular, __env */
(function() {
	'use strict';
	angular
		.module('xProject.services', [])
		.service('authService', authService)
		.service('apiService', apiService);

	authService.$inject = ['$http','localStorageService','$httpParamSerializerJQLike'];
	apiService.$inject = ['$http','localStorageService','$httpParamSerializerJQLike'];

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
			//console.log('#logout');
			//console.log(_authentication_info);
		};
	}

	function apiService($http, localStorageService, $httpParamSerializerJQLike){
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

		this.timeSeriesRangeApi = function(datapointId, resolution,  from, to){
			return $http({
				method: 'GET',
				url: __env.timeSeriesRangeUrl+"/"+datapointId+"/"+resolution+"/"+from+"/"+to,
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

		this.eventDurationApi = function(res){
			return $http({
				method: 'GET',
				url: __env.eventDurationUrl+"/"+res.to+"/"+res.duration,
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
	}
})();