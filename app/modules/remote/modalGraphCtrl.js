/* global angular */
(function() {
	'use strict';
	var modalModule = angular.module('modal.remote',[]);
	modalModule.controller('ModalInstanceCtrl', function ($uibModalInstance, items) {
		var vm = this;
		vm.items = items;
		vm.selected = {
			item: vm.items[0]
		};
		vm.ok = function () {
			$uibModalInstance.close(vm.selected.item);
		};
		vm.cancel = function () {
			$uibModalInstance.dismiss('cancel');
		};
	});

	modalModule.factory('modalService', function($uibModal){
		var vm = this;
		return{
			open: function(data){
				var modalInstance = $uibModal.open({
					templateUrl: '/app/modules/remote/modalGraph.html',
					controller: 'ModalInstanceCtrl as vm',
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
		}
	});
})();