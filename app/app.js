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
	constructor ($mdColorPalette, colorService) {
		'ngInject';
		this._$mdColorPalette = $mdColorPalette;
		this._colorService = colorService;
		this.colors = Object.keys($mdColorPalette);
		this.theme = {};
		this.stuff = 'default';
	};

	selectPrimaryTheme(color){
		this.theme.primary = color;
	};

	selectSecondaryTheme(color){
		this.theme.secondary = color;
	};

	saveColor(){
		this._colorService.changeCurrentTheme({
			name: this.theme.primary + this.theme.secondary,
			primary: this.theme.primary,
			accent: this.theme.secondary
		});
	};
}
settingsCtrl.$inject = ['$mdColorPalette', 'colorService'];

class colorService {
	constructor($mdTheming, themeProvider){
		'ngInject';
		this._$mdTheming = $mdTheming;
		this._themeProvider = themeProvider;
		this.current = 'redblue';
		themeProvider.alwaysWatchTheme(true);
		themeProvider.generateThemesOnDemand(true);
		themeProvider.theme('redblue').primaryPalette('red').accentPalette('blue');
		$mdTheming.generateTheme('redblue');
		themeProvider.setDefaultTheme('redblue');
		this._$mdTheming.generateTheme('redblue');
	};

	changeCurrentTheme(newTheme){
		var theme = this._themeProvider.theme(newTheme.name)
		.primaryPalette(newTheme.primary)
		.accentPalette(newTheme.accent);
		this._$mdTheming.generateTheme(newTheme.name);
		this._themeProvider.setDefaultTheme(newTheme.name);
		this._$mdTheming.THEMES[newTheme.name] = theme;
		this._$mdTheming.generateTheme(newTheme.name);
		this.current = newTheme.name;		
	}
}

colorService.$inject = ['$mdTheming', 'themeProvider'];

class rootCtrl {
	constructor(colorService, $scope){
		'ngInject';
		$scope.theme = colorService.current;

		$scope.$watch(function () {
	       return colorService.current;
	     },                       
	      function(newVal, oldVal) {
	        $scope.theme = newVal;
	    }, true);
	}


}

rootCtrl.$inject = ['colorService', '$scope'];

// Here is the starting point for your application code.
// All stuff below is just to show you how it works. You can delete all of it.

// Use new ES6 modules syntax for everything.
//import { greet } from './hello_world/hello_world'; // code authored by you in this project
(function(){
	"use strict";

	angular.module('ProjectGato', ['ngAnimate', 'ngRoute', 'ngMaterial'])
	.config(config)
	.service('colorService', colorService)
	.controller('mainHeaderCtrl', mainHeaderCtrl)
	.controller('settingsCtrl', settingsCtrl)
	.controller('rootCtrl', rootCtrl);
	

	config.$inject = ['$routeProvider', '$mdThemingProvider', '$mdColorPalette', '$provide'];

	function config($routeProvider, $mdThemingProvider, $mdColorPalette, $provide){
		$routeProvider
		.when('/', {
			templateUrl: './client/landing/welcome.html'
		})
		.when('/music/playlists', {
			templateUrl: './client/music/musicPage.html'
		})
		.when('/upload', {
			templateUrl: './client/upload/uploadExternalSources.html'
		});

		$mdThemingProvider.alwaysWatchTheme(true);
		$mdThemingProvider.generateThemesOnDemand(true);
		$provide.value('themeProvider', $mdThemingProvider);


	}
})();

}());
//# sourceMappingURL=app.js.map