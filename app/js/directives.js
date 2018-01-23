/* global angular, BMap, xpro, __env, BMapLib, BMAP_ANCHOR_TOP_RIGHT */
(function() {
	'use strict';
	angular
		.module('xProject.directive', ['ui.bootstrap'])
		.directive('xproMap', xproMap)
		.directive('xproHeatmap', xproHeatmap)
		.directive('xproNetworkMap', xproNetworkMap)
		.directive('projectDropdown', projectDropdown)
		.directive('canvasToolbar', canvasToolbar)
		.directive('elemReady', elemReady)
		.service('mapApi', mapApi)
		.service('heatmapApi', heatmapApi);

	//global defined
	var heatmapOverlay;

	function canvasToolbar(){
		return {
			restrict: 'AE',
			scope: {
				options: '='
			},
			template: '<div class="btn-group" role="group"><button type="button" class="btn btn-secondary" data-state="pan" data-value="pan" data-toggle="tooltip" title="Pan Move"><i class="ti-split-h"></i></button><button type="button" class="btn btn-secondary" data-state="reset" data-toggle="tooltip" title="Reset Zoom"><i class="ti-close"></i></button></div>',
			link: function (scope, elem) {
				var default_opts = {
					chartElem: null,
					min: 0,
					max: 0
				};
				var opts = angular.extend({}, default_opts, scope.options);

				canvasAction(elem, opts);
				elem.on('click','button[data-state="pan"]',function(){
					togglePan($(this), opts);
				});
				elem.on('click','button[data-state="reset"]',function(){
					var toolbar = $('#'+opts.chartElem).find('.canvasjs-chart-toolbar');
					toolbar.find('button[state="reset"]').click();
					xpro.destroyTooltip();
				});
				scope.$watch('options', function(newValue, oldValue) {
					if (newValue !== oldValue) {
						opts = angular.extend({}, default_opts, newValue);
						canvasAction(elem, opts);
					}
				}, true);
			}
		};
	}
	function canvasAction(elem, opts){
		var chart = $('#'+opts.chartElem);
		chart.find('.canvasjs-chart-toolbar').addClass('hide');
		if(opts.min<=0 && opts.max<=0){
			$(elem).hide();
		}else{
			$(elem).show();
		}
		togglePan($(elem).find('[data-state="pan"]'), opts, true);
	}
	function togglePan(btnElem, opts, isTrigger){
		var panElem = btnElem,
		toolbar = $('#'+opts.chartElem).find('.canvasjs-chart-toolbar'),
		value = panElem.data('value'),
		panActive = panElem.hasClass('isactive');

		if(typeof isTrigger!=="undefined" && isTrigger){
			if(value==="pan"){
				toolbar.find('button[state="zoom"]').click();
			}else if(value==="zoom"){
				toolbar.find('button[state="pan"]').click();
			}
			return false;
		}

		if(panActive){
			toolbar.find('button[state="zoom"]').click();
			panElem.data('original-title', 'Pan Move').data('value','pan').removeClass('isactive').find('i').attr('class','ti-split-h');
		}else{
			toolbar.find('button[state="pan"]').click();
			panElem.data('original-title','Zoom').data('value','zoom').addClass('isactive').find('i').attr('class','ti-zoom-in');
		}
		xpro.destroyTooltip();
		xpro.tooltips();
	}

	/* get dom ready
	*/
	elemReady.$inject = ['$parse'];
	function elemReady($parse){
		return {
			restrict: 'A',
			link: link
		};
		function link($scope, elem, attrs){
			elem.ready(function(){
				$scope.$apply(function(){
					var func = $parse(attrs.elemReady);
					func($scope);
				});
			});
		}
	}

	/* switching project from dropdown
	*/
	projectDropdown.$inject = ['authService','$location'];
	function projectDropdown(authService,$location){
		return {
			restrict: 'E',
			scope: {
				options: '='
			},
			template: '<a href="JavaScript:void(0);" class="dropdown-item" ng-repeat="(key, val) in data.projects" ng-class="{active : data.current_project._id == key}" ng-click="switch(key)">{{ val }}</a>',
			controller: function ($scope) {
				$scope.data = $scope.options;
				$scope.switch = function(key){
					if(key!==$scope.data.current_project._id){
						authService.switchProject(key).then(function(response){
				    			if(angular.isDefined(response.data.token)){
				    				authService.updateProject(response.data);
				    				$scope.data = response.data;
				    				$location.path(__env.pageMain);
				    			}
				    		});
					}
				};
			}
		};
	}

	//xproMap.$inject = [];
	/* baidu map
	*/
	xproMap.$inject = ['modalService','mapApi','$translate'];
	function xproMap(modalService, mapApi, $translate) {
		return{
			restrict: 'AE',
			replace: 'true',
			scope:{
				info: '@',
				options: '=',
				onMapLoaded: '&'
			},
			link: function(scope, elem/*, attrs*/) {
				var topHt = $('.topbar').outerHeight();
				elem.css('height',$(window).height()-topHt);
				$(window).resize(function(){
					elem.css('height',$(window).height()-topHt);
				});

				scope.initialize = function() {
					var default_opts = {
						navCtrl: true,
						scaleCtrl: true,
						overviewCtrl: true,
						enableScrollWheelZoom: true,
						enableAutoResize: true,
						zoom: 10,
						mapType: "map",
						fullScreen: false
					};
					var opts = angular.extend({}, default_opts, scope.options);
					var map = createMapInstance(opts, elem);
					var previousMarkers = [];

					//create markers
					redrawMarkers(map, $translate, previousMarkers, opts, scope, modalService);
					//set boundary
					boundaryArea(map, opts);

					scope.$watch('options.markers', function (/*newValue, oldValue*/) {
						redrawMarkers(map, $translate, previousMarkers, opts, scope, modalService);
					}, true);
					scope.$watch('options.boundary', function (/*newValue, oldValue*/) {
						boundaryArea(map, opts, scope);
					}, true);
				};
				mapApi.then(function () {
					scope.initialize();
				}, function () {
					// Promise rejected
				});

			},
			template: '<div ng-style="divStyle"><label ng-style="labelStyle"></label></div>'
		};
	}

	/* baidu heatmap
	*/
	xproHeatmap.$inject = ['$translate','mapApi'];
	function xproHeatmap($translate, mapApi){
		return{
			restrict: 'AE',
			replace: 'true',
			scope:{
				info: '@',
				options: '=',
				onMapLoaded: '&'
			},
			link: function(scope, elem/*, attrs*/) {
				var topHt = $('.topbar').outerHeight();
				elem.css('height',$(window).height()-topHt);
				$(window).resize(function(){
					elem.css('height',$(window).height()-topHt);
				});

				scope.initialize = function() {
					var default_opts = {
						navCtrl: true,
						scaleCtrl: true,
						overviewCtrl: true,
						enableScrollWheelZoom: true,
						zoom: 10,
						mapType: "heatmap",
						fullScreen: false
					};
					var opts = angular.extend({}, default_opts, scope.options);
					var map = createMapInstance(opts, elem, $translate);
					var previousMarkers = [];
					//create markers
					redrawMarkers(map, $translate, previousMarkers, opts, scope);


					//watch markers
					scope.$watch('options.markers', function (/*newValue, oldValue*/) {
						redrawMarkers(map, $translate, previousMarkers, opts, scope);
					}, true);
					//watch pipe
					scope.$watch('options.pipes', function (/*newValue, oldValue*/) {
						drawPipeArea(map, opts, scope);
					}, true);
					//watch heatmap
					scope.$watch('options.heatMap', function (newValue/*, oldValue*/) {
						if(newValue.length){
							map.addEventListener("tilesloaded",drawHeatMap(map, opts));
						}
					}, true);
				};
				mapApi.then(function () {
					scope.initialize();
				}, function () {
					// Promise rejected
				});

			},
			template: '<div ng-style="divStyle"><label ng-style="labelStyle"></label></div>'
		};
	}

	/* network map - gis
	* updated - 4/1/2018
	*/
	xproNetworkMap.$inject = ['$translate','mapApi','apiService'];
	function xproNetworkMap($translate, mapApi, apiService){
		return{
			restrict: 'AE',
			replace: 'true',
			scope:{
				info: '@',
				options: '=',
				onMapLoaded: '&'
			},
			link: function(scope, elem/*, attrs*/) {
				var topHt = $('.topbar').outerHeight();
				elem.css('height',$(window).height()-topHt);
				$(window).resize(function(){
					elem.css('height',$(window).height()-topHt);
				});
				scope.initialize = function() {
					var default_opts = {
						navCtrl: true,
						scaleCtrl: true,
						overviewCtrl: true,
						enableScrollWheelZoom: true,
						zoom: 10,
						mapType: "networkmap",
						fullScreen: false
					};
					var opts = angular.extend({}, default_opts, scope.options);
					var map = createMapInstance(opts, elem, $translate);
					var previousMarkers = [];
					//create markers
					redrawMarkers(map, $translate, previousMarkers, opts, scope, null, apiService);

					//watch markers
					scope.$watch('options.markers', function (/*newValue, oldValue*/) {
						redrawMarkers(map, $translate, previousMarkers, opts, scope, null, apiService);
					}, true);
					//watch menus
					scope.$watch('options.menus', function (/*newValue, oldValue*/) {
						createNetworkMenu(map, opts, $translate);
					}, true);
					//watch pipe
					scope.$watch('options.pipes', function (/*newValue, oldValue*/) {
						drawPipeArea(map, opts, scope);
					}, true);
				};
				mapApi.then(function () {
					scope.initialize();
				}, function () {
					// Promise rejected
				});
			},
			template: '<div ng-style="divStyle"><label ng-style="labelStyle"></label></div>'
		};
	}

	mapApi.$inject = ['$window','$q'];
	function mapApi($window, $q){
		var deferred = $q.defer();

		// Load Google map API script
		function loadScript() {
			// Use global document since Angular's $document is weak
			var script = document.createElement('script');
			// script.src = "http://api.map.baidu.com/api?v=2.0&ak=您的密钥&callback=init";
			script.src = 'https://api.map.baidu.com/api?v=2.0&ak=CSFSaXio89D3WK1AB38sLNtnkV9fWZO4&callback=initMap';
			document.body.appendChild(script);
		}

		// Script loaded callback, send resolve
		$window.initMap = function () {
			deferred.resolve();
		};

		loadScript();
		return deferred.promise;
	}

    	heatmapApi.$inject = ['$window','$q'];
	function heatmapApi($window, $q){
		var deferred = $q.defer();

		// Load Google map API script
		function loadScript() {
			// Use global document since Angular's $document is weak
			var script = document.createElement('script');
			script.src = '';
			document.body.appendChild(script);
		}

		// Script loaded callback, send resolve
		$window.initMap = function () {
			deferred.resolve();
		};
		loadScript();
		return deferred.promise;
	}

	function moveMapToCenter(map, opts){
		var points = [];
		opts.boundary.forEach(function (loc) {
			points.push(new BMap.Point(loc.longitude, loc.latitude));
		});
		map.setViewport(points);
	}

	function fullscreenControl(){
		this.defaultAnchor = BMAP_ANCHOR_TOP_RIGHT;
		this.defaultOffset = new BMap.Size(10, 10);
	}

	function toggleHeatMapButtons(){
		this.defaultAnchor = BMAP_ANCHOR_TOP_RIGHT;
		this.defaultOffset = new BMap.Size(50, 10);
	}

	function toggleNetworkMapButtons(){
		this.defaultAnchor = BMAP_ANCHOR_TOP_RIGHT;
		this.defaultOffset = new BMap.Size(10, 10);
	}

	function createHeatMapButtons(map, opts, element, $translate){
		if(opts.mapType==="heatmap"){
			toggleHeatMapButtons.prototype = new BMap.Control();
			toggleHeatMapButtons.prototype.initialize = function(map){
				var div = document.createElement("div");
				div.className = "btn-group";
				div.setAttribute("data-toggle","buttons");

				//first button
				var labelHeatMap = document.createElement("label");
				labelHeatMap.className = "btn btn-secondary btn-outline btn-sm active";
				labelHeatMap.setAttribute("for","toggle_heatmap");
				var chkHeatMap = document.createElement("input");
				chkHeatMap.type = "checkbox";
				chkHeatMap.setAttribute("name","toggle_heatmap");
				chkHeatMap.setAttribute("id","toggle_heatmap");
				chkHeatMap.setAttribute("checked","checked");
				labelHeatMap.append(chkHeatMap);
				labelHeatMap.innerHTML += $translate.instant('site_city_heatmap_toolbar_heatmap');

				//second button
				var labelPipe = document.createElement("label");
				labelPipe.className = "btn btn-secondary btn-outline btn-sm active";
				labelPipe.setAttribute("for","toggle_pipe");
				var chkPipe = document.createElement("input");
				chkPipe.type = "checkbox";
				chkPipe.setAttribute("name","toggle_pipe");
				chkPipe.setAttribute("id","toggle_pipe");
				chkPipe.setAttribute("checked","checked");
				labelPipe.append(chkPipe);
				labelPipe.innerHTML += $translate.instant('site_city_heatmap_toolbar_pipe');

				//third button
				var labelMarker = document.createElement("label");
				labelMarker.className = "btn btn-secondary btn-outline btn-sm active";
				labelMarker.setAttribute("for","toggle_marker");
				var chkMarker = document.createElement("input");
				chkMarker.type = "checkbox";
				chkMarker.setAttribute("name","toggle_marker");
				chkMarker.setAttribute("id","toggle_marker");
				chkMarker.setAttribute("checked","checked");
				labelMarker.append(chkMarker);
				labelMarker.innerHTML += $translate.instant('site_city_heatmap_toolbar_sensor');

				div.appendChild(labelHeatMap);
				div.appendChild(labelPipe);
				div.appendChild(labelMarker);

				labelHeatMap.onchange = function(/*e*/){
					var isOn = document.getElementById('toggle_heatmap').checked;
					if(typeof heatmapOverlay!=="undefined"){
						if(isOn){
							heatmapOverlay.show();
						}else{
							heatmapOverlay.hide();
						}
					}
				};
				labelPipe.onchange = function(/*e*/){
					var isOn = document.getElementById('toggle_pipe').checked;
					var allOverlay = map.getOverlays();
					for (var i = 0; i < allOverlay.length -1; i++){
						if(allOverlay[i].toString()==="[object Polyline]"){
							if(isOn){
								allOverlay[i].show();
							}else{
								allOverlay[i].hide();
							}
						}
					}
				};

				labelMarker.onchange = function(/*e*/){
					var isOn = document.getElementById('toggle_marker').checked;
					var allOverlay = map.getOverlays();
					for (var i = 0; i < allOverlay.length -1; i++){
						if(allOverlay[i].toString()==="[object Marker]"){
							if(isOn){
								allOverlay[i].show();
							}else{
								allOverlay[i].hide();
							}
						}
					}
				};

				// 添加DOM元素到地图中
				map.getContainer().appendChild(div);
				// 将DOM元素返回
				return div;
			};
			// 创建控件
			var myCtrl = new toggleHeatMapButtons();
			// 添加到地图当中
			map.addControl(myCtrl);
		}
	}

	function createFullScreen(map, opts, element){
		if(opts.fullScreen){
			fullscreenControl.prototype = new BMap.Control();
			fullscreenControl.prototype.initialize = function(map){
				// 创建一个DOM元素
				var zoomBtn = document.createElement("div");
				zoomBtn.className = "btn waves-effect waves-light btn-secondary btn-sm";
				var zoomIcon = document.createElement("i");
				zoomIcon.className = "ti-fullscreen";
				// 添加文字说明
				zoomBtn.appendChild(zoomIcon);
				// 绑定事件,点击一次放大两级
				zoomBtn.onclick = function(/*e*/){
					//map.setZoom(map.getZoom() + 2);
					if($(element).hasClass('map-fullscreen')){
						$(element).removeClass('map-fullscreen');
						zoomIcon.className = "ti-fullscreen";
					}else{
						$(element).addClass('map-fullscreen');
						zoomIcon.className = "ti-back-left";
					}

				};
				// 添加DOM元素到地图中
				map.getContainer().appendChild(zoomBtn);
				// 将DOM元素返回
				return zoomBtn;
			};
			// 创建控件
			var myZoomCtrl = new fullscreenControl();
			// 添加到地图当中
			map.addControl(myZoomCtrl);
		}
	}

	function createMapInstance(opts, element, $translate){
		var map = new BMap.Map(element[0]);    // 创建Map实例
		/*	below line will force map to be centralize based on this address
		*	we will use boundary function to move map to center
		*/
		map.centerAndZoom(new BMap.Point(opts.center.longitude, opts.center.latitude), opts.zoom);  // 初始化地图,设置中心点坐标和地图级别
		//map.addControl(new BMap.MapTypeControl({mapTypes: [BMAP_NORMAL_MAP]}));   //添加地图类型控件
		map.addControl(new BMap.NavigationControl());   //add navigate control
		map.setCurrentCity(opts.city);          // 设置地图显示的城市 此项是必须设置的
		map.enableScrollWheelZoom(true);
		createFullScreen(map, opts, element);
		createHeatMapButtons(map, opts, element, $translate);
		return map;
	}

	function createMarker(marker, point){
		var newMarker = new BMap.Marker(point);
		if (marker.icon) {
			var icon = new BMap.Icon(marker.icon, new BMap.Size(marker.width, marker.height),{
				 anchor: new BMap.Size(15, marker.height),
			});
			newMarker = new BMap.Marker(point, { icon: icon });
		}
		return newMarker;
	}

	function removeCoverage(map, opts){
		angular.forEach(opts.coveragePipes, function(row){
			map.removeOverlay(row);
		});
		opts.coveragePipes.length = 0;
	}

	function drawCoveragePipe(map, opts, status, marker, results){
		var isAdd = status || true;
		var color = "red";
		var centerPoints = [];
		angular.forEach(results, function(row){
			var junctions = [];
			angular.forEach(row.junctions, function(element){
				var p = new BMap.Point(element.lng, element.lat);
				centerPoints.push({lng: element.lng, lat: element.lat});
				junctions.push(p);
			});
			var pline = new BMap.Polyline(junctions, {strokeColor:color, strokeWeight:7, strokeOpacity:0.7});
			opts.coveragePipes.push(pline);
			map.addOverlay(pline);
		});
		map.closeInfoWindow();
		/* move to center of highlight pipe
		*/
		var points = [];
		centerPoints.forEach(function (loc) {
			points.push(new BMap.Point(loc.lng, loc.lat));
		});
		map.setViewport(points, {zoomFactor: -0.5});
	}

	function createNetworkMenu(map, opts, $translate){
		var menu = opts.menus;
		var langMenu = {
			pipes: $translate.instant('site_network_toolbar_pipes'),
			sensors: $translate.instant('site_network_toolbar_sensors'),
			status: $translate.instant('site_network_toolbar_status'),
			coverage: $translate.instant('site_network_toolbar_coverage')
		};
		toggleNetworkMapButtons.prototype = new BMap.Control();
		toggleNetworkMapButtons.prototype.initialize = function(map){
			var div = document.createElement("div");
			div.className = "btn-group map-menu";
			div.setAttribute("role","group");

			angular.forEach(menu, function(value, key) {
				var divMenuGroup = document.createElement("button");

				if(key!=="coverage"){
					divMenuGroup = document.createElement("div");
					divMenuGroup.className = "btn-group";
					divMenuGroup.setAttribute("role","group");

					var menuButton = document.createElement("button");
					menuButton.className = "btn btn-secondary btn-outline btn-sm";
					menuButton.setAttribute("type","button");
					menuButton.setAttribute("data-toggle","dropdown");
					menuButton.innerHTML = langMenu[key];

					var divDropdown = document.createElement("div");
					divDropdown.className = "dropdown-menu";

					divMenuGroup.appendChild(menuButton);

					var divAll = document.createElement("a");
					divAll.setAttribute("class","dropdown-item active");
					divAll.setAttribute("href","#");
					divAll.setAttribute("data-value","all");
					divAll.setAttribute("data-type",key);
					divAll.innerHTML = $translate.instant('site_network_toolbar_menu_all')+" "+langMenu[key];

					divDropdown.appendChild(divAll);

					divAll.onclick = function(e){
						e.preventDefault();
						e.stopPropagation();
						var thisElem = $(e.target),
							type = thisElem.data('type'),
							value = "all",
							isActive = !thisElem.hasClass('active');
						thisElem.toggleClass('active');
						if(isActive){
							thisElem.siblings().addClass('active');
						}else{
							thisElem.siblings().removeClass('active');
						}
						toggleUpdateOverlay(type, map, isActive, value, opts);
					};

					angular.forEach(value.results, function(row){
						var divSub = document.createElement("a");
						divSub.setAttribute("class","dropdown-item active");
						divSub.setAttribute("href","#");
						divSub.setAttribute("data-value",row);
						divSub.setAttribute("data-type",key);
						divSub.innerHTML = row;

						divSub.onclick = function(e){
							e.preventDefault();
							e.stopPropagation();
							var thisElem = $(e.target);
							thisElem.toggleClass('active');
							var group = thisElem.parent('.dropdown-menu'),
								items = group.find('.dropdown-item'),
								itemNonSelect = items.filter(":not(.active):not([data-value='all'])"),
								itemAll = items.filter('[data-value="all"]'),
								value = thisElem.data('value'),
								type = thisElem.data('type'),
								isActive = thisElem.hasClass('active');

							if(itemNonSelect.length<=0){
								itemAll.addClass('active');
							}else if(itemNonSelect.length<=parseInt(items.length-1)){
								itemAll.removeClass('active');
							}
							toggleUpdateOverlay(type, map, isActive, value, opts);
						};
						divDropdown.appendChild(divSub);
					});
					divMenuGroup.appendChild(divDropdown);
					div.appendChild(divMenuGroup);
				}else{
					divMenuGroup.className = "btn btn-secondary btn-outline btn-sm";
					divMenuGroup.innerHTML = langMenu[key];

					divMenuGroup.onclick = function(){
						removeCoverage(map, opts);
					};
					div.appendChild(divMenuGroup);
				}

			});

			// 添加DOM元素到地图中
			map.getContainer().appendChild(div);
			// 将DOM元素返回
			return div;
		};
		// 创建控件
		var myCtrl = new toggleNetworkMapButtons();
		// 添加到地图当中
		map.addControl(myCtrl);
	}

	/* toggle update overlay
	*
	*/

	function toggleUpdateOverlay(type, map, status, value, opts){
		if(type==="sensors"){
			updateSensorOverlay(map, status, value, opts);
		}else if(type==="pipes"){
			updatePipeOverlay(map, status, value, opts);
		}else if(type==="status"){
			updateStatusOverlay(map, status, value, opts);
		}
	}

	/* update status overlap
	*
	*/
	function updateStatusOverlay(map, status, value, opts){
		var markerInstance = opts.markerInstance;
		if(!status && value==="all"){ //all & off
			angular.forEach(opts.markers, function(element, i){
				map.removeOverlay(markerInstance[i]);
			});
		}else if(status && value==="all"){ //all & on
			angular.forEach(opts.markers, function(element, i){
				map.addOverlay(markerInstance[i]);
			});
		}else if(value!=="all"){
			angular.forEach(opts.markers, function(element, i){
				if(element.status===value){
					if(status){
						map.addOverlay(markerInstance[i]);
					}else{
						map.removeOverlay(markerInstance[i]);
					}
				}
			});
		}
	}

	/* update sensor overlap
	*
	*/
	function updateSensorOverlay(map, status, value, opts){
		var markerInstance = opts.markerInstance;
		if(!status && value==="all"){ //all & off
			angular.forEach(opts.markers, function(element, i){
				map.removeOverlay(markerInstance[i]);
			});
		}else if(status && value==="all"){ //all & on
			angular.forEach(opts.markers, function(element, i){
				map.addOverlay(markerInstance[i]);
			});
		}else if(value!=="all"){
			angular.forEach(opts.markers, function(element, i){
				if(element.tag.subzone===value){
					if(status){
						map.addOverlay(markerInstance[i]);
					}else{
						map.removeOverlay(markerInstance[i]);
					}
				}
			});
		}
	}

	/* update sensor overlap
	*
	*/
	function updatePipeOverlay(map, status, value, opts){
		var pipeInstance = opts.pipeInstance;
		if(!status && value==="all"){ //all & off
			angular.forEach(opts.pipes, function(element, i){
				map.removeOverlay(pipeInstance[i]);
			});
		}else if(status && value==="all"){ //all & on
			angular.forEach(opts.pipes, function(element, i){
				map.addOverlay(pipeInstance[i]);
			});
		}else if(value!=="all"){
			angular.forEach(opts.pipes, function(element, i){
				if(element.subzone===value){
					if(status){
						map.addOverlay(pipeInstance[i]);
					}else{
						map.removeOverlay(pipeInstance[i]);
					}
				}
			});
		}
	}


	/* draw a pipe area line
	*
	*/
	function drawPipeArea(map, opts){
		opts.pipeInstance = [];
		opts.pipes.forEach(function (row) {
			var pipeArr = [];
			row.location.forEach(function (loc) {
				var pt = new BMap.Point(loc.longitude, loc.latitude);
				pipeArr.push(pt);

			});
			var pipeOverlay = new BMap.Polyline(pipeArr, {strokeColor: row.color, strokeWeight: row.weight, strokeOpacity:1});
			opts.pipeInstance.push(pipeOverlay);
			map.addOverlay(pipeOverlay);

			/* info window
			*/
			if (!row.title && !row.content) {
				return;
			}
			//info window msg
			var msg = '<p>' + (row.title || '') + '</p><p>' + (row.content || '') + '</p>';
			var infoWindowItem = new BMap.InfoWindow(msg, {
				enableMessage: true,
				width : 350
			});

			pipeOverlay.addEventListener('click', function(e){
				map.openInfoWindow(infoWindowItem, new BMap.Point(e.point.lng, e.point.lat));
			});
		});
	}

	/* draw a project area line
	*
	*/
	function boundaryArea(map, opts){
		var points = [];
		var num = Math.ceil(opts.boundary.length/2);
		opts.boundary.forEach(function (loc) {
			points.push(new BMap.Point(loc.longitude, loc.latitude));
		});
		var polygon = new BMap.Polygon(points, {strokeColor:"blue", strokeWeight:3, strokeOpacity:1, fillColor:""});
		if(opts.boundary.length){
			map.centerAndZoom(new BMap.Point(opts.boundary[num].longitude, opts.boundary[num].latitude), opts.zoom);
		}
		map.addOverlay(polygon);
		map.setViewport(points);
		moveMapToCenter(map, opts);
	}

	function drawHeatMap(map, opts){
		if(!isSupportCanvas() || typeof map==="undefined"){
			return false;
		}
		map.removeEventListener("tilesloaded", drawHeatMap); //remove listener
		var radius = 150;
		var max = 90;
		heatmapOverlay = new BMapLib.HeatmapOverlay({"radius":radius});
		map.addOverlay(heatmapOverlay);
		heatmapOverlay.setDataSet({
			data:opts.heatMap,
			max:max
		});
		heatmapOverlay.show();
	}

	function isSupportCanvas(){
		var elem = document.createElement('canvas');
		return !!(elem.getContext && elem.getContext('2d'));
	}

	function redrawMarkers(map, $translate, previousMarkers, opts, $scope, modalService, apiService){
		var points = [];
		previousMarkers.forEach(function (item) {
			var marker = item.marker;
			var listener = item.listener;

			marker.removeEventListener('click', listener);
			map.removeOverlay(marker);
		});
		previousMarkers.length = 0;
		if (!opts.markers) {
			return;
		}
		opts.markerInstance = [];
		opts.markers.forEach(function (marker) {
			var markerItem = createMarker(marker, new BMap.Point(marker.longitude, marker.latitude));

			var infoButton = "<div class='btn-group'>";
				infoButton += "<button type='button' class='btn btn-secondary' data-toggle='tooltip' data-trigger='hover' title='"+$translate.instant('site_location_button_viewinfo')+"' id='baidu_marker_info'><i class='ti-info-alt'></i></button>";
				infoButton += "<button type='button' class='btn btn-secondary' data-toggle='tooltip' data-trigger='hover' title='"+$translate.instant('site_location_button_viewdata')+"' id='baidu_marker_data'><i class='ti-stats-up'></i></button>";
				infoButton += "</div>";
			points.push(new BMap.Point(marker.longitude, marker.latitude));
			opts.markerInstance.push(markerItem);
			// add marker to the map
			map.addOverlay(markerItem);
			markerItem.setLabel("");
			// append marker
			var previousMarker = { marker: markerItem, listener: null };
			previousMarkers.push(previousMarker);
			if (!marker.title && !marker.content) {
				return;
			}
			//info window msg
			var msg = '<p>' + (marker.title || '') + '</p><p>' + (marker.content || '') + '</p>';
			if(opts.mapType==="map"){
				msg += infoButton;
			}else if(opts.mapType==="networkAnalysisMap"){
				var coverageButton = "<button type='button' class='btn btn-secondary' data-toggle='tooltip' data-trigger='hover' title='"+$translate.instant('site_network_map_button_coverage')+"' id='network_coverage_info'><i class='ti-target'></i></button>";
				msg += coverageButton;
			}

			var infoWindowItem = new BMap.InfoWindow(msg, {
				enableMessage: !!marker.enableMessage
			});
			//marker binding
			previousMarker.listener = function () {
				this.openInfoWindow(infoWindowItem);
				var elData = document.getElementById("baidu_marker_data");
				var elInfo = document.getElementById("baidu_marker_info");
				var elCoverage = document.getElementById("network_coverage_info");
				if(angular.isDefined(modalService) && modalService!==null){
					elData.addEventListener("click", function(){
						modalService.open(opts.modalUrl, opts.modalCtrl, marker);
					});
					elInfo.addEventListener("click", function(){
						modalService.open(opts.modalUrlInfo, opts.modalCtrlInfo, marker);
					});
				}
				if (typeof(elCoverage) !== 'undefined' && elCoverage !== null){
					elCoverage.addEventListener("click", function(){
						apiService.networkAnalysisCoverageApi(marker._id).then(function(response){
							drawCoveragePipe(map, opts, true, marker, response.data);
						});
					});
				}
			};
			markerItem.addEventListener('click', previousMarker.listener);
			xpro.tooltips();
		});
		if(opts.mapType==="heatmap"){
			map.setViewport(points);
		}
	}
})();