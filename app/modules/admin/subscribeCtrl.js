/* global angular, __env */
(function() {
    'use strict';
    var subscribe = angular.module('xProject.subscribe', [])
    subscribe.$inject = ['$location', 'authService', 'dialogService','$translate'];
    subscribe.controller('subscribeController',function subscribeController($location,modalService,$scope,$timeout,apiService, $rootScope,authService, dialogService, $translate){
        var lang = ($rootScope.lang==="cn") ? "CN" : "EN";
        var vm = this;
        vm.tableData = [];
        vm.remoteTable = {
            options: {
                data: vm.tableData,
                locale:'zh-'+lang,
                cache: false,
                height: 500,
                striped: true,
                pagination: true,
                pageSize: 10,
                pageList: [10],
                search: true,
                searchAlign: 'left',
                minimumCountColumns: 2,
                clickToSelect: false,
                maintainSelected: true,
                columns: [
                    {
                        field: 'account',
                        title: $translate.instant('site_location_table_header_account'),
                        align: 'center',
                        valign: 'top',
                        width: 80,
                        sortable: true
                    },{
                        field: 'type',
                        title: $translate.instant('site_location_table_header_type'),
                        align: 'center',
                        valign: 'top',
                        width: 80,
                        sortable: true
                    },{
                        field: 'status',
                        title: $translate.instant('site_location_table_header_status'),
                        align: 'center',
                        valign: 'top',
                        width: '120px'
                    },{
                        field: 'subscribe',
                        title: $translate.instant('site_location_table_header_subscribe'),
                        align: 'center',
                        valign: 'top',
                        width: '100px'
                    },{
                        field: 'edit',
                        title: $translate.instant('site_location_table_header_edit'),
                        align: 'left',
                        valign: 'top',
                        width: '100px',
                        clickToSelect: false,
                        formatter:formatUserEdit
                    }
                ]
            }
        };
    
        vm.addAccount=function () {
            modalService.open(__env.modalAddAccount,'modalAddAccount as vm');
        }
        $scope.editSub=function (id,sub) {
            var params={
                id:id,
                sub:sub
            }
            console.log(sub);
            modalService.open(__env.modalEditSub,'modalEditSub as vm',params);
        }
        $scope.activeAccount=function (alertid) {
            var params={
                alertid:alertid
            }
            apiService.activeAccountApi(params).then(function (response) {
                if(response.data.errorCode){
                    dialogService.alert(null,{title: $translate.instant('site_menu_notification'),content:response.data.errorMsg,ok: $translate.instant('site_login_error_noted')});
                }else {
                    window.location.reload();
                }
            });
        }
        
        function formatUserEdit(value,row) {
            var html;
            if(row.status=='active'){
                html = '<button type="button" class="btn btn-secondary btn-sm" onclick="angular.element(this).scope().editSub(\''+row.account+'\',\''+row.subscribe+'\')">编辑订阅</button>';
            }else if(row.status=='inactive'){
                html = '<button type="button" class="btn btn-secondary btn-sm" onclick="angular.element(this).scope().editSub(\''+row.account+'\',\''+row.subscribe+'\')">编辑订阅</button>' +
                    '<button type="button" class="btn btn-secondary btn-sm" onclick="angular.element(this).scope().activeAccount(\''+row.account+'\')">激活</button>';
            }
            return html;
        }
    
        function getSubscribeData() {
            apiService.subscribeAllApi().then(function (response) {
                if (response.data.errorCode) {
                    if (response.data.errorCode == "3") {
                        window.location.href = '/optimize/#!/dashboard-info';
                        console.log('no access');
                    }
                } else {
                    angular.forEach(response.data, function (value/*, key*/) {
                        var sub=[];
                        for(var key in value.subscribe){
                            if(value.subscribe[key]=='1'){
                                sub.push(key);
                            }
                        }
                        vm.tableData.push({
                            account: value._id,
                            type: value.type,
                            status: value.status,
                            subscribe: sub
                        });
                    });
                    $timeout(function () {
                        $('#info_table').bootstrapTable('resetWidth');
                    }, 500);
                }
            });
        }
    
        getSubscribeData();
    
    });
})();