/* global angular */
(function() {
    'use strict';
    var modalAddUserModule = angular.module('modal.addUser',[]);
    modalAddUserModule.controller('modalAddUser', function modalAddUser ($scope, apiService, authService) {
        var vm=this;
        vm.isSuperAdmin = false
        
        vm.isAuthAddSA=authService.isMunuAuth('user_addSA');
        console.log(vm.isAuthAddSA);
        vm.addUser=function () {
            console.log(vm.username)
            console.log(vm.psw)
            console.log(vm.role)
            if(!(vm.username && vm.psw && vm.role)){
                alert('请全部填写');
                return false;
            }else {
                var params={
                    username:vm.username,
                    password:vm.psw,
                    phone:vm.phone,
                    email:vm.email,
                    role:vm.role
                };
                apiService.addUserApi(params).then(function (response) {
                    if(!(response.data.message=='success')){
                        return false;
                    }else {
                        alert('success');
                        window.location.reload();
                    }
                });
            }
            
        };
    });
})();