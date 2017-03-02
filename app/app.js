(function () {'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var os = require('os');
var electron = require('electron');
var jetpack = _interopDefault(require('fs-jetpack'));
var angular = _interopDefault(require('angular'));
var angularRoute = require('angular-route');
var angularAnimate = require('angular-animate');
var angularAria = require('angular-aria');
var angularMaterial = require('angular-material');

// Simple wrapper exposing environment variables to rest of the code.

// The variables have been written to `env.json` by the build process.
var env = jetpack.cwd(__dirname).read('env.json', 'json');

//(function(){

	

class mainHeaderCtrl{

	constructor($mdSidenav, $log){
		'ngInject';

		this._$mdSidenav = $mdSidenav;
		this._$log = $log;
		this.toggleRight = this.buildToggler('right');
	};
    /**
     * Build handler to open/close a SideNav; when animation finishes
     * report completion in console
     */

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
mainHeaderCtrl.$inject = ['$mdSidenav', '$log'];


//})();

class settingsCtrl {
	constructor ($mdColorPalette) {
		this._$mdColorPalette = $mdColorPalette;
		this.colors = Object.keys($mdColorPalette);
	};
}
settingsCtrl.$inject = ['$mdColorPalette'];

// Here is the starting point for your application code.
// All stuff below is just to show you how it works. You can delete all of it.

// Use new ES6 modules syntax for everything.
//import { greet } from './hello_world/hello_world'; // code authored by you in this project
(function(){
	"use strict";

	angular.module('ProjectGato', ['ngAnimate', 'ngRoute', 'ngMaterial'])
	.config(config)
	.controller('mainHeaderCtrl', mainHeaderCtrl)
	.controller('settingsCtrl', settingsCtrl);

	config.$inject = ['$routeProvider', '$mdThemingProvider'];

	function config($routeProvider, $mdThemingProvider){
		$routeProvider
		.when('/', {
			templateUrl: './client/landing/welcome.html'
		});

		$mdThemingProvider.theme('default');
	}
})();

}());
//# sourceMappingURL=app.js.map