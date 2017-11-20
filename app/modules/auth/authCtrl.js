/* global angular, __env */
(function() {
	'use strict';
	angular
		.module('xProject.auth', [])
		.controller('authLoginController', authLoginController);

	authLoginController.$inject = ['$location', 'authService', 'dialogService','$translate'];

	function authLoginController($location, authService, dialogService, $translate) {
		/*jshint validthis: true */
		var vm = this;
		vm.user = {};
		vm.onLogin = function() {
			authService.login(vm.user)
			.then(function(user){
				if(angular.isDefined(user.data.token)){
					authService.setAuthentication(user.data);
					$location.path(__env.pageMain);
				}else{
					dialogService.alert(null,{title: $translate.instant('site_login_error'), content: $translate.instant('site_login_info_invalid'), ok: $translate.instant('site_login_error_noted')});
				}
			})
			.catch(function(/*err*/){
				dialogService.alert(null,{title: $translate.instant('site_login_error'), content: $translate.instant('site_login_info_invalid'), ok: $translate.instant('site_login_error_noted')});
			});
		};
	}
})();