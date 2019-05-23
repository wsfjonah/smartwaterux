(function() {
    'use strict';
    var modalAddAccount = angular.module('modal.addAccount', [])
    modalAddAccount.$inject = ['$location', 'authService', 'dialogService', '$translate'];
    modalAddAccount.controller('modalAddAccount', function modalAddAccount($location, modalService, $timeout, apiService, $rootScope, authService, dialogService, $translate) {
        var lang = ($rootScope.lang === "cn") ? "CN" : "EN";
        var vm = this;
        vm.type='email';
        
        vm.addAccount=function () {
            if(vm.type && vm.account){
                var params={
                    type:vm.type,
                    alertid:vm.account
                }
                apiService.addAccountApi(params).then(function (response) {
                    if(response.data.errorCode){
                        dialogService.alert(null,{title: $translate.instant('site_menu_notification'),content:response.data.errorMsg,ok: $translate.instant('site_login_error_noted')});
                    }else {
                        window.location.reload();
                    }
                });
            }else {
                dialogService.alert(null,{title: $translate.instant('site_menu_notification'),content:'请全部填写',ok: $translate.instant('site_login_error_noted')});
            }
        };
        
    });
})();