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
		var pipeColor = {};
		var colorSet = ["#FF1493","#FFA500","#8B4513","#008000","#8B008B","#696969","#E9967A","#FF0000"];
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

		//getHeatMapData();
		getSensorData();
		getPipeData();

		/*function getHeatMapData(){
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
		}*/

		/* study
		http://smartwater.banxiniot.com/ux/app/modules/gis/view/menu.html
		http://smartwater.banxiniot.com/ux/app/utils/utils.js
		http://smartwater.banxiniot.com/ux/app/modules/gis/view/js/gisview.js
		http://smartwater.banxiniot.com/ux/app/modules/gis/model/js/gisdata.js
		http://smartwater.banxiniot.com/ux/app/modules/gis/control/js/giscontrol.js
		http://smartwater.banxiniot.com/ux/app/modules/gis/view/js/view.js
		http://smartwater.banxiniot.com/ux/app/modules/common/project.js
		*/

		function getSensorData(){
			var obj = {};
			console.log('call sensor');
			apiService.networkSensorApi().then(function(response){
				console.log('#sensor');
				//console.log(response.data);
				//console.log(JSON.stringify(response.data));
				angular.forEach(response.data, function(row){
					var point = row.geo_latlng;
					obj = angular.extend({},row,vm.defaultMarkerConfig);
					obj.latitude = point.split(',')[0];
					obj.longitude = point.split(',')[1];
					obj.title = "test";
					obj.content = "content";
					//obj.title = row.options.sensorname;
					// obj.content = "PIPE ID: "+row.options.pipeid+"<br>";
					// obj.content += "STATUS: "+row.options.status+"<br>";
					// obj.content += "SUBZONE: "+row.options.subzone;
					vm.siteMapOptions.markers.push(obj);
				});
			}).catch(function(/*err*/){
			});
		}
		function getPipeData(){
			//https://jsoneditoronline.org/?id=7b75dd3de8a21073a49aea5c01656971
			var query = {"layer":"n1"};
			var obj = {};
			console.log('call network');
			apiService.networkPipeApi().then(function(response){
				console.log('#pipe');
				//console.log(JSON.stringify(response.data));
				angular.forEach(response.data, function(row){
					obj = {};
					var weight = row.diameter/250;
					if(weight<=1){
						weight = 1;
					}
					obj.color = getColorPipe(row);
					console.log(obj.color);
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

		function getColorPipe(pipe){
			var zone = pipe.options.subzone;
			var setColor = "blue";
			if(angular.isDefined(zone) && pipeColor.hasOwnProperty(zone)){
				console.log('existing pipe - '+zone);
				setColor = pipeColor[zone];
			}else if(angular.isDefined(zone) && !pipeColor.hasOwnProperty(zone) && colorSet.length){
				console.log('new pipe - '+zone);
				pipeColor[zone] = colorSet[0];
				setColor = pipeColor[zone];
				colorSet.shift();
			}else{
				console.log('no enuf color');
			}
			return setColor;
		}
	});
})();