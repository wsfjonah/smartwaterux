/* global angular, xpro, console */
(function() {
	'use strict';
	var main = angular.module('xProject.main',[]);
	main.$inject = ['$scope', 'authService', 'leaveRest', '$location', '$http'];
	main.controller('mainController', function mainController ($scope, authService, leaveRest, $location) {
		var vm = this;
		vm.name = "wes";
		vm.userInfo = authService.getAuthentication();
		vm.leave = "";
		xpro.dashboard.init();
		vm.logout = function () {
			authService.logout();
			console.log(authService);
			$location.path('/login');
		};
	});

	main.factory('leaveRest', function leaveRest ($http) {
		leaveRest.data = [];
		var baseURL = 'http://api.wes.com/services/';
		leaveRest.getLeave = function(){
			return $http.get(baseURL+"list")
			.then(function(res){
				leaveRest.data = res;
			});
		};
		return leaveRest;
	});
})();