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
                dialogService.alert(null,{content:'请全部填写'});
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
                            dialogService.alert(null,{content:'添加用户失败!'+response.data.errorMsg});
                            return false;
                        }else {
                            dialogService.alert(null,{content:$translate.instant('site_success_label')});
                            window.location.reload();
                        }
                    });
                }
                
                
            }
            
        };
    });
})();