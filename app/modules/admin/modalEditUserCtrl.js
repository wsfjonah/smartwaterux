/* global angular */
(function() {
    'use strict';
    var modalEditUserModule = angular.module('modal.editUser',[]);
    modalEditUserModule.controller('modalEditUser', function modalEditUser ($uibModalInstance,dialogService, items, apiService,authService, modalService, $scope, $translate, commonService) {
        var vm=this;
        vm.items = items;
        vm.username=vm.items.username;
        vm.email=vm.items.email;
        vm.role=vm.items.role;
        vm.status=vm.items.status;
        
        vm.isAuthAddSA=authService.isMunuAuth('user_addSA');
        vm.submit=function () {
            if(vm.username && vm.email && vm.role){
                var params={
                    username:vm.username,
                    email:vm.email,
                    role:vm.role
                }
                apiService.editUserApi(params).then(function (response) {
                    console.log(response);
                    if(response.data.errorCode){
                        dialogService.alert(null,{content:'用户信息修改失败！'+response.data.errorMsg});
                    }else {
                        dialogService.alert(null,{content:'修改成功'});
                        window.location.reload();
                    }
                });
            }else {
                dialogService.alert(null,{content:'请全部填写'});
            }

        };
        
        
        
    });
})();