/* global angular, __env, BMap */
(function() {
	'use strict';
	var modalInfoMapModule = angular.module('modal.infoMap',[]);
	modalInfoMapModule.$inject = ['$ocLazyLoad'];
	modalInfoMapModule.controller('modalInfoMap', function ($uibModalInstance, items, apiService, modalService, $scope, $translate, $ocLazyLoad) {
		var vm = this;
		vm.items = items;
		vm.selected = {
			item: vm.items[0]
		};
		vm.ok = function () {
			$uibModalInstance.close(vm.selected.item);
		};
		vm.cancel = function () {
			$uibModalInstance.dismiss('cancel');
			console.log('cancel');
		};
		vm.header = vm.items.name;
		var longitude = parseFloat(vm.items.longitude);//121.324914; //default longitude
		var latitude = parseFloat(vm.items.latitude);//31.099573; //default latitude
		vm.ready = function(){
			$ocLazyLoad.load('js!https://api.map.baidu.com/api?v=2.0&ak=CSFSaXio89D3WK1AB38sLNtnkV9fWZO4').then(function(){
				vm.mapInit();
			});
		};
		vm.siteMapOptions = {
			center: {
				longitude: longitude,
				latitude: latitude
			},
			modalUrl: __env.modalTimeSeriesUrl,
			modalCtrl: 'modalTimeSeriesCtrl as vm',
			zoom: 17,
			city: 'ShangHai',
			markers: [{
				latitude: latitude,
				longitude: longitude
			}],
			boundary: []
		};
		vm.mapInit = function(){
			var config = {
				icon: 'assets/images/map/marker_n.png',
				width: 30,
				height: 38,
			};
			var map = new BMap.Map("allmap");            // 创建Map实例
			var point = new BMap.Point(longitude, latitude); // 创建点坐标
			var top_left_navigation = new BMap.NavigationControl();
			map.centerAndZoom(point,15);
			map.enableScrollWheelZoom();
			map.addControl(top_left_navigation);
			var icon = new BMap.Icon(config.icon, new BMap.Size(config.width, config.height));
			vm.addMarker(map, new BMap.Point(longitude, latitude), icon);
		};
		vm.addMarker = function(map, point, icon){
			var marker = new BMap.Marker(point, { icon: icon });
			map.addOverlay(marker);
		};
	});

})();