/* global angular */
(function() {
	'use strict';
	var gis = angular.module('xProject.gis',[]);

	gis.$inject = ['$scope'];

	gis.controller('gisController', function cityOverviewController ($scope, apiService, $window, authService, $translate) {
		var vm = this;
		var longitude = 121.32521; //default longitude
		var latitude = 31.099466; //default latitude
		vm.projectInfo = authService.getAuthentication();
		var defaultMapInfo = vm.projectInfo.current_project.map;
		var pipeColor = {};
		var colorSet = ["#FF1493","#FFA500","#0f7ca8","#3867c4","#96137c","#696969","#f9b49d","#c60303","#008066","#823f5e","#687759","#d14959","#703e7f","#000000"];
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
					results:["N","I","T","S","E"]
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
		getPipeSummary();
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
			apiService.networkSensorApi().then(function(response){
				angular.forEach(response.data, function(row){
					var point = row.geo_latlng;
					obj = angular.extend({},row,vm.defaultMarkerConfig);
					obj.latitude = point.split(',')[0];
					obj.longitude = point.split(',')[1];
					obj.title = row.name;
					obj.content = '<table class="table table-sm table-striped table-bordered">';
						obj.content += '<tbody>';
							obj.content += '<tr>';
								obj.content += '<td>'+$translate.instant('site_network_table_field_id')+':</td>';
								obj.content += '<td>'+row._id+'</td>';
							obj.content += '</tr>';
							obj.content += '<tr>';
								obj.content += '<td>'+$translate.instant('site_network_table_field_type')+':</td>';
								obj.content += '<td>'+row.type+'</td>';
							obj.content += '</tr>';
							obj.content += '<tr>';
								obj.content += '<td>'+$translate.instant('site_network_table_field_rtu')+':</td>';
								obj.content += '<td>'+row.device_ref+'</td>';
							obj.content += '</tr>';
							obj.content += '<tr>';
								obj.content += '<td>'+$translate.instant('site_network_table_field_geo')+':</td>';
								obj.content += '<td>'+row.geo_ref+'</td>';
							obj.content += '</tr>';
							obj.content += '<tr>';
								obj.content += '<td>'+$translate.instant('site_network_table_field_layer')+':</td>';
								obj.content += '<td>'+row.tag.layer+'</td>';
							obj.content += '</tr>';
							obj.content += '<tr>';
								obj.content += '<td>'+$translate.instant('site_network_table_field_subzone')+':</td>';
								obj.content += '<td>'+row.tag.subzone+'</td>';
							obj.content += '</tr>';
						obj.content += '</tbody>';
					obj.content += '</table>';
					vm.siteMapOptions.markers.push(obj);
				});
			}).catch(function(/*err*/){
			});
		}
		function getPipeData(){
			var obj = {};
			apiService.networkPipeApi().then(function(response){
				angular.forEach(response.data, function(row){
					obj = {};
					var weight = row.diameter/250;
					if(weight<=1){
						weight = 1;
					}
					obj.color = getColorPipe(row);
					obj.weight = weight;
					obj.location = [];
					obj.diameter = row.diameter;
					obj.id = row.id;
					obj.options = row.options;
					obj.type = row.type;
					obj.subzone = row.subzone;
					obj.title = "Pipe Information";
					obj.content = '<div class="overflow:auto"><table class="table table-sm table-striped table-bordered table-responsive">';
						obj.content += '<tbody>';
							obj.content += '<tr>';
								obj.content += '<td>'+$translate.instant('site_network_table_field_id')+':</td>';
								obj.content += '<td>'+obj.id+'</td>';
							obj.content += '</tr>';
							obj.content += '<tr>';
								obj.content += '<td>'+$translate.instant('site_network_table_field_type')+':</td>';
								obj.content += '<td>'+obj.type+'</td>';
							obj.content += '</tr>';
							obj.content += '<tr>';
								obj.content += '<td>Diameter:</td>';
								obj.content += '<td>'+obj.diameter+'</td>';
							obj.content += '</tr>';
							obj.content += '<tr>';
								obj.content += '<td>Others:</td>';
								obj.content += '<td><pre>'+angular.toJson(obj.options, true)+'</pre></td>';
							obj.content += '</tr>';
						obj.content += '</tbody>';
					obj.content += '</table><div>';
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

		function getPipeSummary(){
			apiService.networkPipeSummaryApi().then(function(response){
				if(angular.isDefined(response.data)){
					angular.forEach(response.data.subzones, function(zone){
						vm.siteMapOptions.menus.pipes.results.push(zone);
						vm.siteMapOptions.menus.sensors.results.push(zone);
					});
				}
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
			}
			return setColor;
		}
	});
})();