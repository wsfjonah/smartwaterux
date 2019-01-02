/* global angular, __env */
(function() {
    'use strict';
    var flow = angular.module('xProject.flow',['modal.remote','daterangepicker']);
    /* 	baidu api
    *	百度账号：bangzhonggaofenzi@126.com，密码：banzan2004
    */
    flow.$inject = ['$scope','apiService'];
    flow.controller('flowController', function flowController ($scope, apiService,$mdDialog,dialogService,authService,commonService) {
        var vm = this;
        var longitude = 121.324914; //default longitude
        var latitude = 31.099573; //default latitude
        /* 	initial map configuration option
        *	markers will be fetch by api
        */
        //modalService.open(__env.modalInformationTableInfo, 'modalInfoDetails as vm', params);
        vm.projectInfo = authService.getAuthentication();
        var defaultMapInfo = vm.projectInfo.current_project.map;
        vm.siteMapOptions = {
            center: {
                longitude: (angular.isDefined(defaultMapInfo)) ? defaultMapInfo.lng : longitude,
                latitude: (angular.isDefined(defaultMapInfo)) ? defaultMapInfo.lat : latitude
            },
            zoom: (angular.isDefined(defaultMapInfo)) ? defaultMapInfo.level : 13,
            modalUrl: __env.modalTimeSeriesUrl,
            modalUrlInfo: __env.modalInformationTableInfo,
            modalCtrl: 'modalTimeSeriesCtrl as vm',
            modalCtrlInfo: 'modalInfoDetails as vm',
            city: 'ShangHai',
            markers: [],
            boundary: []
        };
        /*	example to reload new marker
        *	use this for search - getSiteData(searchString)
        */
        vm.reloadmap = function(){
            getSiteData();
        };
        /*	default marker config
        */
        vm.defaultMarkerConfig = commonService.markerConfig1('purple');
        vm.showAlert = function(ev) {
            dialogService.alert(ev,{content:"Something went wrong!"});
        };
        getSiteData();
        // getBoundary();

        /*	to get site data
        */
        function getSiteData(string){
            apiService.siteApi(string).then(function(response){
                var obj = {};
                angular.forEach(response.data, function(value/*, key*/){
                    obj = angular.extend({},value,vm.defaultMarkerConfig);
                    if(value.status==="I" || value.status==="O"){
                        obj.icon = "assets/images/map/marker_"+value.status.toLowerCase()+".png";
                    }
                    if(angular.isDefined(value.geo_latlng) && value.geo_latlng.split(',').length>=2){
                        obj.latitude = parseFloat(value.geo_latlng.split(',')[0]);
                        obj.longitude = parseFloat(value.geo_latlng.split(',')[1]);
                    }
                    if(angular.isDefined(value.name)){
                        obj.title = value.name;
                    }
                    if(angular.isDefined(value.optional)){
                        obj.optional = value.optional;
                    }
                    if(angular.isDefined(value.tag)){
                        obj.tag = value.tag;
                    }
                    if(angular.isDefined(value.geo_address)){
                        obj.content = value.geo_address;
                    }
                    vm.siteMapOptions.markers.push(obj);
                });
            }).catch(function(/*err*/){
            });
        }

        function getBoundary(){
            apiService.boundaryApi().then(function(response){
                angular.forEach(response.data.points, function(value/*, key*/){
                    vm.siteMapOptions.boundary.push(value);
                });
            }).catch(function(/*err*/){
            });
        }
    });
})();