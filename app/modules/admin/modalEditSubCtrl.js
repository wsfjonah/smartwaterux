(function() {
    'use strict';
    var modalEditSub = angular.module('modal.editSub', [])
    modalEditSub.$inject = ['$location', 'authService', 'dialogService', '$translate'];
    modalEditSub.controller('modalEditSub', function modalEditSub($location, modalService, $timeout, apiService, $rootScope,items, authService, dialogService, $translate) {
        var lang = ($rootScope.lang === "cn") ? "CN" : "EN";
        var vm = this;
        vm.items=items;
    
        if(vm.items.sub.indexOf('hammer')>-1){
            vm.hammer='true';
        }
        if(vm.items.sub.indexOf('burst')>-1){
            vm.burst='true';
        }
        
        
        vm.editSub=function () {
            var checkList=getCheckedVal().toString();
            var params={
                alertid:vm.items.id,
                subscribe:checkList
            };
            apiService.editSubApi(params).then(function (response) {
               if(response.data.errorCode){
                   dialogService.alert(null,{title: $translate.instant('site_menu_notification'),content:response.data.errorMsg,ok: $translate.instant('site_login_error_noted')});
               }else {
                   dialogService.alert(null,{title: $translate.instant('site_menu_notification'),content:'订阅修改成功',ok: $translate.instant('site_login_error_noted')});
               }
            });
        };
        
        var getCheckedVal=function () {
            var obj=document.getElementsByName('subscribe');
            var checkedVal=[];
            for(var k in obj){
                if(obj[k].checked){
                    checkedVal.push(obj[k].value);
                }
            }
            return checkedVal;
        };
    });
})();