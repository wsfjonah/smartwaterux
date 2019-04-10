
/* global angular, __env, dialogService, moment */
(function() {
    'use strict';
    var user = angular.module('xProject.user',['bsTable']);
    /* 	baidu api
    *	百度账号：bangzhonggaofenzi@126.com，密码：banzan2004
    */
    user.$inject = ['$scope','apiService','$rootScope'];
    user.controller('userController', function userController ($scope, apiService, $mdDialog, modalService, $translate, $rootScope, $timeout) {
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
                        field: 'lang',
                        title: $translate.instant('site_location_table_header_lang'),
                        align: 'center',
                        valign: 'top',
                        width: '100px'
                    },{
                        field: 'timezone',
                        title: $translate.instant('site_location_table_header_timezone'),
                        align: 'center',
                        width: '140px',
                        valign: 'top',
                        //sortable: true
                    },{
                        field: 'projects',
                        title: $translate.instant('site_location_table_header_projects'),
                        align: 'center',
                        valign: 'top',
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
        
        /*	to get site data
        */
        function getSiteData(){
            apiService.userAllApi().then(function(response){
                angular.forEach(response.data, function(value/*, key*/){
                    console.log(JSON.stringify(value.projects))
                    vm.tableData.push({
                        username: value.username,
                        role: value.role,
                        lang: value.lang,
                        timezone: value.timezone,
                        projects: JSON.stringify(value.projects)
                    });
                });
                $timeout(function(){
                    $('#info_table').bootstrapTable('resetWidth');
                }, 500);
            }).catch(function(/*err*/){
                dialogService.alert(null,{content: $translate.instant('site_common_something_wrong')});
            });
        }
    
        getSiteData();
    });
})();