"use strict";
//(function(){
	/*angular.module('ProjectGato')
	.controller('mainHeaderCtrl', mainHeaderCtrl);*/

	

	class mainHeaderCtrl{

		contructor($mdSidenav, $log){
			'ngInject';

			this.$mdSidenav = $mdsideNav;
			this.$log = $log;
			this.toggleRight = buildToggler('right');
		    this.isOpenRight = function(){
		      return this.$mdSidenav('right').isOpen();
		    };
		};
	    /**
	     * Build handler to open/close a SideNav; when animation finishes
	     * report completion in console
	     */

	    buildToggler(navID) {
	      return function() {
	        // Component lookup should always be available since we are not using `ng-if`
	        $mdSidenav(navID)
	          .toggle()
	          .then(function () {
	            this.$log.debug("toggle " + navID + " is done");
	          });
	      };
	    }
	}
	//mainHeaderCtrl.$inject = ['$mdSidenav', '$log'];

	export default mainHeaderCtrl;
//})();