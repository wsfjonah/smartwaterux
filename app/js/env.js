(function (window) {
	'use strict';
	window.__env = window.__env || {};

	//Assets version
	window.__env.assetVersion = "1.0";
	//API Base url
	window.__env.baseUrl = "/api/"; //main api path - client development path - /api/ | wes dev - https://101.132.100.22/api/

	//project folder name
	window.__env.folder = "/optimize"; //client development env - /smartwater | wes dev - ""

	// API url
	window.__env.userLoginUrl = window.__env.baseUrl+'user/login';

	window.__env.switchProjectUrl = window.__env.baseUrl+'user/switchproject';
	window.__env.timeSeriesAnyUrl = window.__env.baseUrl+'tsda/query';
	window.__env.timeSeriesRangeUrl = window.__env.baseUrl+'tsda/query';
	window.__env.eventAnyUrl = window.__env.baseUrl+'tsevent/search/-1/100000000';
	window.__env.eventDurationUrl = window.__env.baseUrl+'tsevent/search';
	window.__env.notificationAnyUrl=window.__env.baseUrl+'notification/search/any';
	window.__env.addUserUrl=window.__env.baseUrl+'user/adduser';
	window.__env.userAllUrl=window.__env.baseUrl+'user/alluser';
	window.__env.moreNotificationUrl=window.__env.baseUrl+'notification/search';
	window.__env.eventRangeUrl = window.__env.baseUrl+'tsevent/query';
	window.__env.eventDetailsUrl = window.__env.baseUrl+'tsevent/get';
	window.__env.eventSingleRangeUrl = window.__env.baseUrl+'tsevent/datapoint';
	//batch query time series
	window.__env.batchTimeSeriesUrl = window.__env.baseUrl+'tsda/batchquery';
    window.__env.checkVerificationCodeUrl=window.__env.baseUrl+'user/checkverificationcode';
    window.__env.checkUsernameUrl=window.__env.baseUrl+'user/checkusername';
    window.__env.resetPasswordUrl=window.__env.baseUrl+'user/updatepassword';
    
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
	window.__env.siteDetailUrl = window.__env.baseUrl+'site/get';
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
	// window.__env.networkSearchPipesUrl ='/api2/map/pipe/detail';

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
	
	window.__env.AddSiteUrl=window.__env.baseUrl+'site/add';
    window.__env.editSiteUrl=window.__env.baseUrl+'site/update';
	//modal
	window.__env.modalTimeSeriesUrl = window.__env.folder+'/app/modules/remote/modalTimeSeries.html';
	window.__env.modalEventDetailsUrl = window.__env.folder+'/app/modules/remote/modalEventDetails.html';
	window.__env.modalMonitorEventDetailsUrl = window.__env.folder+'/app/modules/monitor/modalMonitorEventDetails.html';
	window.__env.modalHighRateUrl = window.__env.folder+'/app/modules/remote/modalHighRate.html';
	window.__env.modalInformationTableInfo = window.__env.folder+'/app/modules/remote/modalDetails.html';
	window.__env.modalInformationTableMap = window.__env.folder+'/app/modules/remote/modalMap.html';
	window.__env.modalInformationTableEdit=window.__env.folder+'/app/modules/admin/modalEdit.html';
	window.__env.modalInformationTableAdd=window.__env.folder+'/app/modules/admin/modalAddSite.html';
	window.__env.modalMonitorEventMap = window.__env.folder+'/app/modules/monitor/modalMap.html';
	window.__env.modalMonitorSiteDetailsUrl = window.__env.folder+'/app/modules/monitor/modalMonitorSiteDetails.html';
	window.__env.modalSiteEventUrl = window.__env.folder+'/app/modules/remote/modalSiteEvents.html';
	window.__env.modalUserUrl=window.__env.folder+'/app/modules/admin/modalAddUser.html';
	
	//locale folder
	window.__env.localeFolderUrl = window.__env.folder+'/app/translations/locale-';

	//ignore auth Interceptor request
	window.__env.ignoreInterceptorRequest = ['uib/template/modal/window.html', window.__env.baseUrl+'user/login'];

	//language reload page
	window.__env.langReloadPath = ["/site","/gis",'/network-analysis','/location','/network-data','/monitor','/flow','/user','/notification','/verification','/adminremote'];

	//main page after user login
	window.__env.pageMain = '/dashboard-info';

	// Whether or not to enable debug mode
	// Setting this to false will disable console output
	window.__env.enableDebug = true;
}(this));