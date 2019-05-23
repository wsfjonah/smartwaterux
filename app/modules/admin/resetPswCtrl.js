(function() {
    'use strict';
    var resetPsw = angular.module('xProject.resetPsw',[]);
    resetPsw.$inject = ['$scope'];
    resetPsw.controller('resetPswController', function resetPswController ($scope, dialogService,apiService, $window, $translate, $interval, modalService, commonService) {
        var vm = this;
    
        vm.submit=function () {
            console.log(vm.oldPsw)
            console.log(vm.newPsw)
            console.log(vm.sameNewPsw)
    
            if(vm.oldPsw && vm.newPsw && vm.sameNewPsw){
                var newPsw=commonService.userPswMatch(vm.newPsw);
                if(newPsw){
                    if(vm.newPsw==vm.sameNewPsw){
                        var params={
                            oldpassword:vm.oldPsw,
                            password:vm.newPsw
                        }
                        apiService.resetPswApi(params).then(function (response) {
                            console.log(response);
                            if(response.data.errorCode){
                                dialogService.alert(null,{title: $translate.instant('site_menu_notification'),content:response.data.errorMsg,ok: $translate.instant('site_login_error_noted')});
                            }else {
                                dialogService.alert(null,{title: $translate.instant('site_menu_notification'),content:'密码修改成功',ok: $translate.instant('site_login_error_noted')});
                            }
                        });
                    }else {
                        dialogService.alert(null,{title: $translate.instant('site_menu_notification'),content:'两次密码不一致',ok: $translate.instant('site_login_error_noted')});
                    }
                }
            }else {
                dialogService.alert(null,{title: $translate.instant('site_menu_notification'),content:'请全部填写',ok: $translate.instant('site_login_error_noted')});
            }
            
        };
    });
})();