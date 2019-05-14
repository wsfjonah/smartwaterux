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
            var userPswMatch = commonService.userPswMatch(vm.psw);
            if(userPswMatch){
                var params={
                    username:vm.username,
                    password:vm.psw
                };
                apiService.updatePswApi(params).then(function (response) {
                    if(response.data.message=='success'){
                        dialogService.alert(null,{content:'密码修改成功'});
                    }else {
                        dialogService.alert(null,{content:'密码修改失败'});
                    }
                });
            }
            
        };
        
    });
})();