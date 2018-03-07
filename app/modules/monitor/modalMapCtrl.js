/* global angular, BMap */
(function() {
	'use strict';
	var modalMonitorMapModule = angular.module('modal.modalMonitorMapCtrl',[]);
	modalMonitorMapModule.$inject = ['$ocLazyLoad'];
	modalMonitorMapModule.controller('modalMonitorMapCtrl', function ($uibModalInstance, items, apiService, modalService, $scope, $translate, $ocLazyLoad, commonService, authService) {
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
		vm.projectInfo = authService.getAuthentication();
		var defaultMapInfo = vm.projectInfo.current_project.map;
		var pipeColor = {};
		var colorSet = commonService.getColors();
		var longitude = parseFloat(vm.items.longitude);//121.324914; //default longitude
		var latitude = parseFloat(vm.items.latitude);//31.099573; //default latitude
		vm.defaultMarkerConfig = commonService.markerConfig();
		vm.siteMapOptions = {
			center: {
				longitude: (angular.isDefined(defaultMapInfo)) ? defaultMapInfo.lng : longitude,
				latitude: (angular.isDefined(defaultMapInfo)) ? defaultMapInfo.lat : latitude
			},
			zoom: 17,
			city: 'ShangHai',
			boundary: [],
			markers: [],
			pipes: []
		};
		vm.addMarker = function(map, point, icon){
			var marker = new BMap.Marker(point, { icon: icon });
			map.addOverlay(marker);
		};
		formatSensors();
		formatPipes();
		function formatPipes(){
			var obj = {};
			angular.forEach(vm.items.localization, function(row){
				if(row.type==="pipe"){
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
					obj.options = row.tag;
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
								obj.content += '<td><pre>'+angular.toJson(obj.options, true)+'</pre></td>';
							obj.content += '</tr>';
						obj.content += '</tbody>';
					obj.content += '</table><div>';
					angular.forEach(row.junctions, function(loc){
						vm.siteMapOptions.boundary.push({
							latitude: loc.lat,
							longitude: loc.lng
						});
						obj.location.push({
							latitude: loc.lat,
							longitude: loc.lng
						});
					});
					vm.siteMapOptions.pipes.push(obj);
				}
			});
		}
		function formatSensors(){
			var obj = {};
			angular.forEach(vm.items.localization, function(row){
				if(row.type==="junction"){
					obj = angular.extend({},row,vm.defaultMarkerConfig);
					obj.latitude = row.loc.lat;
					obj.longitude = row.loc.lng;
					vm.siteMapOptions.boundary.push({
						latitude: row.loc.lat,
						longitude: row.loc.lng
					});
					obj.title = row._id;
					obj.content = '<table class="table table-sm table-striped table-bordered">';
						obj.content += '<tbody>';
							obj.content += '<tr>';
								obj.content += '<td>'+$translate.instant('site_network_table_field_type')+':</td>';
								obj.content += '<td>'+row.type+'</td>';
							obj.content += '</tr>';
							obj.content += '<tr>';
								obj.content += '<td>'+$translate.instant('site_network_table_field_geo')+':</td>';
								obj.content += '<td>'+row.geo_id+'</td>';
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
				}
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