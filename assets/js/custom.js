$(function () {
	"use strict";
	$(function () {
		$(".preloader").fadeOut();
	});
	jQuery(document).on('click', '.mega-dropdown', function (e) {
		e.stopPropagation()
	});
	var controller = $('#main-wrapper');
	// ==============================================================
	// Theme options
	// ==============================================================
	controller.on('click','.sidebartoggler',function(){
		if ($("body").hasClass("mini-sidebar")) {
			$("body").trigger("resize");
			$(".scroll-sidebar, .slimScrollDiv").css("overflow", "hidden").parent().css("overflow", "visible");
			$("body").removeClass("mini-sidebar");
			$('.navbar-brand span').show();
			$('.navbar-brand b').hide();
		}
		else {
			$("body").trigger("resize");
			$(".scroll-sidebar, .slimScrollDiv").css("overflow-x", "visible").parent().css("overflow", "visible");
			$("body").addClass("mini-sidebar");
			$('.navbar-brand span').hide();
			$('.navbar-brand b').show();
		}
		xpro.resizeHeader();
	}).on('click','.nav-toggler',function(){
		$("body").toggleClass("show-sidebar");
		$(".nav-toggler i").toggleClass("mdi mdi-menu");
		$(".nav-toggler i").addClass("mdi mdi-close");
	}).on('click','.search-box a, .search-box .app-search .srh-btn',function(){
		$(".app-search").toggle(200);
	}).on('click','.right-side-toggle',function(){ // Right sidebar options
		$(".right-sidebar").slideDown(50);
		$(".right-sidebar").toggleClass("shw-rside");
	}).on('focus blur','.floating-labels .form-control',function(){ // Right sidebar options
		$(this).parents('.form-group').toggleClass('focused', (e.type === 'focus' || this.value.length > 0));
	}).trigger('blur');


	// ==============================================================
	// Auto select left navbar
	// ==============================================================
	$(function () {
		var url = window.location;
		var element = $('ul#sidebarnav a').filter(function () {
			return this.href == url;
		}).addClass('active').parent().addClass('active');
		while (true) {
			if (element.is('li')) {
				element = element.parent().addClass('in').parent().addClass('active');
			}
			else {
				break;
			}
		}
	});

	// ==============================================================
	// Resize all elements
	// ==============================================================
	$("body").trigger("resize");
	// ==============================================================
	// To do list
	// ==============================================================
	$(".list-task li label").click(function () {
		$(this).toggleClass("task-done");
	});

	// ==============================================================
	// Login and Recover Password
	// ==============================================================
	$('#to-recover').on("click", function () {
		$("#loginform").slideUp();
		$("#recoverform").fadeIn();
	});

	// ==============================================================
	// Collapsable cards
	// ==============================================================
		$('a[data-action="collapse"]').on('click',function(e){
			e.preventDefault();
			$(this).closest('.card').find('[data-action="collapse"] i').toggleClass('ti-minus ti-plus');
			$(this).closest('.card').children('.card-body').collapse('toggle');

		});
		// Toggle fullscreen
		$('a[data-action="expand"]').on('click',function(e){
			e.preventDefault();
			$(this).closest('.card').find('[data-action="expand"] i').toggleClass('mdi-arrow-expand mdi-arrow-compress');
			$(this).closest('.card').toggleClass('card-fullscreen');
		});

		// Close Card
		$('a[data-action="close"]').on('click',function(){
			$(this).closest('.card').removeClass().slideUp('fast');
		});




});