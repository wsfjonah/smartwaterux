/* global angular, __env */
(function() {
	'use strict';
	var location = angular.module('xProject.location',['modal.remote','daterangepicker']);
	/* 	baidu api
	*	百度账号：bangzhonggaofenzi@126.com，密码：banzan2004
	*/
	location.$inject = ['$scope','apiService'];
	location.controller('locationController', function locationController ($scope, apiService,$mdDialog,dialogService) {
		var vm = this;
		var longitude = 121.324914; //default longitude
		var latitude = 31.099573; //default latitude
		/* 	initial map configuration option
		*	markers will be fetch by api
		*/
		//modalService.open(__env.modalInformationTableInfo, 'modalInfoDetails as vm', params);
		vm.siteMapOptions = {
			center: {
				longitude: longitude,
				latitude: latitude
			},
			modalUrl: __env.modalTimeSeriesUrl,
			modalUrlInfo: __env.modalInformationTableInfo,
			modalCtrl: 'modalTimeSeriesCtrl as vm',
			modalCtrlInfo: 'modalInfoDetails as vm',
			zoom: 17,
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
		vm.defaultMarkerConfig = {
			icon: 'assets/images/map/marker_n.png',
			width: 30,
			height: 38,
			title: '',
			content: ''
		};
		vm.showAlert = function(ev) {
			dialogService.alert(ev,{content:"Something went wrong!"});
		};
		getSiteData();
		getBoundary();

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