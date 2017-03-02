"use strict";
//(function(){
	/*angular.module('ProjectGato')
	.controller('mainHeaderCtrl', mainHeaderCtrl);*/

	

	class mainHeaderCtrl{

		constructor($mdSidenav, $log){
			'ngInject';

			this._$mdSidenav = $mdSidenav;
			this._$log = $log;
			this.toggleRight = this.buildToggler('right');
			//console.log($mdSidenav('right').isOpen());
			//console.log(this);
		};
	    /**
	     * Build handler to open/close a SideNav; when animation finishes
	     * report completion in console
	     */

	    isOpenRight(){
	    	console.log(this);
	    	return this._$mdSidenav('right').isOpen();
	    }

	    buildToggler(navID) {
	      return () => {
	        // Component lookup should always be available since we are not using `ng-if`
	        this._$mdSidenav(navID)
	          .toggle()
	          .then( () => {
	            this._$log.debug("toggle " + navID + " is done");
	          });
	      };
	    }
	}
	mainHeaderCtrl.$inject = ['$mdSidenav', '$log'];

	export default mainHeaderCtrl;
//})();