(function (window) {
	'use strict';
	window.__env = window.__env || {};

	window.__env.isLocal = true;

	window.__env.CacheStorageName = "authorizationData_demo";

	//Assets version
	window.__env.assetVersion = "1.0";
	//API Base url
	window.__env.baseUrl = "/api/"; //main api path - client development path - /api/ | wes dev - https://101.132.100.22/api/

	//project folder name
	window.__env.folder = "/demo"; //client development env - /smartwater | wes dev - ""

	//local json data
	window.__env.json = window.__env.folder+"/json/";
	window.__env.q = (window.__env.isLocal) ? "?" : "";

	// API url
	window.__env.userLoginUrl = window.__env.baseUrl+'user/login';
	window.__env.switchProjectUrl = window.__env.baseUrl+'user/switchproject';
	window.__env.timeSeriesAnyUrl = window.__env.baseUrl+'tsda/query';
	window.__env.timeSeriesRangeUrl = window.__env.baseUrl+'tsda/query';
	window.__env.eventAnyUrl = window.__env.baseUrl+'tsevent/search/-1/100000000';
	window.__env.eventDurationUrl = window.__env.baseUrl+'tsevent/search';
	window.__env.monitorEventUrl = window.__env.baseUrl+'tsevent/search';
	window.__env.eventRangeUrl = window.__env.baseUrl+'tsevent/query';
	window.__env.eventDetailsUrl = window.__env.baseUrl+'tsevent/get';
	window.__env.eventSingleRangeUrl = window.__env.baseUrl+'tsevent/datapoint';
	//batch query time series
	window.__env.batchTimeSeriesUrl = window.__env.baseUrl+'tsda/batchquery';
	window.__env.monitorEventNextUrl = window.__env.baseUrl+'tsda/batchquery';
	window.__env.monitorEventAddPlotUrl = window.__env.baseUrl+'tsda/batchquery';
	window.__env.monitorEventDetailsUrl = window.__env.baseUrl+'tsevent/get';
	//event used - e.g. tag
	window.__env.eventSetUrl = window.__env.baseUrl+'tsevent/set';

	//project
	window.__env.projectUrl = window.__env.baseUrl+'project/detail';

	//dashboard coverage
	window.__env.dashboardCoverageUrl = window.__env.baseUrl+'dashboard/coverage';

	//customer
	window.__env.customerUrl = window.__env.baseUrl+'map/customer';

	//network sensor
	window.__env.siteSearchUrl = window.__env.baseUrl+'site/search';
	window.__env.networkSensorUrl = window.__env.baseUrl+'site/search';
	window.__env.boundaryUrl = window.__env.baseUrl+'map/boundary';
	window.__env.heatmapUrl = window.__env.baseUrl+'map/heatmap';
	window.__env.sensorJunctionUrl = window.__env.baseUrl+'map/sensorjunction?query=';
	window.__env.mapPipeUrl = window.__env.baseUrl+'map/pipe?query=';

	//network pipe
	window.__env.networkPipeUrl = window.__env.baseUrl+'map/pipe';
	//network pipe summary - used for menu
	window.__env.networkPipeSummaryUrl = window.__env.baseUrl+'map/pipesummary';
	//network analysis pipe
	window.__env.networkAnalysisPipeUrl = window.__env.baseUrl+'map/geo/pipe';
	//network analysis coverage
	window.__env.networkAnalysisSensorCoverageUrl = window.__env.baseUrl+'map/sensorcoverage';
	//network pump
	window.__env.networkPumpUrl = window.__env.baseUrl+'map/pump';
	//network hydrant
	window.__env.networkHydrantUrl = window.__env.baseUrl+'map/hydrant';
	//network pipe end details
	window.__env.networkPipeDetailsUrl = window.__env.baseUrl+'map/geo/pipe/detail';

	//site event - daily | weekly
	window.__env.siteEventSummaryUrl = window.__env.baseUrl+'tsevent/pressuresummary';
	//site reading - daily | weekly
	window.__env.siteReadingSummaryUrl = window.__env.baseUrl+'tsda/pressuresummary';

	//network dashboard
	window.__env.dashboardNetworkSummaryUrl = window.__env.baseUrl+'dashboard/networksummary';

	//dma
	window.__env.dmaUrl = window.__env.baseUrl+'map/dma';

	//monitor neighbor
	window.__env.monitorSiteNeighborUrl = window.__env.baseUrl+'site/get/';

	//event tagging
	window.__env.eventTagsUrl = window.__env.baseUrl+'tsevent/alltags';

	window.__env.downloadCsvUrl = "https://smartwater.banxiniot.com/api/tsda/query/5a6eb4e70b272a1f64fa26ba-pressure/1n/1523327700000/1523332740000/csv/GMT+8?token=617a1a81-0655-444e-a8cb-ea9daf0e406d";

	/* collecting local json data
	*/
	if (window.__env.isLocal) {
		/* 	login page
		*	- modules/auth/authCtrl.js
		*/
		window.__env.userLoginUrl = window.__env.json+'login.json?'; //done
		/* 	switch project api
		*	- app/js/app.js
		*/
		window.__env.switchProjectUrl = window.__env.json+'switchproject.json?'; //done
		/* 	time series
		*	- modules/remote/modalTimeSeriesCtrl.js
		*	- modules/monitor/modalMonitorEventDetailsCtrl.js
		*	- modules/remote/modalHighRateCtrl.js
		*/
		window.__env.timeSeriesAnyUrl = window.__env.json+'tsda_query.json?'; //done
		/* 	time series range
		*	- modules/remote/modalTimeSeriesCtrl.js
		*/
		window.__env.timeSeriesRangeUrl = window.__env.json+'tsda_range_query.json?'; //done
		/* 	time series duration
		*	- modules/remote/modalHighRateCtrl.js
		*	- modules/monitor/monitorCtrl.js
		*/
		window.__env.eventDurationUrl = window.__env.json+'tsevent_search.json?'; //done
		/* 	event details
		*	- modules/monitor/modalMonitorEventDetailsCtrl.js
		*	- modules/remote/modalEventDetailsCtrl.js
		*/
		window.__env.eventDetailsUrl = window.__env.json+'tsevent_get.json?'; //done
		/* 	single event details - datapoint+from+to
		*	- modules/remote/modalTimeSeriesCtrl.js
		*/
		window.__env.eventSingleRangeUrl = window.__env.json+'tsevent_datapoint.json?'; //done
		/* 	batch time series - next 5 mins, monitor event details modal
		*	- modules/monitor/modalMonitorEventDetailsCtrl.js
		*	- modules/remote/modalEventDetailsCtrl.js
		*	- modules/remote/modalTimeSeriesCtrl.js
		*/
		window.__env.batchTimeSeriesUrl = window.__env.json+'tsda_batch_highrate_next.json?'; //have to solve next / prev minutes data
		/* 	set tagging
		*	- modules/monitor/modalMonitorEventDetailsCtrl.js
		*	- modules/remote/modalEventDetailsCtrl.js
		*/
		window.__env.eventSetUrl = window.__env.json+'tsevent_set.json?'; //done
		/* 	dashboard project details
		*	- modules/main/mainCtrl.js
		*/
		window.__env.projectUrl = window.__env.json+'project_details.json?'; //done
		/* 	dashboard coverage data
		*	- modules/main/mainCtrl.js
		*/
		window.__env.dashboardCoverageUrl = window.__env.json+'dashboard_coverage.json?'; //done
		/* 	map customer location data
		*	- modules/network/gisCtrl.js
		*	- modules/network/networkAnalysisCtrl.js
		*/
		window.__env.customerUrl = window.__env.json+'map_customer.json?'; //done
		/* 	site neighbors data
		*	- modules/remote/locationCtrl.js
		*	- modules/remote/siteTableCtrl.js
		*	- modules/network/gisCtrl.js
		*	- modules/network/networkAnalysisCtrl.js
		*	- modules/network/networkDataCtrl.js
		*/
		window.__env.siteSearchUrl = window.__env.json+'site_search.json?'; //done
		/* 	map boundary
		*	- modules/remote/locationCtrl.js
		*/
		window.__env.boundaryUrl = window.__env.json+'map_boundary.json?'; //done
		/* 	map pipe
		*	- modules/network/gisCtrl.js
		*	- modules/network/networkAnalysisCtrl.js
		*	- modules/network/networkDataCtrl.js
		*/
		window.__env.mapPipeUrl = window.__env.json+'map_pipe.json?'; //done
		//window.__env.networkPipeUrl = window.__env.json+'map_pipe.json?';
		/* 	pipe summary
		*	- modules/main/mainCtrl.js
		*	- modules/network/gisCtrl.js
		*	- modules/network/networkAnalysisCtrl.js
		*/
		window.__env.networkPipeSummaryUrl = window.__env.json+'pipe_summary.json?'; //done
		/* 	map geo pipe
		*	- modules/network/networkAnalysisCtrl.js
		*	- modules/network/networkDataCtrl.js
		*/
		window.__env.networkAnalysisPipeUrl = window.__env.json+'map_geo_pipe.json?'; //done
		/* 	directive - network coverage api
		*	- app/js/directives.js
		*/
		window.__env.networkAnalysisSensorCoverageUrl = window.__env.json+'map_sensor_coverage.json?'; //done
		/* 	map pump
		*	- modules/network/gisCtrl.js
		*	- modules/network/networkAnalysisCtrl.js
		*/
		window.__env.networkPumpUrl = window.__env.json+'map_pump.json?'; //done
		/* 	directive - map hydrant
		*	- app/js/directives.js
		*/
		window.__env.networkHydrantUrl = window.__env.json+'map_hydrant.json?'; //done
		/* 	directive - network pipe details
		*	- app/js/directives.js
		*/
		window.__env.networkPipeDetailsUrl = window.__env.json+'map_geo_pipe_detail.json?'; //done
		/* 	event summary - daily, weekly - event
		*	- modules/remote/modalSiteEventsCtrl.js
		*/
		window.__env.siteEventSummaryUrl = window.__env.json+'tsevent_pressure_summary.json?'; //done
		/* 	reading summary - daily, weekly - reading
		*	- modules/remote/modalSiteEventsCtrl.js
		*/
		window.__env.siteReadingSummaryUrl = window.__env.json+'tsda_reading_summary.json?'; //done
		/* 	dashboard network summary
		*	- modules/main/networkCtrl.js
		*/
		window.__env.dashboardNetworkSummaryUrl = window.__env.json+'dashboard_network_summary.json?'; //done
		/* 	dashboard dma data
		*	- modules/main/mainCtrl.js
		*/
		window.__env.dmaUrl = window.__env.json+'map_dma.json?'; //done
		/* 	monitor site neighbors
		*	- modules/monitor/modalMonitorEventDetailsCtrl.js
		*/
		window.__env.monitorSiteNeighborUrl = window.__env.json+'site_neighbors.json?'; //done
		/* 	event tag
		*	- modules/monitor/modalMonitorEventDetailsCtrl.js
		*	- modules/remote/modalEventDetailsCtrl.js
		*/
		window.__env.eventTagsUrl = window.__env.json+'tsevent_alltags.json?'; //done
		/* 	monitor - event data
		*	- modules/monitor/monitorCtrl.js
		*/
		window.__env.monitorEventUrl = window.__env.json+'monitor_events.json?'; //done
		/* 	monitor - event details chart data
		*	- modules/monitor/modalMonitorEventDetails.js
		*/
		window.__env.monitorEventDetailsUrl = window.__env.json+'monitor_event_details.json?'; //done
		/* 	monitor - event details add plot - extra data for sample used
		*	- modules/monitor/modalMonitorEventDetails.js
		*/
		window.__env.monitorEventAddPlotUrl = window.__env.json+'monitor_event_addplot.json?'; //done
		/* 	monitor - add next 5 mins - extra data for sample used
		*	- modules/monitor/modalMonitorEventDetails.js
		*/
		window.__env.monitorEventNextUrl = window.__env.json+'monitor_event_next_5min.json?'; //done
		/* 	download csv
		*	- modules/remote/modalTimeSeriesCtrl.js
		*/
		window.__env.downloadCsvUrl = window.__env.json+'download.csv'; //done
	}


	//modal
	window.__env.modalTimeSeriesUrl = window.__env.folder+'/app/modules/remote/modalTimeSeries.html';
	window.__env.modalEventDetailsUrl = window.__env.folder+'/app/modules/remote/modalEventDetails.html';
	window.__env.modalMonitorEventDetailsUrl = window.__env.folder+'/app/modules/monitor/modalMonitorEventDetails.html';
	window.__env.modalHighRateUrl = window.__env.folder+'/app/modules/remote/modalHighRate.html';
	window.__env.modalInformationTableInfo = window.__env.folder+'/app/modules/remote/modalDetails.html';
	window.__env.modalInformationTableMap = window.__env.folder+'/app/modules/remote/modalMap.html';
	window.__env.modalMonitorEventMap = window.__env.folder+'/app/modules/monitor/modalMap.html';
	window.__env.modalSiteEventUrl = window.__env.folder+'/app/modules/remote/modalSiteEvents.html';

	//locale folder
	window.__env.localeFolderUrl = window.__env.folder+'/app/translations/locale-';

	//ignore auth Interceptor request
	window.__env.ignoreInterceptorRequest = ['uib/template/modal/window.html', window.__env.baseUrl+'user/login'];

	//language reload page
	window.__env.langReloadPath = ["/site","/gis",'/network-analysis','/location','/network-data'];

	//main page after user login
	window.__env.pageMain = '/dashboard-info';

	// Whether or not to enable debug mode
	// Setting this to false will disable console output
	window.__env.enableDebug = true;
}(this));