/* global angular */
(function() {
	'use strict';
	var modalInfoDetailModule = angular.module('modal.infoDetail',[]);
	modalInfoDetailModule.controller('modalInfoDetails', function ($uibModalInstance, items) {
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
		vm.header = vm.items.name;
		vm.table = {
			optional: vm.items.optional,
			tag: vm.items.tag
		};
	});
})();