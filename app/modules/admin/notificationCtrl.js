/* global angular, __env, dialogService, moment */
(function() {
    'use strict';
    var notification = angular.module('xProject.notification',['bsTable']);
    /* 	baidu api
    *	百度账号：bangzhonggaofenzi@126.com，密码：banzan2004
    */
    notification.$inject = ['$scope','apiService','$rootScope'];
    notification.controller('notificationController', function notificationController ($scope, apiService, $mdDialog, modalService, $translate, $rootScope, $timeout) {
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
                //time,mode,sender,recipient,subject,content,status
                columns: [
                    {
                        field: 'time',
                        title: $translate.instant('site_location_table_header_time'),
                        align: 'center',
                        valign: 'top',
                        width: 80,
                        //sortable: true
                    },{
                        field: 'mode',
                        title: $translate.instant('site_location_table_header_mode'),
                        align: 'center',
                        valign: 'top',
                        width: 80,
                        //sortable: true
                    },{
                        field: 'sender',
                        title: $translate.instant('site_location_table_header_sender'),
                        align: 'center',
                        valign: 'top',
                        sortable: true
                    },{
                        field: 'recipient',
                        title: $translate.instant('site_location_table_header_recipient'),
                        align: 'center',
                        valign: 'top',
                        sortable: true,
                    },{
                        field: 'subject',
                        title: $translate.instant('site_location_table_header_subject'),
                        align: 'center',
                        width: '100px',
                        valign: 'top',
                        //sortable: true
                    },{
                        field: 'content',
                        title: $translate.instant('site_location_table_header_content'),
                        align: 'center',
                        width: '100px',
                        valign: 'top',
                    },{
                        field: 'status',
                        title: $translate.instant('site_location_table_header_status'),
                        align: 'center',
                        width: '100px',
                        valign: 'top',
                    }
                ]
            }
        };
        var start = moment().subtract(1, 'months');
        var end = moment();
        vm.datePickerDate = {
            date:{
                startDate: start,
                endDate: end
            },
            options:{
                applyClass: "btn-primary",
                cancelClass: "btn-secondary",
                timePicker: true,
                maxDate: new Date()
            }
        };
        
        /*	to get site data
        */
        
        vm.getTimeSeriesFilter=function () {
            var resDate=getStartEndDate();
            // console.log(resDate.start);
            // console.log(resDate.end);
            var start=resDate.start;
            var end=resDate.end;
            
            
            apiService.moreNotificationApi(start,end).then(function (response) {
                console.log(vm.tableData);
                vm.tableData.length=0;
                console.log(vm.tableData);
    
                angular.forEach(response.data, function(value/*, key*/){
                    vm.tableData.push({
                        //time,mode,sender,recipient,subject,content,status
                        time:value.time,
                        mode: value.mode,
                        sender: value.sender,
                        recipient: value.recipient,
                        subject: value.subject,
                        content: value.content,
                        status: value.status
                    });
                });
                $timeout(function(){
                    $('#info_table').bootstrapTable('refresh');
                }, 500);
                console.log(vm.tableData);
    
            });
        }
        function getStartEndDate(){
            var res = {
                    start : null,
                    end: null
                },
                elem = $("#daterange_timeseries"),
                elemData = elem.data('daterangepicker'),
                startDate = moment(elemData.startDate).format('x'),
                endDate = moment(elemData.endDate).format('x');
        
            res.start = startDate;
            res.end = endDate;
            return res;
        }
        function getSiteData(){
            apiService.notificationAnyApi().then(function(response){
                angular.forEach(response.data, function(value/*, key*/){
                    vm.tableData.push({
                        time:value.time,
                        mode: value.mode,
                        sender: value.sender,
                        recipient: value.recipient,
                        subject: value.subject,
                        content: value.content,
                        status: value.status
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