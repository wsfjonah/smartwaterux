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
                                dialogService.alert(null,{content:response.data.errorMsg});
                            }else {
                                dialogService.alert(null,{content:'密码修改成功'});
                            }
                        });
                    }else {
                        dialogService.alert(null,{content:'两次密码不一致'});
                    }
                }
            }else {
                dialogService.alert(null,{content:'请全部填写'});
            }
            
        };
    });
})();