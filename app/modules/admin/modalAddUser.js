/* global angular */
(function() {
    'use strict';
    var modalAddUserModule = angular.module('modal.addUser',[]);
    modalAddUserModule.controller('modalAddUser', function modalAddUser ($scope,$translate, apiService,dialogService, authService, commonService) {
        var vm=this;
        vm.isSuperAdmin = false
        
        vm.isAuthAddSA=authService.isMunuAuth('user_addSA');
        
        vm.addUser=function () {
            if(!(vm.username && vm.psw && vm.role && vm.email)){
                dialogService.alert(null,{title: $translate.instant('site_menu_notification'),content:'请全部填写',ok: $translate.instant('site_login_error_noted')});
                return false;
            }else {
                var userPswMatch = commonService.userPswMatch(vm.psw);
                if(!userPswMatch){
                    return false;
                }else {
                    var params={
                        username:vm.username,
                        password:vm.psw,
                        email:vm.email,
                        role:vm.role
                    };
                    apiService.addUserApi(params).then(function (response) {
                        if(!(response.data.message=='success')){
                            dialogService.alert(null,{title: $translate.instant('site_menu_notification'),content:'添加用户失败!'+response.data.errorMsg,ok: $translate.instant('site_login_error_noted')});
                            return false;
                        }else {
                            dialogService.alert(null,{title: $translate.instant('site_menu_notification'),content:$translate.instant('site_success_label'),ok: $translate.instant('site_login_error_noted')});
                            window.location.reload();
                        }
                    });
                }
                
                
            }
            
        };
    });
})();