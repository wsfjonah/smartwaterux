/* global angular, T */
(function() {
	'use strict';
	var modalMonitorMapModule = angular.module('modal.modalMonitorMapCtrl',[]);
	modalMonitorMapModule.$inject = ['$ocLazyLoad'];
	modalMonitorMapModule.controller('modalMonitorMapCtrl', function ($uibModalInstance, items, apiService, modalService, $scope, $translate, $ocLazyLoad, commonService, authService) {
		var vm = this;
		console.log("modalMonitorMapModule");
		
		var event = items;
		var site;
		
		vm.ok = function () {
			$uibModalInstance.close();
		};
		vm.cancel = function () {
			$uibModalInstance.dismiss('cancel');
		};
		vm.projectInfo = authService.getAuthentication();
		var defaultMapInfo = vm.projectInfo.current_project.map;
		var pipeColor = {};
		var colorSet = commonService.getColors();
		
		vm.ready = function(){
			console.log("monitor modalMap ready.");
			vm.getSiteDetail(event.siteid);
		};
		
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
		
		vm.getSiteDetail = function(siteid){
			console.log("event get site detail.");
			apiService.siteDetailApi(siteid).then(function(response){
				site = response.data;
				console.log(site);
				vm.mapInit();
			}).catch(function(/*err*/){
			});
		};
		
		vm.mapInit = function(){
			var config = {
				icon: 'assets/images/map/marker_n.png',
				width: 30,
				height: 38,
			};
			
			var map = new T.Map("allmap");
			var point = new T.LngLat(site.geo_latlng.split(",")[1], site.geo_latlng.split(",")[0]);
			console.log("init map at: ");
			console.log(point);
			
			var top_left_navigation = new T.Control.Zoom();
			map.centerAndZoom(point,15);
			map.enableScrollWheelZoom();
			map.addControl(top_left_navigation);
			var icon = new T.Icon({iconUrl:config.icon, iconSize:new T.Point(config.width, config.height)});
			vm.addMarker(map, new T.LngLat(site.geo_latlng.split(",")[1], site.geo_latlng.split(",")[0]), icon);
			drawPipes(map);
		};
		
		vm.addMarker = function(map, point, icon){
			var marker = new T.Marker(point, { icon: icon });
			map.addOverLay(marker);
		};
		
		
		function drawPipes(map){
			var obj = {};
			angular.forEach(event.localization, function(row){
				if(row.type==="pipe"){
					console.log("draw pipe: "+row._id);
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
						obj.location.push(new T.LngLat(loc.lng, loc.lat));
					});
					
					var pline = new T.Polyline(obj.location, {strokeColor: obj.color, strokeWeight:obj.weight, strokeOpacity:1});
					console.log(pline);
					map.addOverLay(pline);
					
					pline.addEventListener("click", function(e){
						console.log(e);
						infoWindow(map, obj.content, e.lnglat.lat, e.lnglat.lng);
					});
				}
			});
		}
		
		function infoWindow(map, content, lat, lng) {
			var opts = {    
				width : 350,  
				height: 300,   
				title : "Pipe Information" 
			};
			var w = new T.InfoWindow(content, opts);
			map.openInfoWindow(w, new T.LngLat(lng, lat));
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