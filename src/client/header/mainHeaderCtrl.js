"use strict";
//(function(){

	

class mainHeaderCtrl{

	constructor($mdSidenav, $log, $location, $mdTheming, $mdColors){
		'ngInject';

		this._$mdSidenav = $mdSidenav;
		this._$log = $log;
		this.toggleRight = this.buildToggler('right');
    this.active = $location.path().split('/')[0];
    console.log($mdTheming.THEMES[$mdTheming.defaultTheme()].colors.accent);
    var name = $mdTheming.THEMES[$mdTheming.defaultTheme()].colors.accent.name;
    var hue = $mdTheming.THEMES[$mdTheming.defaultTheme()].colors.accent.hues.default;
    console.log($mdColors.getThemeColor(name + '-' + hue + '-.8'));
    this.activeBackgroundColor = $mdColors.getThemeColor(name + '-' + hue + '-.8');
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
mainHeaderCtrl.$inject = ['$mdSidenav', '$log', '$location', '$mdTheming', '$mdColors'];

export default mainHeaderCtrl;
//})();