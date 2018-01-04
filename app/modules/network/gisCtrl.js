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
		var colorSet = ["#FF1493","#FFA500","#0f7ca8","#008066","#96137c","#696969","#f9b49d","#c60303","#3867c4","#823f5e","#687759","#d14959","#703e7f","#000000"];
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
			mapType: "networkmap",
			markers: [],
			boundary: [],
			heatMap: [],
			pipes: [],
			menus: {
				pipes:{
					label:"Pipes",
					results:[]
				},
				sensors:{
					label:"Sensors",
					results:[]
				},
				status:{
					label:"Status",
					results:[]
				}
			},
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
			var menuObj = {};
			var zoneObj = {};
			console.log('call sensor');
			apiService.networkSensorApi().then(function(response){
				console.log('#sensor');
				//console.log(response.data);
				//console.log(JSON.stringify(response.data));
				angular.forEach(response.data, function(row){
					//console.log(row);
					var point = row.geo_latlng;
					obj = angular.extend({},row,vm.defaultMarkerConfig);
					obj.latitude = point.split(',')[0];
					obj.longitude = point.split(',')[1];
					obj.title = row.name;
					obj.content = '<table class="table table-sm table-striped table-bordered">';
						obj.content += '<tbody>';
							obj.content += '<tr>';
								obj.content += '<td>ID:</td>';
								obj.content += '<td>'+row._id+'</td>';
							obj.content += '</tr>';
							obj.content += '<tr>';
								obj.content += '<td>Type:</td>';
								obj.content += '<td>'+row.type+'</td>';
							obj.content += '</tr>';
							obj.content += '<tr>';
								obj.content += '<td>RTU:</td>';
								obj.content += '<td>'+row.device_ref+'</td>';
							obj.content += '</tr>';
							obj.content += '<tr>';
								obj.content += '<td>Geo:</td>';
								obj.content += '<td>'+row.geo_ref+'</td>';
							obj.content += '</tr>';
							obj.content += '<tr>';
								obj.content += '<td>Layer:</td>';
								obj.content += '<td>'+row.tag.layer+'</td>';
							obj.content += '</tr>';
							obj.content += '<tr>';
								obj.content += '<td>Subzone:</td>';
								obj.content += '<td>'+row.tag.subzone+'</td>';
							obj.content += '</tr>';
						obj.content += '</tbody>';
					obj.content += '</table>';
					vm.siteMapOptions.markers.push(obj);
					if(!menuObj.hasOwnProperty(row.status)){
						menuObj[row.status] = null;
						vm.siteMapOptions.menus.status.results.push(row.status);
					}
					if(angular.isDefined(row.tag.subzone) && !zoneObj.hasOwnProperty(row.tag.subzone)){
						zoneObj[row.tag.subzone] = null;
						vm.siteMapOptions.menus.sensors.results.push(row.tag.subzone);
					}
				});
			}).catch(function(/*err*/){
			});
		}
		function getPipeData(){
			//https://jsoneditoronline.org/?id=7b75dd3de8a21073a49aea5c01656971
			var obj = {};
			var zoneObj = {};
			console.log('call network');
			apiService.networkPipeApi().then(function(response){
				console.log('#pipe');
				console.log(response);
				//console.log(JSON.stringify(response.data));
				angular.forEach(response.data, function(row){
					obj = {};
					var weight = row.diameter/250;
					if(weight<=1){
						weight = 1;
					}
					obj.color = getColorPipe(row);
					obj.weight = weight;
					obj.location = [];
					angular.forEach(row.location, function(loc){
						obj.location.push({
							latitude: loc.latitude,
							longitude: loc.longitude
						});
					});
					vm.siteMapOptions.pipes.push(obj);
					if(angular.isDefined(row.options.subzone) && !zoneObj.hasOwnProperty(row.options.subzone)){
						zoneObj[row.options.subzone] = null;
						vm.siteMapOptions.menus.pipes.results.push(row.options.subzone);
					}
				});
			}).catch(function(/*err*/){
			});
		}

		function getColorPipe(pipe){
			var zone = pipe.options.subzone;
			var setColor = "blue";
			if(angular.isDefined(zone) && pipeColor.hasOwnProperty(zone)){
				setColor = pipeColor[zone];
			}else if(angular.isDefined(zone) && !pipeColor.hasOwnProperty(zone) && colorSet.length){
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