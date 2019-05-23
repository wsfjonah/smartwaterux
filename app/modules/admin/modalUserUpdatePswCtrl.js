/* global angular */
(function() {
    'use strict';
    var modalUpdateUserPswModule = angular.module('modal.updateUserPsw',[]);
    modalUpdateUserPswModule.controller('modalUpdateUserPsw', function modalUpdateUserPsw ($uibModalInstance,dialogService, items, apiService,authService, modalService, $scope, $translate, commonService) {
        var vm=this;
        vm.items = items;
        console.log(items);
        vm.username=items;
        
        vm.submit=function () {
            if(vm.psw){
                var userPswMatch = commonService.userPswMatch(vm.psw);
                if(userPswMatch){
                    var params={
                        username:vm.username,
                        password:vm.psw
                    };
                    apiService.updatePswApi(params).then(function (response) {
                        if(response.data.message=='success'){
                            dialogService.alert(null,{title: $translate.instant('site_menu_notification'),content:'密码修改成功',ok: $translate.instant('site_login_error_noted')});
                        }else {
                            dialogService.alert(null,{title: $translate.instant('site_menu_notification'),content:'密码修改失败',ok: $translate.instant('site_login_error_noted')});
                        }
                    });
                }
            }else {
                dialogService.alert(null,{title: $translate.instant('site_menu_notification'),content:'请全部填写',ok: $translate.instant('site_login_error_noted')});
            }
            
            
        };
        
    });
})();