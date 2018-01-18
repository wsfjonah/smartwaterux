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

	/* network map - gis, network
	* updated - 4/1/2018
	*/
	xproNetworkMap.$inject = ['$translate','mapApi','apiService','dialogService'];
	function xproNetworkMap($translate, mapApi, apiService, dialogService){
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
					redrawMarkers(map, $translate, previousMarkers, opts, scope, null, apiService, dialogService);

					//watch markers
					scope.$watch('options.markers', function (/*newValue, oldValue*/) {
						redrawMarkers(map, $translate, previousMarkers, opts, scope, null, apiService, dialogService);
					}, true);
					//watch menus
					scope.$watch('options.menus', function (/*newValue, oldValue*/) {
						createNetworkMenu(map, opts, $translate, apiService, dialogService);
					}, true);
					//watch pipe
					if(angular.isDefined(opts.pipes)){
						scope.$watch('options.pipes', function (/*newValue, oldValue*/) {
							drawPipeArea(map, opts, scope);
						}, true);
					}
					//watch pump
					if(angular.isDefined(opts.pumps)){
						scope.$watch('options.pumps', function (/*newValue, oldValue*/) {
							drawPumps(map, opts, scope);
						}, true);
					}
					//watch plotMarkers - network data
					if(angular.isDefined(opts.plotMarkers)){
						scope.$watch('options.plotMarkers', function (/*newValue, oldValue*/) {
							createPlotMarkerCart(map, opts, scope, $translate);
						}, true);
					}
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
			script.src = 'http://api.map.baidu.com/api?v=2.0&ak=CSFSaXio89D3WK1AB38sLNtnkV9fWZO4&callback=initMap';
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
		/*jshint validthis:true */
		this.defaultAnchor = BMAP_ANCHOR_TOP_RIGHT;
		this.defaultOffset = new BMap.Size(10, 10);
	}

	function toggleHeatMapButtons(){
		/*jshint validthis:true */
		this.defaultAnchor = BMAP_ANCHOR_TOP_RIGHT;
		this.defaultOffset = new BMap.Size(50, 10);
	}

	function toggleNetworkMapButtons(){
		/*jshint validthis:true */
		this.defaultAnchor = BMAP_ANCHOR_TOP_RIGHT;
		this.defaultOffset = new BMap.Size(10, 10);
	}

	/* create selected plot marker in the cart list
	*/
	function createPlotMarkerCart(map, opts, scope, $translate){
		var container = $('#cart_options_list');
		var lenMarker = opts.plotMarkers.length;
		var html = "";
		if(lenMarker){
			html += "<ul class='list-group'>";
			for(var i=0, len=lenMarker; i<len; i++){
				html += "<li class='list-group-item'>"+opts.plotMarkers[i].name+"<a class='remove-cart' data-toggle='remove_cart' data-id='"+opts.plotMarkers[i].datapoint.pressure._id+"' href='JavaScript:void(0);'><i class='ti-close'></i></a></li>";
			}
			html += "</ul>";
			html += "<div class='footer-action'>";
				html += "<div class='btn-group'>";
					html += "<button type='button' class='btn btn-secondary' data-toggle='empty_cart'><i class='ti-trash'></i></button>";
					html += "<button type='button' class='btn btn-primary'><i class='ti-stats-up'></i></button>";
				html += "</div>";
			html += "</div>";
		}else{
			html += "<h3 class='text-center m-t-20 text-muted'>"+$translate.instant('site_network_data_plot_no_sensor_found')+"</h3>";
		}
		container.html(html);
		var count = document.getElementById('count_badge');
		count.innerHTML = lenMarker;
		container.off().on('click','[data-toggle="remove_cart"]', function(){
			removePlotMarker(map, opts, scope, $(this).data('id'));
		}).on('click','[data-toggle="empty_cart"]', function(){
			removePlotMarker(map, opts, scope);
		});
	}
	/* remove plot marker cart
	*/
	function removePlotMarker(map, opts, $scope, id){
		var isDelete = false;
		console.log('#removed');
		console.log(opts.plotMarkers);
		if(angular.isDefined(id)){
			angular.forEach(opts.plotMarkers, function(value, index){
				if(value.datapoint.pressure._id===id){
					opts.plotMarkerInstance[index].setAnimation(null);
					$scope.$apply(function() {
						opts.plotMarkerInstance.splice(index, 1);
						$scope.options.plotMarkers.splice(index, 1);
					});
				}
			});
		}else{
			angular.forEach(opts.plotMarkerInstance, function(value, index){
				value.setAnimation(null);
			});
			$scope.$apply(function() {
				opts.plotMarkerInstance.length = 0;
				$scope.options.plotMarkers.length = 0;
			});
		}
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
		map.disableScrollWheelZoom(true);
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
		//var isAdd = status || true;
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

	function createNetworkMenu(map, opts, $translate, apiService, dialogService){
		var menu = opts.menus;
		var langMenu = {
			pipes: $translate.instant('site_network_toolbar_pipes'),
			sensors: $translate.instant('site_network_toolbar_sensors'),
			status: $translate.instant('site_network_toolbar_status'),
			pumps: $translate.instant('site_network_toolbar_pumps'),
			hydrant: $translate.instant('site_network_toolbar_hydrant'),
			coverage: $translate.instant('site_network_toolbar_coverage'),
			cart: $translate.instant('site_network_data_plot_plotlist')
		};
		toggleNetworkMapButtons.prototype = new BMap.Control();
		toggleNetworkMapButtons.prototype.initialize = function(map){
			var div = document.createElement("div");
			div.className = "btn-group map-menu";
			div.setAttribute("role","group");

			angular.forEach(menu, function(value, key) {
				var divMenuGroup = document.createElement("button");
				var menuButton = document.createElement("button");
				var divDropdown = document.createElement("div");
				if(key!=="coverage" && key!=="hydrant" && key!=="cart"){
					divMenuGroup = document.createElement("div");
					divMenuGroup.className = "btn-group";
					divMenuGroup.setAttribute("role","group");

					menuButton = document.createElement("button");
					menuButton.className = "btn btn-secondary btn-outline btn-sm";
					menuButton.setAttribute("type","button");
					menuButton.setAttribute("data-toggle","dropdown");
					menuButton.innerHTML = langMenu[key];

					divDropdown = document.createElement("div");
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
						var valName = row;
						var divSub = document.createElement("a");
						divSub.setAttribute("class","dropdown-item active");
						divSub.setAttribute("href","#");
						divSub.setAttribute("data-value",valName);
						divSub.setAttribute("data-type",key);
						divSub.innerHTML = valName;

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
				}else if(key==="coverage"){
					divMenuGroup.className = "btn btn-secondary btn-outline btn-sm";
					divMenuGroup.innerHTML = langMenu[key];

					divMenuGroup.onclick = function(){
						removeCoverage(map, opts);
					};
					div.appendChild(divMenuGroup);
				}else if(key==="hydrant"){
					divMenuGroup = document.createElement("div");
					divMenuGroup.className = "btn-group";
					divMenuGroup.setAttribute("role","group");

					menuButton = document.createElement("button");
					menuButton.className = "btn btn-secondary btn-outline btn-sm";
					menuButton.setAttribute("type","button");
					menuButton.setAttribute("data-toggle","dropdown");
					menuButton.innerHTML = langMenu[key];

					divDropdown = document.createElement("div");
					divDropdown.className = "dropdown-menu";

					divMenuGroup.appendChild(menuButton);

					var divSearch = document.createElement("a");
					divSearch.setAttribute("class","dropdown-item");
					divSearch.setAttribute("href","#");
					divSearch.setAttribute("data-value","all");
					divSearch.setAttribute("data-type",key);
					divSearch.innerHTML = $translate.instant('site_network_toolbar_menu_search');
					divDropdown.appendChild(divSearch);

					divSearch.onclick = function(e){
						e.preventDefault();
						getHydrantData(map, opts, apiService, dialogService, $translate);
					};

					var divClear = document.createElement("a");
					divClear.setAttribute("class","dropdown-item");
					divClear.setAttribute("href","#");
					divClear.setAttribute("data-value","clear");
					divClear.setAttribute("data-type",key);
					divClear.innerHTML = $translate.instant('site_network_toolbar_menu_remove');
					divDropdown.appendChild(divClear);

					divClear.onclick = function(e){
						e.preventDefault();
						clearHydrant(map, opts);
					};
					divMenuGroup.appendChild(divDropdown);
					div.appendChild(divMenuGroup);
				}else if(key==="cart"){
					divMenuGroup = document.createElement("div");
					divMenuGroup.className = "btn-group cart-group";

					menuButton = document.createElement("button");
					menuButton.className = "btn btn-secondary btn-outline btn-sm";
					menuButton.setAttribute("type","button");
					menuButton.innerHTML = langMenu[key];

					var badgeDiv = document.createElement("span");
					badgeDiv.className = "badge badge-primary m-l-5";
					badgeDiv.setAttribute("id","count_badge");
					badgeDiv.innerHTML = "0";

					menuButton.appendChild(badgeDiv);
					divMenuGroup.appendChild(menuButton);

					menuButton.onclick = function(e){
						$(e.target).toggleClass('active').parent().toggleClass('active');
					};
					var cartDiv = document.createElement("div");
					cartDiv.className = "cart-list card scale-up";

					var cartHeader = document.createElement("div");
					cartHeader.className = "card-header";

					var cartHeaderTitle = document.createElement("h4");
					cartHeaderTitle.className = "m-b-0";
					cartHeaderTitle.innerHTML = $translate.instant('site_network_data_plot_plotlist');

					var cartBody = document.createElement("div");
					cartBody.className = "card-body";
					cartBody.setAttribute("id","cart_options_list");

					cartHeader.appendChild(cartHeaderTitle);
					cartDiv.appendChild(cartHeader);
					cartDiv.appendChild(cartBody);
					divMenuGroup.appendChild(cartDiv);
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

	/* get hydrant marker
	*
	*/
	function getHydrantData(map, opts, apiService, dialogService, $translate){
		var mapcenter = map.getCenter();
		var mapZoom = map.getZoom();
		var minZoom = 13;
		if(mapZoom<minZoom){
			map.setZoom(minZoom);
			mapcenter = map.getCenter();
		}
		apiService.networkHydrantApi(mapcenter.lat+","+mapcenter.lng).then(function(response){
			opts.hydrant.length = 0;
			if(response.data.length){
				angular.forEach(response.data, function(row){
					var p = row.location[0];
					var location = {
						longitude: p.longitude,
						latitude: p.latitude
					};
					opts.hydrant.push(location);
				});
			}else{
				dialogService.alert(null,{title: $translate.instant('site_network_toolbar_hydrant'), content: $translate.instant('site_network_hydrant_no_found'), ok: $translate.instant('site_login_error_noted')});
			}
			drawHydrant(map, opts);
		});
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
		}else if(type==="pumps"){
			updatePumpOverlay(map, status, value, opts);
		}
	}

	/* update pump marker overlap
	*
	*/
	function updatePumpOverlay(map, status, value, opts){
		var pumpInstance = opts.pumpInstance;
		if(!status && value==="all"){ //all & off
			angular.forEach(opts.pumps, function(element, i){
				map.removeOverlay(pumpInstance[i]);
			});
		}else if(status && value==="all"){ //all & on
			angular.forEach(opts.pumps, function(element, i){
				map.addOverlay(pumpInstance[i]);
			});
		}else if(value!=="all"){
			angular.forEach(opts.pumps, function(element, i){
				if(element.name===value.toString()){
					if(status){
						map.addOverlay(pumpInstance[i]);
					}else{
						map.removeOverlay(pumpInstance[i]);
					}
				}
			});
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

	/* clear hydrant
	*
	*/
	function clearHydrant(map, opts){
		if(opts.hydrantInstance.length){
			angular.forEach(opts.hydrantInstance, function(element/*, i*/){
				map.removeOverlay(element);
			});
		}
		opts.hydrantInstance.length = 0;
	}

	/* draw hydrant
	*
	*/
	function drawHydrant(map, opts){
		var centerPoints = [];
		var existHydrant = (opts.hasOwnProperty('hydrantInstance') && opts.hydrantInstance.length);
		if(existHydrant){
			clearHydrant(map, opts);
		}
		opts.hydrantInstance = [];
		opts.hydrant.forEach(function (row) {
			var marker = {
				icon: 'assets/images/map/marker_hydrant.png',
				width: 15,
				height: 15,
				title: '',
				content: ''
			};
			var markerItem = createMarker(marker, new BMap.Point(row.longitude, row.latitude));
			//markerItem.setTop(true);
			centerPoints.push({lng: row.longitude, lat: row.latitude});
			opts.hydrantInstance.push(markerItem);
			// add marker to the map
			map.addOverlay(markerItem);
			markerItem.setLabel("");
		});
		/* move to center of highlight pipe
		*/
		var points = [];
		centerPoints.forEach(function (loc) {
			points.push(new BMap.Point(loc.lng, loc.lat));
		});
		map.setViewport(points);
	}

	/* draw pumps
	*
	*/
	function drawPumps(map, opts){
		opts.pumpInstance = [];
		opts.pumps.forEach(function (row) {
			var marker = {
				icon: 'assets/images/map/marker_pump.png',
				width: 38,
				height: 46,
				title: '',
				content: ''
			};
			var markerItem = createMarker(marker, new BMap.Point(row.longitude, row.latitude));
			markerItem.setTop(true);
			opts.pumpInstance.push(markerItem);
			// add marker to the map
			map.addOverlay(markerItem);
			markerItem.setLabel("");
		});
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
	function validateUniquMarker(oldArr, newArr){
		var isUnique = true;
		if(oldArr.length){
			angular.forEach(oldArr, function(value){
				if(angular.isDefined(value.datapoint.pressure) && value.datapoint.pressure._id===newArr.datapoint.pressure._id){
					isUnique = false;
				}
			});
		}
		return isUnique;
	}
	function redrawMarkers(map, $translate, previousMarkers, opts, $scope, modalService, apiService, dialogService){
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
			}else if(opts.mapType==="networkmapData"){
				var cartButton = "<button type='button' class='btn btn-secondary' data-toggle='tooltip' data-trigger='hover' title='Add to Plot' id='network_data_addtocart'><i class='ti-plus'></i> "+$translate.instant('site_network_data_plot_addtoplot')+"</button>";
				msg = '<p>' + (marker.title || '') + '</p>'+cartButton+'<p>' + (marker.content || '') + '</p>';
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
				var elCart = document.getElementById("network_data_addtocart");
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
				if (typeof(elCart) !== 'undefined' && elCart !== null){
					elCart.addEventListener("click", function(){
						var isUnique = validateUniquMarker(opts.plotMarkers, marker);
						var totalSelected = opts.plotMarkers.length;
						var max = 10;
						if(angular.isDefined(marker.datapoint.pressure)){
							if(!opts.hasOwnProperty('plotMarkerInstance')){
								opts.plotMarkerInstance = [];
							}
							if(totalSelected<max){
								if(isUnique){
									opts.plotMarkerInstance.push(markerItem);
									markerItem.setAnimation(BMAP_ANIMATION_BOUNCE);
									$scope.$apply(function() {
										$scope.options.plotMarkers.push(marker);
									});
									map.closeInfoWindow();
								}else{
									dialogService.alert(null,{
										title: $translate.instant('site_network_data_plot_title'), 
										content: $translate.instant('site_network_data_plot_sensor_exists'), 
										ok: $translate.instant('site_login_error_noted')
									});
								}
							}else{
								dialogService.alert(null,{
									title: $translate.instant('site_network_data_plot_title'),
									content: $translate.instant('site_network_data_plot_warning_limit'), 
									ok: $translate.instant('site_login_error_noted')
								});
							}
						}else{
							dialogService.alert(null,{
								title: $translate.instant('site_network_data_plot_title'),
								content: $translate.instant('site_network_data_plot_sensor_error'), 
								ok: $translate.instant('site_login_error_noted')
							});
						}
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