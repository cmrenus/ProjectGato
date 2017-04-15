"use strict";
//(function(){

	

class mainHeaderCtrl{

	constructor($mdSidenav, $log, $location, colorService, $scope, musicService, $mdToast){
		'ngInject';

		this._$mdSidenav = $mdSidenav;
		this._$log = $log;
		this.toggleRight = this.buildToggler('right');
    this.active = $location.path().split('/')[0];
    
    this.activeBackgroundColor = colorService.getActiveBackgroundColor();
    var vm = this;

    //check if first time starting application
    this.newApp = musicService.libraryEmpty();

    $scope.$watch(function(){return colorService.getActiveBackgroundColor()}, function(newVal, oldVal, scope){
      if(newVal){
        vm.activeBackgroundColor = newVal;
      }
    }, true);



    $scope.$on('uploadedMusic', function(e, value){
      console.log(e, value);
      vm.newApp = false;
      $scope.$apply();

      $mdToast.show(
        $mdToast.simple()
          .textContent('Music Uploaded!')
          .position('top right')
          .hideDelay(3000)
      );
    });
	};
    /**
     * Build handler to open/close a SideNav; when animation finishes
     * report completion in console
     */

    clickTab(tab){
      this.active = tab;
    }

    isOpenRight(){
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
mainHeaderCtrl.$inject = ['$mdSidenav', '$log', '$location', 'colorService', '$scope', 'musicService', '$mdToast'];

export default mainHeaderCtrl;
//})();