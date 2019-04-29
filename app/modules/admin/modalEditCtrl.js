/* global angular */
(function() {
    'use strict';
    var modalEditModule = angular.module('modal.edit',[]);
    modalEditModule.controller('modalEdit', function modalEdit ($uibModalInstance, items, apiService, modalService, $scope, $translate, commonService) {
        var vm=this;
        vm.items = items;
        console.log(items);
        var device=vm.items.device_ref;
        var name=vm.items.name;
        var address=vm.items.geo_address;
        var latlng=vm.items.geo_latlng;
        var status=vm.items.status;
        var id=vm.items._id;
        vm.device=device;
        vm.name=name;
        vm.address=address;
        vm.latlng=latlng;
        vm.status=status;
        vm.status1='';
        
        if(vm.status=='空闲'){
            vm.status1='I';
        }else if(vm.status=='正常'){
            vm.status1='N';
        }else if(vm.status=='测试'){
            vm.status1='T';
        }else if(vm.status=='错误'){
            vm.status1='E';
        }
            vm.submit=function () {
                // var s=$("#statusSelect option:selected").val();
                if(vm.name && vm.device && vm.address && vm.status1 && vm.latlng){
                    var sitejson={
                        id:id,
                        name:vm.name,
                        device_ref:vm.device,
                        address:vm.address,
                        status:vm.status1,
                        latlng:vm.latlng
                    }
                    console.log(vm.status1);
                    var sitejson1=JSON.stringify(sitejson);
                    var params={
                        siteid:id,
                        sitejson:sitejson1
                    }
                    apiService.editSiteApi(params).then(function (response) {
                        console.log(response);
                        if(response.data.errorCode){
                            alert(response.data.errorMsg);
                        }else {
                            window.location.reload();
                        }
                    });
                }
                
            };
        
      
        
    });
})();