
/* global angular, __env, dialogService, moment */
(function() {
    'use strict';
    var user = angular.module('xProject.user',['bsTable']);
    /* 	baidu api
    *	百度账号：bangzhonggaofenzi@126.com，密码：banzan2004
    */
    user.$inject = ['$scope','apiService','$rootScope'];
    user.controller('userController', function userController ($scope, apiService, $mdDialog,dialogService, modalService, $translate, $rootScope, $timeout) {
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
                pageList: [10],
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
                        field: 'username',
                        title: $translate.instant('site_location_table_header_username'),
                        align: 'center',
                        valign: 'top',
                        width: 80,
                        sortable: true
                    },{
                        field: 'role',
                        title: $translate.instant('site_location_table_header_role'),
                        align: 'center',
                        valign: 'top',
                        width: '120px'
                    },{
                        field: 'email',
                        title: $translate.instant('site_location_table_header_email'),
                        align: 'center',
                        valign: 'top',
                        width: '100px'
                    },{
                        field: 'status',
                        title: $translate.instant('site_location_table_header_status'),
                        align: 'left',
                        width: '60px',
                        valign: 'top',
                        sortable: true,
                        formatter:formatterUserStatus
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
    
    
        $scope.viewUser=function (type,name,id) {
            var params = {
                type: type,
                name: name,
                id: id
            };
            modalService.open(__env.modalUserUrl,'modalAddUser as vm',params);
        }
        
        function formatterUserStatus(value) {
            var html;
            if(value=='active'){
                html = "<p>正常</p>";
            }else if(value=='inactive'){
                html = "<p class='text-danger'>冻结</p>";
            }
            return html;
        }
        function formatUserEdit(value,row) {
            var text;
            if(row.status=='active'){
                text='冻结';
            }else if(row.status=='inactive'){
                text='启用';
            }
            var html = "<button type='button' class='btn btn-secondary btn-sm' onclick=\"angular.element(this).scope().edit('"+row.username+"')\"><i class='ti-pencil-alt'></i></button>" +
                "<button type='button' class='btn btn-secondary btn-sm' onclick=\"angular.element(this).scope().editStatus('"+row.status+"','"+row.username+"')\">"+text+"</button>" +
                "<button type='button' class='btn btn-secondary btn-sm' onclick=\"angular.element(this).scope().updatePsw('"+row.username+"')\">修改密码</button>";
            return html;
        }
        $scope.edit=function (username) {
            var params=getData(username);
            modalService.open(__env.modalUserTableEdit, 'modalEditUser as vm', params);
        }
        
        $scope.editStatus=function (status,username) {
            if(status=='inactive'){
                apiService.unlockUserApi(username).then(function (response) {
                    if(!(response.data.message=='success')){
                        dialogService.alert(null,{content:$translate.instant('site_alert_active_fail')});
                        
                    }else {
                        dialogService.alert(null,{content:$translate.instant('site_success_label')});
                        vm.tableData.length=0;
                        getSiteData();
    
                    }
                });
            }else if(status=='active'){
                apiService.lockUserApi(username).then(function (response) {
                    if(!(response.data.message=='success')){
                        dialogService.alert(null,{content:$translate.instant('site_alert_inactive_fail')});
                    }else {
                        dialogService.alert(null,{content:$translate.instant('site_success_label')});
                        vm.tableData.length=0;
                        getSiteData();
                    }
                })
            }
        }
    
        $scope.updatePsw=function (username) {
            modalService.open(__env.modalUserUpdatePsw,'modalUpdateUserPsw as vm',username);
        }
        function getData(username){
            var params = {};
            for(var i = 0, len = vm.remoteTable.options.data.length; i < len; i++) {
                if(vm.remoteTable.options.data[i].username === username) {
                    params = vm.remoteTable.options.data[i];
                    break;
                }
            }
            return params;
        }
        /*	to get site data
        */
        function getSiteData(){
            apiService.userAllApi().then(function(response){
                if(response.data.errorCode){
                    if(response.data.errorCode=="3"){
                        window.location.href='/optimize/#!/dashboard-info';
                        console.log('no access');
                    }
                }else {
                    angular.forEach(response.data, function(value/*, key*/){
                        vm.tableData.push({
                            username: value.username,
                            role: value.role,
                            status:value.status,
                            email:value.email,
                        });
                    });
                    $timeout(function(){
                        $('#info_table').bootstrapTable('resetWidth');
                    }, 500);
                }
            }).catch(function(/*err*/){
                dialogService.alert(null,{content: $translate.instant('site_common_something_wrong')});
            });
        }
    
        getSiteData();
    });
})();