/* global angular, CanvasJS, console */
(function() {
	'use strict';
	var main = angular.module('xProject.main',[]);
	main.$inject = ['$scope', 'authService', '$location', '$http'];
	main.controller('mainController', function mainController ($scope, authService, $location, apiService) {
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
			coveragePercentage: [],
			coverageMeter: []
		};

		getProjectDetails();
		getPipeSummary();
		getCoverage();

		vm.barDiameterChart = new CanvasJS.Chart("chartDiameterContainer", {
			theme: 'theme1',
			animationEnabled: true,
			zoomEnabled: true,
			data: [
				{
					type: "column",
					visible: true,
					dataPoints: vm.project.diametermap
				}
			]
		});
		vm.piePercentSensorChart = new CanvasJS.Chart("chartPercentSensorContainer", {
			theme: 'theme1',
			animationEnabled: true,
			zoomEnabled: true,
			dataPointWidth: 10,
			data: [
				{
					type: "doughnut",
					showInLegend: true,
					startAngle: 60,
					yValueFormatString: "##0.00\" Meter\"",
					indexLabel: "{name} {y}",
					indexLabelFontFamily: "arial",
					dataPoints: vm.project.coveragePercentage
				}
			]
		});
		vm.pieMeterSensorChart = new CanvasJS.Chart("chartMeterSensorContainer", {
			theme: 'theme1',
			animationEnabled: true,
			zoomEnabled: true,
			dataPointWidth: 10,
			indexLabelFontFamily: "arial",
			data: [
				{
					type: "doughnut",
					showInLegend: true,
					startAngle: 60,
					yValueFormatString: "##0.00\" %\"",
					indexLabel: "{name} {y}",
					indexLabelFontFamily: "arial",
					dataPoints: vm.project.coverageMeter
				}
			]
		});


		function getCoverage(){
			apiService.dashboardCoverageApi().then(function(response){
				if(angular.isDefined(response.data)){
					var res = response.data.content.test;
					vm.project.coveragePercentage.push({
						y: parseFloat(res.coverage),
						name: "Coverage",
						color: "#3b5998"
					});
					vm.project.coveragePercentage.push({
						y: parseFloat(res.localization),
						name: "Localization",
						color: "#e84c9d"
					});
					vm.project.coverageMeter.push({
						y: parseFloat(res.covered_length),
						name: "Covered Length",
						color: "#f86c6b"
					});
					vm.project.coverageMeter.push({
						y: parseFloat(res.localizedLength),
						name: "Localized Length",
						color: "#11bec4"
					});
					vm.piePercentSensorChart.render();
					vm.pieMeterSensorChart.render();
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
					vm.project.subzones = (res.subzones).join(", ");
					vm.project.layers = res.layers;
					angular.forEach(res.diametermap, function(y, x){
						vm.project.diametermap.push({x: parseFloat(x), y: parseFloat(y)});
					});
					vm.barDiameterChart.render();
				}
			});
		}
	});
})();