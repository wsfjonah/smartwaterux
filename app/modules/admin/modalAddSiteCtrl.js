/* global angular */
(function() {
    'use strict';
    var modalAddSiteModule = angular.module('modal.addSite',[]);
    modalAddSiteModule.controller('modalAddSite', function modalAddSite ($uibModalInstance, apiService, modalService, $scope, $translate, commonService) {
        var vm=this;
    
    
        vm.submit=function () {
            if(vm.name && vm.address && vm.deviceRef && vm.status && vm.latlng){
                var params={
                    name:vm.name,
                    address:vm.address,
                    device_ref:vm.deviceRef,
                    status:vm.status,
                    latlng:vm.latlng
                }
                var sitejson=JSON.stringify(params);
                var params2={
                    sitejson:sitejson
                }
                apiService.AddSiteApi(params2).then(function (response) {
                    console.log(response);
                    if(response.data.errorCode){
                        alert(response.data.errorMsg);
                    }else {
                        alert('success');
                        window.location.reload();
                    }
                });
            }else {
                alert('不能为空');
            }
        };
    });
})();