/* global angular */
(function() {
	'use strict';
	var networkAnalysis = angular.module('xProject.networkAnalysis',[]);
	networkAnalysis.$inject = ['$scope'];
	networkAnalysis.controller('networkAnalysisController', function networkAnalysisController ($scope, apiService, $window, authService, $translate, commonService) {
		var vm = this;
		var longitude = 121.32521; //default longitude
		var latitude = 31.099466; //default latitude
		vm.projectInfo = authService.getAuthentication();
		var defaultMapInfo = vm.projectInfo.current_project.map;
		var pipeColor = {};
		var colorSet = commonService.getColors();
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
			mapType: "networkAnalysisMap",
			markers: [],
			boundary: [],
			pumps: [],
			pipes: [],
			hydrant: [],
			coveragePipes: [],
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
				},
				pumps:{
					label:"Pumps",
					results:[]
				},
				hydrant:{
					label:"Hydrant",
					results:[]
				},
				coverage:{
					label:"Clear Coverage"
				}
			},
			fullScreen: false
		};
		vm.defaultMarkerConfig = commonService.markerConfig();

		getPipeSummary();
		getSensorData();
		getPipeData();
		getPumpData();

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
			apiService.networkAnalysisPipeApi().then(function(response){
				angular.forEach(response.data, function(row){
					obj = {};
					var weight = parseInt(row.optional.diameter)/250;
					if(weight<=1){
						weight = 1;
					}
					obj.color = getColorPipe(row);
					obj.weight = weight;
					obj.location = [];
					obj.diameter = row.optional.diameter;
					obj.id = row._id;
					obj.tag = row.tag;
					obj.type = row.type;
					obj.subzone = row.tag.subzone;
					obj.title = $translate.instant('site_network_info_pipe_title');
					obj.content = '<div class="overflow:auto"><table class="table table-sm table-striped table-bordered">';
						obj.content += '<tbody>';
							obj.content += '<tr>';
								obj.content += '<td style="width:100px;min-width:100px">'+$translate.instant('site_network_table_field_id')+':</td>';
								obj.content += '<td>'+obj.id+'</td>';
							obj.content += '</tr>';
							obj.content += '<tr>';
								obj.content += '<td style="width:100px;min-width:100px">'+$translate.instant('site_network_table_field_type')+':</td>';
								obj.content += '<td>'+obj.type+'</td>';
							obj.content += '</tr>';
							obj.content += '<tr>';
								obj.content += '<td style="width:100px;min-width:100px">'+$translate.instant('site_network_table_field_diameter')+':</td>';
								obj.content += '<td>'+obj.diameter+'</td>';
							obj.content += '</tr>';
							obj.content += '<tr>';
								obj.content += '<td style="width:100px;min-width:100px">'+$translate.instant('site_network_table_field_others')+':</td>';
								obj.content += '<td><pre>'+angular.toJson(obj.tag, true)+'</pre></td>';
							obj.content += '</tr>';
						obj.content += '</tbody>';
					obj.content += '</table>';
					obj.content += '<div>';
					angular.forEach(row.junctions, function(loc){
						obj.location.push({
							latitude: loc.lat,
							longitude: loc.lng
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
		function getPumpData(){
			var obj = {};
			apiService.networkPumpApi().then(function(response){
				angular.forEach(response.data, function(row){
					if(angular.isDefined(row.location) && row.location.length){
						vm.siteMapOptions.pumps.push(row.location[0]);
						vm.siteMapOptions.menus.pumps.results.push(row.location[0].name);
					}
				});
			});
		}
		function getColorPipe(pipe){
			var zone = pipe.tag.subzone;
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