/* global angular */
(function() {
    'use strict';
    var modalAddUserModule = angular.module('modal.addUser',[]);
    modalAddUserModule.controller('modalAddUser', function modalAddUser ($scope, apiService) {
        var vm=this;
        vm.username='';
        vm.tel='';
        vm.email='';
        
    
        vm.addUser=function () {
            vm.username=$('#uUsername').val();
            vm.tel=$('#uTel').val();
            vm.email=$('#uEmail').val();
            if(!(vm.username && vm.tel && vm.email)){
                alert('请全部填写');
                return false;
            }
            apiService.addUserApi(vm.username,vm.tel,vm.email).then(function (response) {
                if(!(response.data.message=='success')){
                    return false;
                }
            });
        };
    });
})();