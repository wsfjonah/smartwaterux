/* global angular, BMap */
(function() {
	'use strict';
	angular
		.module('xProject.factory', [])
		.factory('dialogService', dialogService)
		.factory('notify', notify)
		.factory('modalService', modalService);

	function dialogService($mdDialog) {
			var dialogService = {};
			// create an array of alerts available globally
			dialogService.alert = function(ev, opts){
				var config = {
					title: "Information",
					content : "Something went wrong! Please try again",
					ok: "Got It!",
					clickOutsideToClose: true,
					callback: null
				};
				var opt_config = angular.extend({}, config, opts);
				$mdDialog.show(
					$mdDialog.alert()
					.parent(angular.element(document.querySelector('#popupContainer')))
						.clickOutsideToClose(opt_config.clickOutsideToClose)
						.title(opt_config.title)
						.textContent(opt_config.content)
						.ariaLabel(opt_config.title)
						.ok(opt_config.ok)
						.targetEvent(ev)
				).then(function(){
					opt_config.callback();
				});
			};
			return dialogService;
	}

	function notify($mdToast){
		var toastService = {};
		toastService.info = function(){
			$mdToast.show(
		      $mdToast.simple()
		        .textContent('Simple Toast!')
		        .position('top right')
		        .hideDelay(3000)
		    );
		};
	    return toastService;
	}

	function modalService($uibModal){
		var vm = this;
		var modalInstance;
		return{
			open: function(url, ctrl, data){
				modalInstance = $uibModal.open({
					templateUrl: url,
					controller: ctrl,
					size: 'lg',
					resolve: {
						items: function () {
							return data;
						}
					}
				});
				modalInstance.result.then(function (selectedItem) {
					vm.selected = selectedItem;
				}, function () {
					//$log.info('Modal dismissed at: ' + new Date());
				});
			}
		};
	}
})();