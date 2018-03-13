/* global angular, CanvasJS */
(function() {
	'use strict';
	var main = angular.module('xProject.main',[]);
	main.$inject = ['$scope', 'authService', '$location', '$http'];
	main.controller('mainController', function mainController ($scope, authService, $location, apiService, $translate) {
		var vm = this;
		vm.project = {
			status: "",
			type: "",
			start_time: "",
			end_time: "",
			address: "",
			name: "",
			timezone: "",
			client_name: "",
			sensors: {
				"flow meter": 0,
				"water quality": 0,
				"pressure": 0
			},
			total_pipe_length: 0,
			max_pipe_diameter: 0,
			min_pipe_diameter: 0,
			subzones: [],
			layers: [],
			diametermap: [],
			coverageChart: [],
			localizedChart: []
		};

		getProjectDetails();
		getPipeSummary();
		getCoverage();

		vm.barDiameterChart = new CanvasJS.Chart("chartDiameterContainer", {
			theme: 'theme1',
			animationEnabled: true,
			zoomEnabled: true,
			dataPointWidth: 30,
			data: [
				{
					type: "column",
					visible: true,
					dataPoints: vm.project.diametermap
				}
			]
		});
		vm.pieCoverageChart = new CanvasJS.Chart("chartCoverageContainer", {
			theme: 'theme1',
			animationEnabled: true,
			zoomEnabled: true,
			dataPointWidth: 10,
			legend:{
				fontFamily: "Poppins,sans-serif",
			},
			data: [
				{
					type: "doughnut",
					showInLegend: true,
					startAngle: 60,
					yValueFormatString: "##0.##\" %\"",
					indexLabel: "{name} {y}",
					indexLabelFontFamily: "Poppins,sans-serif",
					dataPoints: vm.project.coverageChart
				}
			]
		});
		vm.pieLocalizedChart = new CanvasJS.Chart("chartLocalizedContainer", {
			theme: 'theme1',
			animationEnabled: true,
			zoomEnabled: true,
			dataPointWidth: 10,
			legend:{
				fontFamily: "Poppins,sans-serif",
			},
			data: [
				{
					type: "doughnut",
					showInLegend: true,
					startAngle: 60,
					yValueFormatString: "##0.##\" %\"",
					indexLabel: "{name} {y}",
					indexLabelFontFamily: "Poppins,sans-serif",
					dataPoints: vm.project.localizedChart
				}
			]
		});


		function getCoverage(){
			apiService.dashboardCoverageApi().then(function(response){
				if(angular.isDefined(response.data)){
					var res = response.data.content.test;
					vm.project.coverageChart.push({
						y: parseFloat(res.coverage),
						name: $translate.instant("site_dashboard_coverage"),
						color: "#3b5998"
					});
					vm.project.coverageChart.push({
						y: 1-parseFloat(res.coverage),
						name: $translate.instant("site_dashboard_not_covered"),
						color: "#e84c9d"
					});
					vm.project.localizedChart.push({
						y: parseFloat(res.localization),
						name: $translate.instant("site_dashboard_localization"),
						color: "#f86c6b"
					});
					vm.project.localizedChart.push({
						y: 1-parseFloat(res.localization),
						name: $translate.instant("site_dashboard_not_localized"),
						color: "#11bec4"
					});
					vm.pieCoverageChart.render();
					vm.pieLocalizedChart.render();
				}
			});
		}

		function getProjectDetails(){
			apiService.projectApi().then(function(response){
				if(angular.isDefined(response.data)){
					var res = response.data;
					vm.project.status = res.status;
					vm.project.type = res.type;
					vm.project.start_time = res.start_time;
					vm.project.end_time = res.end_time;
					vm.project.address = res.address;
					vm.project.name = res.name;
					vm.project.timezone = res.timezone;
					vm.project.client_name = res.client_name;
					vm.project.sensors['flow meter'] = res.sensors['flow meter'];
					vm.project.sensors['water quality'] = res.sensors['water quality'];
					vm.project.sensors.pressure = res.sensors.pressure;
				}
			});
		}

		function getPipeSummary(){
			apiService.networkPipeSummaryApi().then(function(response){
				if(angular.isDefined(response.data)){
					var res = response.data;
					vm.project.total_pipe_length = res.total_pipe_length;
					vm.project.max_pipe_diameter = res.max_pipe_diameter;
					vm.project.min_pipe_diameter = res.min_pipe_diameter;
					vm.project.subzones = res.subzones;
					vm.project.layers = res.layers;
					angular.forEach(res.diametermap, function(y, x){
						vm.project.diametermap.push({label: x, y: parseFloat(y)});
					});
					vm.barDiameterChart.render();
				}
			});
		}
	});
})();