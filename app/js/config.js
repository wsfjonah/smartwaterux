/* global angular */
(function() {
	'use strict';
	angular
		.module('xProject.config', ['oc.lazyLoad'])
		.config(appConfig);

	function appConfig($routeProvider) {
		$routeProvider
		.when('/main', {
			templateUrl: __env.folder+'/app/modules/main/main.html',
			controller: 'mainController as vm',
			restrictions: {
				ensureAuthenticated: true,
				loginRedirect: false
			},
			page_params: {
				key: "dashboard"
			},
			resolve: {
				loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
					return $ocLazyLoad.load({
						serie: true,
						files: [
							'assets/js/plugins/sparkline/jquery.sparkline.min.js',
							'assets/js/plugins/chartist-js/dist/chartist.min.css',
							'assets/js/plugins/chartist-plugin-tooltip-master/dist/chartist-plugin-tooltip.css',
							'assets/js/plugins/chartist-js/dist/chartist.min.js',
							'assets/js/plugins/chartist-plugin-tooltip-master/dist/chartist-plugin-tooltip.min.js',
							'assets/js/xpro_dashboard.js',
							'app/modules/main/mainCtrl.js'
						]
					});
				}]
			}
		})
		.when('/location', {
			templateUrl: __env.folder+'/app/modules/remote/location.html',
			controller: 'locationController as vm',
			restrictions: {
				ensureAuthenticated: true,
				loginRedirect: false
			},
			page_params: {
				key: "location"
			},
			resolve: {
				loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
					return $ocLazyLoad.load({
						serie: true,
						files: [
							'app/vendors/angular-daterangepicker.min.js',
							'app/modules/remote/locationCtrl.js',
							'app/modules/remote/modalEventDetailsCtrl.js',
							'app/modules/remote/modalTimeSeriesCtrl.js',
							'app/modules/remote/modalHighRateCtrl.js',
							'app/modules/remote/modalDetailsCtrl.js'
						]
					});
				}]
			},
		})
		.when('/site', {
			templateUrl: __env.folder+'/app/modules/remote/site.html',
			controller: 'siteTableController as vm',
			restrictions: {
				ensureAuthenticated: true,
				loginRedirect: false
			},
			resolve: {
				loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
					return $ocLazyLoad.load({
						serie: true,
						files: [
							'assets/css/bootstrap-table.css',
							'assets/js/bootstrap-table.min.js',
							'app/vendors/bootstrap-table-angular.min.js',
							'assets/js/locale/bootstrap-table-zh-CN.min.js',
							'assets/js/locale/bootstrap-table-en-US.min.js',
							'app/vendors/angular-daterangepicker.min.js',
							'app/modules/remote/modalEventDetailsCtrl.js',
							'app/modules/remote/modalTimeSeriesCtrl.js',
							'app/modules/remote/modalHighRateCtrl.js',
							'app/modules/remote/modalDetailsCtrl.js',
							'app/modules/remote/modalMapCtrl.js',
							'app/modules/remote/siteTableCtrl.js'
						]
					});
				}]
			},
			page_params: {
				key: "site"
			},
		})
		.when('/gis', {
			templateUrl: __env.folder+'/app/modules/network/gis.html',
			controller: 'gisController as vm',
			restrictions: {
				ensureAuthenticated: true,
				loginRedirect: false
			},
			resolve: {
				loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
					return $ocLazyLoad.load({
						serie: true,
						files: [
							'app/modules/network/gisCtrl.js'
						]
					});
				}]
			},
			page_params: {
				key: "gis"
			}
		})
		.when('/network-analysis', {
			templateUrl: __env.folder+'/app/modules/network/networkAnalysis.html',
			controller: 'networkAnalysisController as vm',
			restrictions: {
				ensureAuthenticated: true,
				loginRedirect: false
			},
			resolve: {
				loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
					return $ocLazyLoad.load({
						serie: true,
						files: [
							'app/modules/network/networkAnalysisCtrl.js'
						]
					});
				}]
			},
			page_params: {
				key: "networkAnalysis"
			}
		})
		.when('/network-data', {
			templateUrl: __env.folder+'/app/modules/network/networkData.html',
			controller: 'networkDataController as vm',
			restrictions: {
				ensureAuthenticated: true,
				loginRedirect: false
			},
			resolve: {
				loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
					return $ocLazyLoad.load([
						'app/modules/network/networkDataCtrl.js',
						'app/vendors/angular-daterangepicker.min.js',
						'app/modules/remote/modalEventDetailsCtrl.js',
						'app/modules/remote/modalTimeSeriesCtrl.js',
						'app/modules/remote/modalHighRateCtrl.js'
					]);
				}]
			},
			page_params: {
				key: "network_data"
			}
		})
		.when('/monitoring', {
			templateUrl: __env.folder+'/app/modules/monitor/monitor.html',
			controller: 'monitorController as vm',
			restrictions: {
				ensureAuthenticated: true,
				loginRedirect: false
			},
			resolve: {
				loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
					return $ocLazyLoad.load([
						'app/modules/monitor/monitorCtrl.js'
					]);
				}]
			},
			page_params: {
				key: "monitor"
			}
		})
		.when('/login', {
			templateUrl: __env.folder+'/app/modules/auth/login.html',
			controller: 'authLoginController',
			controllerAs: 'authLoginCtrl',
			restrictions: {
				ensureAuthenticated: false,
				loginRedirect: false
			},
			page_params: {
				key: "login"
			},
		}).otherwise({
			redirectTo: '/main'
		});
	}
})();