/* global angular, __env, dialogService, moment */
(function() {
	'use strict';
	var adminSiteTable = angular.module('xProject.adminSiteTable',['bsTable']);
	/* 	baidu api
	*	百度账号：bangzhonggaofenzi@126.com，密码：banzan2004
	*/
    adminSiteTable.$inject = ['$scope','apiService','$rootScope'];
    adminSiteTable.controller('adminSiteTableController', function adminSiteTableController ($scope, apiService, $mdDialog, modalService, $translate, $rootScope, $timeout) {
		var lang = ($rootScope.lang==="cn") ? "CN" : "EN";
		var vm = this;
		vm.tableData = [];
		vm.remoteTable = {
			options: {
				data: vm.tableData,
				locale:'zh-'+lang,
				/*rowStyle: function (row, index) {
					return { classes: 'none' };
				},*/
				cache: false,
				height: 500,
				striped: true,
				pagination: true,
				pageSize: 10,
				pageList: [5, 10, 25, 50, 100, 200],
				search: true,
                searchAlign: 'left',
                //showColumns: true,
				// showRefresh: false,
				minimumCountColumns: 2,
				clickToSelect: false,
				//showToggle: true,
				maintainSelected: true,
				columns: [
					{
						field: 'device_ref',
						title: $translate.instant('site_location_table_header_device'),
						align: 'right',
						valign: 'top',
						width: 100,
						//sortable: true
					},{
						field: 'name',
						title: $translate.instant('site_location_table_header_name'),
						align: 'center',
						valign: 'top',
						sortable: true
					},{
						field: 'geo_address',
						title: $translate.instant('site_location_table_header_address'),
						align: 'left',
						valign: 'top',
						sortable: true,
						formatter: formatMapLink
					// },{
					// 	field: 'type',
					// 	title: $translate.instant('site_location_table_header_type'),
					// 	align: 'left',
					// 	width: '60px',
					// 	valign: 'top',
						//sortable: true
					},{
						field: 'status',
						title: $translate.instant('site_location_table_header_status'),
						align: 'left',
						width: '60px',
						valign: 'top',
						sortable: true
					//},{
					//	field: 'datavariation',
					//	title: $translate.instant('site_location_table_header_datavariation'),
					//	align: 'center',
					//	width: '60px',
					//	valign: 'top',
					//	formatter: formatVariation
					//},{
					//	field: 'dataquality',
					//	title: $translate.instant('site_location_table_header_dataquality'),
					//	align: 'left',
					//	width: '60px',
					//	valign: 'top'
					},{
						field: 'reading',
						title: $translate.instant('site_location_table_header_reading'),
						align: 'left',
						width: '60px',
						valign: 'top'
					//},{
					//	field: 'checkpoint_reading',
					//	title: $translate.instant('site_location_table_header_checkpoint_reading'),
					//	align: 'left',
					//	width: '100px',
					//	valign: 'top'
					},{
						field: 'geo_latlng',
						title: $translate.instant('site_location_table_header_action'),
						align: 'center',
						valign: 'top',
						width: '100px',
						clickToSelect: false,
						formatter: formatUserAction
					},{
                        field: 'edit',
                        title: $translate.instant('site_location_table_header_edit'),
                        align: 'center',
                        valign: 'top',
                        width: '100px',
                        clickToSelect: false,
                        formatter:formatUserEdit
                    }
				]
			}
		};

		getSiteData();

		$scope.viewData = function(id){
			var params = getData(id);
			modalService.open(__env.modalTimeSeriesUrl, 'modalTimeSeriesCtrl as vm', params);
		};
		$scope.viewDetails = function(id){
			var params = getData(id);
			modalService.open(__env.modalInformationTableInfo, 'modalInfoDetails as vm', params);
		};
		$scope.viewMap= function(id){
			var params = getData(id);
			modalService.open(__env.modalInformationTableMap, 'modalInfoMap as vm', params);
		};
		$scope.viewEvent = function(id, name, type){
			var params = {
				type: type,
				name: name,
				id: id
			};
			modalService.open(__env.modalSiteEventUrl, 'modalSiteEventCtrl as vm', params);
		};
		$scope.edit=function (id) {
            // console.log(id);
            var params = getData(id);
            modalService.open(__env.modalInformationTableEdit, 'modalEdit as vm', params);
        }
        $scope.addSite=function () {
            modalService.open(__env.modalInformationTableAdd, 'modalAddSite as vm');
        }
		function getData(id){
			var params = {};
			for(var i = 0, len = vm.remoteTable.options.data.length; i < len; i++) {
				if(vm.remoteTable.options.data[i].id === id) {
					params = vm.remoteTable.options.data[i];
					break;
				}
			}
			return params;
		}

		function formatMapLink(value, row){
			return "<a href='JavaScript:void(0)' onclick=\"angular.element(this).scope().viewMap('"+row.id+"')\">"+value+"</a>";
		}

		function formatVariation(value/*, row*/){
			return "<span class='p-variation "+value+"'></span>";
		}

		function formatUserAction(value, row){
			var html = "<div class='btn-group'>";
				html += "<div class='btn-group'>";
					//html += "<button type='button' class='btn btn-secondary btn-sm' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>";
					//html += "<i class='ti-menu'></i>";
					//html += "</button>";
					//html += "<ul class='dropdown-menu dropdown-menu-sm'>";
					//	html += "<li><a href='JavaScript:void(0)' class='dropdown-item' onclick=\"angular.element(this).scope().viewEvent('"+row._id+"', '"+row.name+"', 'daily_event')\">"+$translate.instant('site_location_table_action_daily_event')+"</a></li>";
					//	html += "<li><a href='JavaScript:void(0)' class='dropdown-item' onclick=\"angular.element(this).scope().viewEvent('"+row._id+"', '"+row.name+"', 'weekly_event')\">"+$translate.instant('site_location_table_action_weekly_event')+"</a></li>";
					//	html += "<li><a href='JavaScript:void(0)' class='dropdown-item' onclick=\"angular.element(this).scope().viewEvent('"+row._id+"', '"+row.name+"', 'daily_reading')\">"+$translate.instant('site_location_table_action_daily_reading')+"</a></li>";
					//	html += "<li><a href='JavaScript:void(0)' class='dropdown-item' onclick=\"angular.element(this).scope().viewEvent('"+row._id+"', '"+row.name+"', 'weekly_reading')\">"+$translate.instant('site_location_table_action_weekly_reading')+"</a></li>";
					//html += "</ul>";
				html += "</div>";
				html += "<button type='button' class='btn btn-secondary btn-sm' onclick=\"angular.element(this).scope().viewDetails('"+row.id+"')\"><i class='ti-info-alt'></i></button>";
				html += "<button type='button' class='btn btn-secondary btn-sm' onclick=\"angular.element(this).scope().viewData('"+row.id+"')\"><i class='ti-stats-up'></i></button>";
			html += "</div>";
			return html;
		}

		function formatUserEdit(value,row) {
		    var html = "<button type='button' class='btn btn-secondary btn-sm' onclick=\"angular.element(this).scope().edit('"+row.id+"')\"><i class='ti-pencil-alt'></i></button>";
            return html;
        }
		/*	to get site data
		*/
		function getSiteData(string){
			apiService.siteApi(string).then(function(response){
			    console.log(response);
				angular.forEach(response.data, function(value/*, key*/){
					var variation = "green";
					if(value.datavariation>0.01 && value.datavariation<=0.04){
						variation = "yellow";
					}else if(value.datavariation>0.04 && value.datavariation<=0.07){
						variation = "orange";
					}else if(value.datavariation>0.07){
						variation = "red";
					}
					vm.tableData.push({
						id: value.device_ref,
						device_ref: value.device_ref,
						reading: '水压',
						datapoint: value.datapoint,
						geo_address: value.geo_address,
						geo_latlng: value.geo_latlng,
						latitude: value.geo_latlng.split(',')[0],
						longitude: value.geo_latlng.split(',')[1],
						lastmod: value.lastmod,
						name: value.name,
						status: getStatusView(value.status),
						type: value.type,
						optional: value.optional,
						tag: value.tag,
						_id: value._id
					});
				});
				$timeout(function(){
					$('#info_table').bootstrapTable('resetWidth');
				}, 500);
			}).catch(function(/*err*/){
				dialogService.alert(null,{content: $translate.instant('site_common_something_wrong')});
			});
		}
		
		function getStatusView(status){
			if(status == 'N') {
			    return '正常';
            }else if(status=='T'){
			    return '测试';
            }else if(status=='I'){
			    return '空闲';
            }else if(status=='E'){
			    return '错误';
            }
			    
			    // return '正常';
			
			// return '异常';
		}
	});
})();