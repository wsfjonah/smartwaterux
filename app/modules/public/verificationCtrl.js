
(function() {
    'use strict';
    var verification = angular.module('xProject.verification',[]);
    /* 	baidu api
    *	百度账号：bangzhonggaofenzi@126.com，密码：banzan2004
    */
    verification.$inject = ['$scope','apiService','$rootScope','authService'];
    verification.controller('verificationController', function verificationController ($scope, apiService, authService, $mdDialog, modalService, $translate, $rootScope, $timeout) {
        var lang = ($rootScope.lang === "cn") ? "CN" : "EN";
        var vm = this;
        vm.overTimeShow=false;  //code过期页面
        vm.sectionShow=true;  //激活页面
        
        vm.secSShow=true;    //第三个section
        
        vm.userInfo = authService.getAuthentication();
        
        var default_userInfo = {
            username: "",
            token: "",
            role: "",
            projects:[],
            current_project: {
                name: ""
            },
            timezone: "",
            lang: "",
            apps: {}
        };
        var str=window.location.href;
        var code= GetRequest(str);
        
        function isAuthenticated() {
            return authService.isLoggedIn();
        }
        
        
        function logout() {
            vm.userInfo = angular.extend({}, vm.userInfo, default_userInfo);
            authService.logout();
        }
        
        function GetRequest(url) {
            if (url.indexOf('?') !== -1) {    //判断是否有参数
                var idx=str.lastIndexOf('\?');
                str=str.substr(idx+1,str.length);
                var arr=str.split('=');
                return arr[1];
            }else {
                alert('缺少参数！');
                vm.sectionShow=false;  //激活部分隐藏
                vm.overTimeShow=true;  //过期部分显示
            }
        }
        
        function checkCode(code) {
            apiService.checkVerificationCodeApi(code).then(function (response) {
                var result=response.data.message;
                if(!(result=='success')){     //code过期
                    vm.sectionShow=false;  //激活部分隐藏
                    vm.overTimeShow=true;  //过期部分显示
                }
            });
        }
        
        
        
    
        vm.toHome=function () {
            window.location.href='/smartwater/#!/dashboard-info';
        }
        
        
        checkCode(code);
        
    });
})();