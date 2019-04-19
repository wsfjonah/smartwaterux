
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
        
        vm.verificationSShow=true;  //第一个section
        vm.setPswSShow=false;  //第二个section
        vm.secSShow=false;    //第三个section
        
        vm.setPswHShow=false;  //第二个header
        vm.sucHShow=false;  //第三个header
        
        vm.username='';
        vm.psw='';
        vm.psw1='';
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
            
            var isAuth=isAuthenticated();   //判断登录状态，退出登录
            if(isAuth==true){
                logout();
                var isauth=isAuthenticated();
            }
            
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
        
        vm.checkUserName=function () {
            var name=vm.username;
            if(name){
                apiService.checkUsernameApi(name,code).then(function (response) {
                    var result = response.data.message;
                    if (result == 'success') {
                                vm.verificationSShow = false;
                                vm.setPswHShow = true;   //显示“修改密码”部分header
                                vm.setPswSShow = true;   //显示“修改密码”部分section
                    }else {
                        alert('用户名错误！');
                    }
                });
            
            }else {
                alert('用户名不能为空');
            }
        };
        
        
        vm.checkPsw=function () {
            var psw=vm.psw;
            if(psw.length<8){
                alert('密码需为8位或以上');
                return false;
            }else{
                var hasCap=/[A-Z]/;
                var hasSm=/[a-z]/;
                var hasNum=/[0-9]/;
                var hasSpecialChar="[ _`~!@#$%^&*()+=|{}':;',\\[\\].<>/?~！@#￥%……&*（）——+|{}【】‘；：”“’。，、？]|\n|\r|\t";
    
                if(!psw.match(hasCap)){
                    alert('密码需包含大写字母');
                    return false;
                }else if(!psw.match(hasSm)){
                    alert('密码需包含小写字母');
                    return false;
                }else if(!psw.match(hasNum)){
                    alert('密码需包含数字');
                    return false;
                }else if (!(psw.match(hasSpecialChar)==null)){
                    alert('密码不可包含特殊字符');
                    return false;
                } else {
                    //密码设置正确
                    var psw1=vm.psw1;
                    if (!(psw1==psw)){
                        alert('两次密码不一致');
                    }else {
                        //去存储密码
                        var username=vm.username;
                        var password=vm.psw;
                        authService.resetpassword(username,code,password).then(function (response) {
                            if(response.data.message=='success'){
                                //激活成功
                                vm.setPswSShow=false;
                                vm.sucHShow=true;
                                vm.secSShow=true;
                            }else {
                                alert('激活失败！');
                                return false;
                            }
                        });
                        
                        
                    }
                }
            }
        };
    
        vm.login=function () {
            window.location.href='https://smartwater.mathearth.com/smartwater/#!/login';
        }
        // var loginStatus=vm.isAuthenticated();
        // console.log(loginStatus);
    
        
        checkCode(code);
        
    });
})();