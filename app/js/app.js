/* global angular, xpro, __env */
'use strict';
var env = {};
// Import variables if present (from env.js)
if(window){
	Object.assign(env, window.__env);
}
var app = angular
	.module('xProject', [
		'ngMaterial',
		'pascalprecht.translate',
		'ngRoute',
		'ngCookies',
		'LocalStorageModule',
		'xProject.config',
		'xProject.directive',
		'xProject.factory',
		'xProject.filter',
		'xProject.services',
		'xProject.auth',
		'oitozero.ngSweetAlert'
	]);

app.constant('__env', env);
app.controller('layoutCtrl', function layoutCtrl ($scope, $translate, authService, $location, $rootScope, $window) {
	var vm = this;
	var flag_path = __env.folder+"/assets/img/flags/";
	var default_userInfo = {
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
	vm.flag_img = {
		"en" : flag_path+"US.png",
		"cn" : flag_path+"CN.png"
	};

	vm.lang_trans = {
		"en" : "us",
		"cn" : "cn"
	};

	vm.currLang = vm.flag_img[$rootScope.lang];

	$scope.$on('$includeContentLoaded', function (/*event, target*/) {
		xpro.initPageLoadedLibrary();
	});

	$scope.$on('$viewContentLoaded', function(){
		xpro.resizeHeader();
	});

	vm.userInfo = authService.getAuthentication();
	/* watching authService.getAuthentication() to get the user info
	*/
	$scope.$watch(function() { return authService.getAuthentication(); }, function(/*newVal*/) {
		vm.userInfo = authService.getAuthentication();
	}, true);
    
    var getAuthList=function () {
        var userType=vm.userInfo.role;
        var arr=[];
        if(userType=='user'){
            arr=['profile','panel','remote','gis','monitor'];
        }else if(userType=='admin'){
            arr=['profile','admin','panel','remote','gis','monitor'];
        }
        return arr;
    }
	
	vm.isAuth=function (menuId) {
	    //获取可访问列表
        var arr=getAuthList();
        //判断该menu是否存在于可访问列表中
        if(arr.indexOf(menuId)=='-1'){
            return false;
        }else {
            return true;
        }
    }
	
	vm.layoutViewClass = function() {
		return (angular.isDefined($rootScope.page_key) && $rootScope.page_key==="login") ? "layout-login" : "";
	};

	vm.isCurrentPath = function (path) {
		return $location.path() == path;
	};

	vm.changeLanguage = function (key) {
		$translate.use(key);
		if(__env.langReloadPath.indexOf($location.$$path)>=0){
			$window.location.reload();
		}
	};
	vm.isAuthenticated = function() {
		return authService.isLoggedIn();
    	};
    	vm.switchProject = function(projectId){
    		authService.switchProject(projectId).then(function(response){
    			if(angular.isDefined(response.data.token)){
    				authService.updateProject(response.data);
    				getProjectUpdate();
    				//vm.projectName = projectId;
    			}
    		});
    	};
    	vm.logout = function () {
    		vm.userInfo = angular.extend({}, vm.userInfo, default_userInfo);
		authService.logout();
		$location.path('/login');
	};
	$rootScope.$on('$translateChangeSuccess', function(event, data) {
		$rootScope.lang = data.language;
		moment.locale(data.language);
		vm.currLang = vm.lang_trans[data.language];//vm.flag_img[data.language];
	});

	function getProjectUpdate(){
		var opts = authService.getAuthentication();
		vm.userInfo = angular.extend({}, default_userInfo, opts);
		console.log(vm.userInfo);
	}
});

app.run(['$rootScope', '$location', 'authService', function ($rootScope, $location, authService) {
	$rootScope.lang = 'en';
	$rootScope.page_key = '';
	$rootScope.$on('$routeChangeStart', function (event, currRoute/*, prevRoute*/) {
		if(angular.isDefined(currRoute.page_params) && angular.isDefined(currRoute.page_params.key)){
			$rootScope.page_key = currRoute.page_params.key;
		}
		if(angular.isDefined(currRoute.restrictions) && currRoute.restrictions.ensureAuthenticated){
			var user_info = authService.isLoggedIn();
			if(!user_info){
				authService.logout();
				$location.path('/login');
			}
		}
	});
}]);

app.config(function ($httpProvider, $translateProvider, $qProvider) {
	$qProvider.errorOnUnhandledRejections(false);
	$httpProvider.interceptors.push('authInterceptorService');

	//no cache
	if(!angular.isDefined($httpProvider.defaults.headers.get)){
		$httpProvider.defaults.headers.get = {};
	}
	$httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
	$httpProvider.defaults.headers.get['Pragma'] = 'no-cache';

	//translation
	$translateProvider
		.useStaticFilesLoader({
			prefix: __env.localeFolderUrl,
			suffix: '.json'
		})
		.preferredLanguage('en')
		.useLocalStorage()
		.useSanitizeValueStrategy('escapeParameters'); //without this. warning msg from angularjs about security issue

});

app.factory('authInterceptorService', ['$q', '$injector','$location', 'localStorageService', function ($q, $injector, $location, localStorageService, $translate) {
	var authInterceptorServiceFactory = {};
	var _request = function (config) {
		config.headers = config.headers || {};
		var authData = localStorageService.get('authorizationData');
		var ignore_url = __env.ignoreInterceptorRequest;
		if(authData!==null){
			if(angular.isDefined(authData.token) && ignore_url.indexOf(config.url)<0) {
				config.params = {'token': authData.token};
			}
		}
		return config;
	};
	var _responseError = function (rejection) {
		console.log('##rejection');
		console.log(rejection);
		//rejection.status === -1 && rejection.xhrStatus!=="abort"
		if (rejection.status === 401) {//xhrStatus trick
			var authService = $injector.get('authService');
			authService.logout();
			$location.path('/login');
		}else{
			var dialogService = $injector.get('dialogService');
			var $translate = $injector.get('$translate');
			dialogService.alert(null,{title: $translate.instant('site_server_notice'), content: $translate.instant('site_server_error')});
		}
		return $q.reject(rejection);
	};
	authInterceptorServiceFactory.request = _request;
	authInterceptorServiceFactory.responseError = _responseError;
	return authInterceptorServiceFactory;
}]);