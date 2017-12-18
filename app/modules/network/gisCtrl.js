/* global angular */
(function() {
	'use strict';
	var gis = angular.module('xProject.gis',[]);

	gis.$inject = ['$scope'];

	gis.controller('gisController', function cityOverviewController ($scope, apiService, $window, authService) {
		var vm = this;
		var longitude = 121.32521; //default longitude
		var latitude = 31.099466; //default latitude
		vm.projectInfo = authService.getAuthentication();
		var defaultMapInfo = vm.projectInfo.current_project.map;
		/* 	initial map configuration option
		*	markers will be fetch by api
		*/
		vm.siteMapOptions = {
			center: {
				longitude: (angular.isDefined(defaultMapInfo)) ? defaultMapInfo.lng : longitude,
				latitude: (angular.isDefined(defaultMapInfo)) ? defaultMapInfo.lat : latitude
			},
			zoom: (angular.isDefined(defaultMapInfo)) ? defaultMapInfo.level : 13,
			city: 'ShangHai',
			mapType: "heatmap",
			markers: [],
			boundary: [],
			heatMap: [],
			pipes: [],
			fullScreen: false
		};
		vm.defaultMarkerConfig = {
			icon: 'assets/images/map/marker_n.png',
			width: 30,
			height: 38,
			title: '',
			content: ''
		};

		getHeatMapData();
		getSensorData();
		getPipeData();

		function getHeatMapData(){
			apiService.heatMapApi().then(function(response){
				angular.forEach(response.data.values, function(row){
					var point = row.location[0];
					vm.siteMapOptions.heatMap.push({
						"lng": point.longitude,
						"lat": point.latitude,
						"count": row.value
					});
				});
			}).catch(function(err){
				console.log('#error');
				console.log(err);
			});
		}

		function getSensorData(){
			var query = {"layer":"n1"};
			var obj = {};
			apiService.sensorApi($window.encodeURIComponent(JSON.stringify(query))).then(function(response){
				angular.forEach(response.data, function(row){
					var point = row.location[0];
					obj = angular.extend({},row,vm.defaultMarkerConfig);
					obj.latitude = point.latitude;
					obj.longitude = point.longitude;
					obj.title = row.options.sensorname;
					obj.content = "PIPE ID: "+row.options.pipeid+"<br>";
					obj.content += "STATUS: "+row.options.status+"<br>";
					obj.content += "SUBZONE: "+row.options.subzone;
					vm.siteMapOptions.markers.push(obj);
				});
			}).catch(function(/*err*/){
			});
		}
		function getPipeData(){
			var query = {"layer":"n1"};
			var obj = {};
			apiService.pipeApi($window.encodeURIComponent(JSON.stringify(query))).then(function(response){
				angular.forEach(response.data, function(row){
					obj = {};
					var color = "blue";
					var weight = row.diameter/50;
					if(weight<=0){
						weight = 1;
						color = "red";
					}
					obj.color = color;
					obj.weight = weight;
					obj.location = [];
					angular.forEach(row.location, function(loc){
						obj.location.push({
							latitude: loc.latitude,
							longitude: loc.longitude
						});
					});
					vm.siteMapOptions.pipes.push(obj);
				});
			}).catch(function(/*err*/){
			});
		}
	});
})();