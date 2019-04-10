/* global angular, __env, T */
(function() {
	'use strict';
	var modalInfoMapModule = angular.module('modal.infoMap',[]);
	modalInfoMapModule.$inject = ['$ocLazyLoad','mapApi'];
	modalInfoMapModule.controller('modalInfoMap', function ($uibModalInstance, items, apiService, modalService, $scope, $translate, $ocLazyLoad, $window, $q, mapApi) {
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
		};
		vm.header = vm.items.name;
		var longitude = parseFloat(vm.items.longitude);//121.324914; //default longitude
		var latitude = parseFloat(vm.items.latitude);//31.099573; //default latitude
		vm.ready = function(){
			mapApi.then(function () {
				vm.mapInit();
			}, function () {
				// Promise rejected
			});
			function loadScript() {
				// Use global document since Angular's $document is weak
				var script = document.createElement('script');
				// script.src = "http://api.map.baidu.com/api?v=2.0&ak=您的密钥&callback=init";
				script.src = 'https://api.tianditu.gov.cn/api?v=4.0&tk=556f353f742842fd5aba67f36c52a0a6';
				document.body.appendChild(script);
			}
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
			var map = new T.Map("allmap");            // 创建Map实例
			var point = new T.LngLat(longitude, latitude); // 创建点坐标
			var top_left_navigation = new T.Control.Zoom();
			map.centerAndZoom(point,12);
			map.enableScrollWheelZoom();
			map.addControl(top_left_navigation);
			var icon = new T.Icon({iconUrl:config.icon, iconSize:new T.Point(config.width, config.height)});
			vm.addMarker(map, new T.LngLat(longitude, latitude), icon);
		};
		vm.addMarker = function(map, point, icon){
			var marker = new T.Marker(point, { icon: icon });
			map.addOverLay(marker);
		};
	});

})();