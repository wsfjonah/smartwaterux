/* global angular */
(function() {
	'use strict';
	var gis = angular.module('xProject.gis',[]);

	gis.$inject = ['$scope'];

	gis.controller('gisController', function cityOverviewController ($scope, apiService, $window) {
		var vm = this;
		var longitude = 121.32521; //default longitude
		var latitude = 31.099466; //default latitude
		/* 	initial map configuration option
		*	markers will be fetch by api
		*/
		vm.siteMapOptions = {
			center: {
				longitude: longitude,
				latitude: latitude
			},
			zoom: 18,
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
			//var query = {"layer":"n1"};
			var query = {};
			var obj = {};
			apiService.pipeApi($window.encodeURIComponent(JSON.stringify(query))).then(function(response){
				angular.forEach(response.data, function(row){
					console.log("get pipe: "+row);
					obj = {};
					var color = "#08088A";
					var weight = row.diameter/250;
					if(weight <= 3) {
						color = "#013ADF";
					}if(weight < 1) {
						weight = 1;
						color = "#A9A9F5";
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