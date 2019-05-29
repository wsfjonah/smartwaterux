(function() {
    'use strict';
    var analysisReport = angular.module('xProject.analysisReport',['bsTable']);
    /* 	baidu api
    *	百度账号：bangzhonggaofenzi@126.com，密码：banzan2004
    */
    analysisReport.$inject = ['$scope','apiService','$rootScope'];
    analysisReport.controller('analysisReportController', function analysisReportController (localStorageService,$scope, apiService, $mdDialog,dialogService, modalService, $translate, $rootScope, $timeout) {
        var lang = ($rootScope.lang === "cn") ? "CN" : "EN";
        var vm = this;
        
        apiService.getReportsDirsApi().then(function (response) {
           vm.reports=response.data;
        });
        
        vm.getDirid=function (id) {
            apiService.getDiridApi(id).then(function (response) {
                vm.dirid1={
                    data:response.data,
                    token:localStorageService.get('authorizationData').token
                };
                console.log(vm.dirid1);
            });
        };
        vm.isObjectEmpty = function(res){
            return res=='';
        };
    });
})();