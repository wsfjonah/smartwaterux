(function (window) {
	'use strict';
	window.__env = window.__env || {};

	//Assets version
	window.__env.assetVersion = "1.0";
	//API Base url
	window.__env.baseUrl = "https://101.132.100.22/api/"; //main api path - client development path - /api/ | wes dev - https://101.132.100.22/api/

	//project folder name
	window.__env.folder = ""; //client development env - /smartwater | wes dev - ""

	// API url
	window.__env.userLoginUrl = window.__env.baseUrl+'user/login';

	window.__env.switchProjectUrl = window.__env.baseUrl+'user/switchproject';
	window.__env.timeSeriesAnyUrl = window.__env.baseUrl+'tsda/query';
	window.__env.timeSeriesRangeUrl = window.__env.baseUrl+'tsda/query';
	window.__env.eventAnyUrl = window.__env.baseUrl+'tsevent/search/-1/100000000';
	window.__env.eventDurationUrl = window.__env.baseUrl+'tsevent/search';
	window.__env.eventRangeUrl = window.__env.baseUrl+'tsevent/query';
	window.__env.eventDetailsUrl = window.__env.baseUrl+'tsevent/get';
	window.__env.eventSingleRangeUrl = window.__env.baseUrl+'tsevent/datapoint';
	//batch query time series
	window.__env.batchTimeSeriesUrl = window.__env.baseUrl+'tsda/batchquery';
	//event used - e.g. tag
	window.__env.eventSetUrl = window.__env.baseUrl+'tsevent/set';

	//network sensor
	window.__env.siteSearchUrl = window.__env.baseUrl+'site/search';
	window.__env.networkSensorUrl = window.__env.baseUrl+'site/search';
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

	//monitor neighbor
	window.__env.monitorSiteNeighborUrl = window.__env.baseUrl+'site/get/';

	//modal
	window.__env.modalTimeSeriesUrl = window.__env.folder+'/app/modules/remote/modalTimeSeries.html';
	window.__env.modalEventDetailsUrl = window.__env.folder+'/app/modules/remote/modalEventDetails.html';
	window.__env.modalMonitorEventDetailsUrl = window.__env.folder+'/app/modules/monitor/modalMonitorEventDetails.html';
	window.__env.modalHighRateUrl = window.__env.folder+'/app/modules/remote/modalHighRate.html';
	window.__env.modalInformationTableInfo = window.__env.folder+'/app/modules/remote/modalDetails.html';
	window.__env.modalInformationTableMap = window.__env.folder+'/app/modules/remote/modalMap.html';
	window.__env.modalMonitorEventMap = window.__env.folder+'/app/modules/monitor/modalMap.html';

	//locale folder
	window.__env.localeFolderUrl = window.__env.folder+'/app/translations/locale-';

	//ignore auth Interceptor request
	window.__env.ignoreInterceptorRequest = ['uib/template/modal/window.html', window.__env.baseUrl+'user/login'];

	//language reload page
	window.__env.langReloadPath = ["/site","/gis",'/network-analysis','/location','/network-data'];

	//main page after user login
	window.__env.pageMain = '/main';

	// Whether or not to enable debug mode
	// Setting this to false will disable console output
	window.__env.enableDebug = true;
}(this));