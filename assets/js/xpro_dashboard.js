/*
*	Author: Wesley Wong
*/
/* global xpro */
"use strict";
xpro.dashboard = (function () {
	var my = {};
	my.bindUIAction = function(){

	};
	my.chartist = function(){
		var chart = new Chartist.Line('.campaign', {
				labels: [1, 2, 3, 4, 5, 6, 7, 8],
				series: [
					[0, 5000, 15000, 8000, 15000, 9000, 30000, 0]
					, [0, 3000, 5000, 2000, 8000, 1000, 5000, 0]
				]
			}, {
				low: 0,
				high: 28000,
				showArea: true,
				fullWidth: true,
				plugins: [
					Chartist.plugins.tooltip()
				],
				axisY: {
					onlyInteger: true
					, scaleMinSpace: 40
					, offset: 20
					, labelInterpolationFnc: function (value) {
						return (value / 1000) + 'k';
					}
				},
			});
	};
	my.sparkline = function(){
		$('#spark8').sparkline([ 4, 5, 0, 10, 9, 12, 4, 9], {
			type: 'bar',
			width: '100%',
			height: '40',
			barWidth: '4',
			resize: true,
			barSpacing: '5',
			barColor: '#26c6da'
		});
		$('#spark9').sparkline([ 0, 5, 6, 10, 9, 12, 4, 9], {
			type: 'bar',
			width: '100%',
			height: '40',
			barWidth: '4',
			resize: true,
			barSpacing: '5',
			barColor: '#ef5350'
		});
		$('#spark10').sparkline([ 0, 5, 6, 10, 9, 12, 4, 9], {
			type: 'bar',
			width: '100%',
			height: '40',
			barWidth: '4',
			resize: true,
			barSpacing: '5',
			barColor: '#7460ee'
		});
	};
	my.init = function(){
		this.sparkline();
		this.chartist();
	};
	return my;
}());