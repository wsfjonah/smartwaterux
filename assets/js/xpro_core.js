/*  */
"use strict";
var xpro = (function () {
	var my = {},
		controller = $('#xController');

	my.bindUiAction = function(){
		controller.on('click','#sidebarnav li>a:not(.has-arrow)', function(){
			$('body').removeClass('show-sidebar');
		}).on('click', '.customtab>li>a', function(e){
			e.preventDefault();
		});
		$(window).resize(function(){
			my.resizeHeader();
			my.resizeLayout();
			my.infoTableResize();
		});
	};
	my.infoTableResize = function(){
		var table = $('#info_table');
		if(table.length){
			setTimeout(function(){
				table.bootstrapTable('resetWidth');
			},200);
		}
	};
	my.resizeHeader = function(){
		var wd = ($('.topbar .navbar-collapse').length) ? parseInt($('.topbar .navbar-collapse').width()) : 1000;
		$('.page-titles').css('width',parseInt(wd-170));
	};
	my.metisMenu = function(){
		$('#sidebarnav').metisMenu();
	};
	my.stickHeader = function(){
		$(".fix-header .topbar").stick_in_parent({});
	};
	my.tooltips = function(){
		$('body').tooltip({
			selector: '[data-toggle="tooltip"]',
			container: 'body'
		});
	};
	my.destroyTooltip = function(){
		$('[data-toggle="tooltip"]').tooltip('dispose');
	};
	my.popover = function(){
		$('[data-toggle="popover"]').popover();
	};
	my.slimScroll = function(){
		$('.scroll-sidebar').slimScroll({
			position: 'left',
			size: "5px",
			height: '100%',
			color: '#dcdcdc'
		});
		$('.message-center').slimScroll({
			position: 'right',
			size: "5px",
			color: '#dcdcdc'
		 });
		$('.aboutscroll').slimScroll({
			position: 'right',
			size: "5px",
			height: '80',
			color: '#dcdcdc'
		 });
		$('.message-scroll').slimScroll({
			position: 'right',
			size: "5px",
			height: '570',
			color: '#dcdcdc'
		 });
		$('.chat-box').slimScroll({
			position: 'right',
			size: "5px",
			height: '470',
			color: '#dcdcdc'
		 });
		$('.slimscrollright').slimScroll({
			height: '100%',
			position: 'right',
			size: "5px",
			color: '#dcdcdc'
		 });
	};
	my.resizeLayout = function(){
		var width = (window.innerWidth > 0) ? window.innerWidth : this.screen.width;
		var topOffset = 70;
		if (width < 1170) {
			$("body").addClass("mini-sidebar");
			$('.navbar-brand span').hide();
			$('.navbar-brand b').show();
			$(".scroll-sidebar, .slimScrollDiv").css("overflow-x", "visible").parent().css("overflow", "visible");
			$(".sidebartoggler i").addClass("ti-menu");
		}else {
			$('.navbar-brand b').hide();
			$("body").removeClass("mini-sidebar");
			$('.navbar-brand span').show();
		}

		var height = ((window.innerHeight > 0) ? window.innerHeight : this.screen.height) - 1;
		height = height - topOffset;
		if (height < 1) height = 1;
		if (height > topOffset) {
			$(".page-wrapper").css("min-height", (height) + "px");
		}
	};
	my.initPageLoadedLibrary = function(){
		this.stickHeader();
		this.metisMenu();
		this.tooltips();
		this.popover();
		this.slimScroll();
		this.resizeLayout();
	};
	my.init = function(){
		this.stickHeader();
		this.metisMenu();
		this.bindUiAction();
	};
	return my;
}(xpro || {})); //with or without load this core that won't cause the error
$(function() {
	xpro.init();
});