/* global angular */
(function() {
	'use strict';
	angular
		.module('xProject.config', ['oc.lazyLoad'])
		.config(appConfig);

	function appConfig($routeProvider) {
		$routeProvider
        .when('/user', {
            templateUrl: __env.folder+'/app/modules/admin/user.html',
            controller: 'userController as vm',
            restrictions: {
                ensureAuthenticated: true,
                loginRedirect: false
            },
            page_params: {
                key: "user"
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
                            // 'app/modules/remote/modalEventDetailsCtrl.js',
                            // 'app/modules/remote/modalTimeSeriesCtrl.js',
                            // 'app/modules/remote/modalHighRateCtrl.js',
                            // 'app/modules/remote/modalDetailsCtrl.js',
                            // 'app/modules/remote/modalMapCtrl.js',
                            'app/modules/admin/userCtrl.js',
                            'app/modules/admin/modalAddUser.js',
                            'app/modules/admin/modalEditUserCtrl.js',
                            'app/modules/admin/modalUserUpdatePswCtrl.js'
                            // 'app/modules/remote/modalSiteEventsCtrl.js'
                        ]
                    });
                }]
            }
        }).when('/resetPsw', {
            templateUrl: __env.folder+'/app/modules/admin/resetPsw.html',
            controller: 'resetPswController as vm',
            restrictions: {
                ensureAuthenticated: true,
                loginRedirect: false
            },
            page_params: {
                key: "resetPsw"
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
                            'app/modules/admin/resetPswCtrl.js'
                        ]
                    });
                }]
            }
        }).when('/notification', {
                templateUrl: __env.folder+'/app/modules/admin/notification.html',
                controller: 'notificationController as vm',
                restrictions: {
                    ensureAuthenticated: true,
                    loginRedirect: false
                },
                page_params: {
                    key: "notification"
                },
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            serie: true,
                            files: [
                                'app/modules/admin/notificationCtrl.js',
                                'assets/css/bootstrap-table.css',
                                'assets/js/bootstrap-table.min.js',
                                'app/vendors/bootstrap-table-angular.min.js',
                                'assets/js/locale/bootstrap-table-zh-CN.min.js',
                                'assets/js/locale/bootstrap-table-en-US.min.js',
                                'app/vendors/angular-daterangepicker.min.js',
                                // 'app/modules/remote/modalEventDetailsCtrl.js',
                                // 'app/modules/remote/modalTimeSeriesCtrl.js',
                                // 'app/modules/remote/modalHighRateCtrl.js',
                                // 'app/modules/remote/modalDetailsCtrl.js',
                                // 'app/modules/remote/modalMapCtrl.js',
                                // 'app/modules/remote/modalSiteEventsCtrl.js'
                            ]
                        });
                    }]
                }
        }).when('/subscribe', {
            templateUrl: __env.folder+'/app/modules/admin/subscribe.html',
            controller: 'subscribeController as vm',
            restrictions: {
                ensureAuthenticated: true,
                loginRedirect: false
            },
            page_params: {
                key: "subscribe"
            },
            resolve: {
                loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        serie: true,
                        files: [
                            'app/modules/admin/subscribeCtrl.js',
                            'app/modules/admin/modalAddAccountCtrl.js',
                            'app/modules/admin/modalEditSubCtrl.js',
                            'assets/css/bootstrap-table.css',
                            'assets/js/bootstrap-table.min.js',
                            'app/vendors/bootstrap-table-angular.min.js',
                            'assets/js/locale/bootstrap-table-zh-CN.min.js',
                            'assets/js/locale/bootstrap-table-en-US.min.js',
                        ]
                    });
                }]
            }
            
        }).when('/dashboard-info', {
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
							'app/modules/main/mainCtrl.js'
						]
					});
				}]
			}
		})
		.when('/dashboard-network', {
			templateUrl: __env.folder+'/app/modules/main/network.html',
			controller: 'dashboardNetworkController as vm',
			restrictions: {
				ensureAuthenticated: true,
				loginRedirect: false
			},
			page_params: {
				key: "dashboard_network"
			},
			resolve: {
				loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
					return $ocLazyLoad.load({
						serie: true,
						files: [
							'app/modules/main/networkCtrl.js'
						]
					});
				}]
			}
		})
		.when('/dashboard-scatter', {
			templateUrl: __env.folder+'/app/modules/main/scatter.html',
			controller: 'dashboardScatterController as vm',
			restrictions: {
				ensureAuthenticated: true,
				loginRedirect: false
			},
			page_params: {
				key: "dashboard_scatter"
			},
			resolve: {
				loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
					return $ocLazyLoad.load({
						serie: true,
						files: [
							'app/modules/main/scatterCtrl.js',
							'app/modules/main/scatterData.js'
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
							'js!https://api.tianditu.gov.cn/api?v=4.0&tk=556f353f742842fd5aba67f36c52a0a6',
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
							'app/modules/remote/siteTableCtrl.js',
							'app/modules/remote/modalSiteEventsCtrl.js'
						]
					});
				}]
			},
			page_params: {
				key: "site"
			},
		}).when('/adminremote', {
                templateUrl: __env.folder+'/app/modules/admin/adminSite.html',
                controller: 'adminSiteTableController as vm',
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
                                'app/modules/admin/adminSiteTableCtrl.js',
                                'app/modules/admin/modalEditCtrl.js',
                                'app/modules/admin/modalAddSiteCtrl.js',
                                'app/modules/remote/modalEventDetailsCtrl.js',
                                'app/modules/remote/modalTimeSeriesCtrl.js',
                                'app/modules/remote/modalHighRateCtrl.js',
                                'app/modules/remote/modalDetailsCtrl.js',
                                'app/modules/remote/modalMapCtrl.js',
                                'app/modules/remote/siteTableCtrl.js',
                                'app/modules/remote/modalSiteEventsCtrl.js'
                            ]
                        });
                    }]
                },
                page_params: {
                    key: "adminremote"
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
						'app/vendors/angular-daterangepicker.min.js',
						'app/vendors/fastRepeat.js',
						'app/vendors/ng-infinite-scroll.min.js',
						'app/modules/monitor/monitorCtrl.js',
						'app/modules/monitor/modalMapCtrl.js',
						'app/modules/monitor/modalMonitorEventDetailsCtrl.js',
						'app/modules/monitor/modalMonitorSiteDetailsCtrl.js'
					]);
				}]
			},
			page_params: {
				key: "monitor"
			}
		})
		.when('/classification', {
			templateUrl: __env.folder+'/app/modules/monitor/classification.html',
			controller: 'monitorController as vm',
			restrictions: {
				ensureAuthenticated: true,
				loginRedirect: false
			},
			resolve: {
				loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
					return $ocLazyLoad.load([
						'app/vendors/angular-daterangepicker.min.js',
						'app/vendors/fastRepeat.js',
						'app/vendors/ng-infinite-scroll.min.js',
						'app/modules/monitor/monitorCtrl.js',
						'app/modules/monitor/modalMapCtrl.js',
						'app/modules/monitor/modalMonitorEventDetailsCtrl.js'
					]);
				}]
			},
			page_params: {
				key: "classification"
			}
		})
		.when('/eventlib', {
			templateUrl: __env.folder+'/app/modules/monitor/eventlib.html',
			controller: 'monitorController as vm',
			restrictions: {
				ensureAuthenticated: true,
				loginRedirect: false
			},
			resolve: {
				loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
					return $ocLazyLoad.load([
						'app/vendors/angular-daterangepicker.min.js',
						'app/vendors/fastRepeat.js',
						'app/vendors/ng-infinite-scroll.min.js',
						'app/modules/monitor/monitorCtrl.js',
						'app/modules/monitor/modalMapCtrl.js',
						'app/modules/monitor/modalMonitorEventDetailsCtrl.js'
					]);
				}]
			},
			page_params: {
				key: "eventlib"
			}
		})
		.when('/flow', {
                templateUrl: __env.folder+'/app/modules/DMA/flow.html',
                controller: 'flowController as vm',
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
                            'app/modules/remote/modalHighRateCtrl.js',
                            'app/modules/DMA/flowCtrl.js'
                        ]);
                    }]
                },
                page_params: {
                    key: "flow"
                }
            })
            .when('/verification', {
                templateUrl: __env.folder+'/app/modules/public/verification.html',
                controller: 'verificationController as vm',
                restrictions: {
                    ensureAuthenticated: false,
                    loginRedirect: false
                },
                page_params: {
                    key: "login"
                },
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            serie: true,
                            files: [
                                'app/modules/public/verificationCtrl.js',
                                'assets/css/bootstrap-table.css',
                                'assets/js/bootstrap-table.min.js',
                                'app/vendors/bootstrap-table-angular.min.js',
                                'assets/js/locale/bootstrap-table-zh-CN.min.js',
                                'assets/js/locale/bootstrap-table-en-US.min.js'
                            ]
                        });
                    }]
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
			redirectTo: '/dashboard-info'
		});
	}
})();