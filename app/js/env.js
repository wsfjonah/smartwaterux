(function (window) {
	'use strict';
	window.__env = window.__env || {};

	//Assets version
	window.__env.assetVersion = "1.0";
	//API Base url
	window.__env.baseUrl = "https://101.132.100.22/api/"; //main api path

	// API url
	window.__env.userLoginUrl = window.__env.baseUrl+'user/login';
	window.__env.siteSearchUrl = window.__env.baseUrl+'site/search';
	window.__env.switchProjectUrl = window.__env.baseUrl+'user/switchproject';
	window.__env.timeSeriesAnyUrl = window.__env.baseUrl+'tsda/query';
	window.__env.timeSeriesRangeUrl = window.__env.baseUrl+'tsda/query';
	window.__env.eventAnyUrl = window.__env.baseUrl+'tsevent/search/-1/10000000000000';
	window.__env.eventDurationUrl = window.__env.baseUrl+'tsevent/search';
	window.__env.eventRangeUrl = window.__env.baseUrl+'tsevent/query';
	window.__env.eventDetailsUrl = window.__env.baseUrl+'tsevent/get';

	//modal
	window.__env.modalTimeSeriesUrl = '/app/modules/remote/modalTimeSeries.html';
	window.__env.modalEventDetailsUrl = '/app/modules/remote/modalEventDetails.html';
	window.__env.modalHighRateUrl = '/app/modules/remote/modalHighRate.html';
	window.__env.modalInformationTableInfo = '/app/modules/remote/modalDetails.html';
	window.__env.modalInformationTableMap = '/app/modules/remote/modalMap.html';

	//locale folder
	window.__env.localeFolderUrl = '/app/translations/locale-';

	//ignore auth Interceptor request
	window.__env.ignoreInterceptorRequest = ['uib/template/modal/window.html', window.__env.baseUrl+'user/login'];

	//main page after user login
	window.__env.pageMain = '/main';

	// Whether or not to enable debug mode
	// Setting this to false will disable console output
	window.__env.enableDebug = true;
}(this));