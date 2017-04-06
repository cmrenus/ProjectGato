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

	constructor($mdSidenav, $log, $location, colorService, $scope){
		'ngInject';

		this._$mdSidenav = $mdSidenav;
		this._$log = $log;
		this.toggleRight = this.buildToggler('right');
    this.active = $location.path().split('/')[0];
    
    this.activeBackgroundColor = colorService.getActiveBackgroundColor();
    var vm = this;
    $scope.$watch(function(){return colorService.getActiveBackgroundColor()}, function(newVal, oldVal, scope){
      if(newVal){
        vm.activeBackgroundColor = newVal;
      }
    }, true);
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
mainHeaderCtrl.$inject = ['$mdSidenav', '$log', '$location', 'colorService', '$scope'];


//})();

class settingsCtrl {
	constructor ($mdColorPalette, colorService) {
		'ngInject';
		this._$mdColorPalette = $mdColorPalette;
		this._colorService = colorService;
		this.colors = Object.keys($mdColorPalette);
		this.theme = {};
		this.stuff = 'default';
		this.init(this);	
	};

	init(vm){
		this._colorService.getCurrentColors().then(function(data){
			console.log('getCurrentColors', data);
			vm.theme = data;
		});
	};

	selectPrimaryTheme(color){
		this.theme.primary = color;
		console.log(this.theme);
	};

	selectSecondaryTheme(color){
		this.theme.accent = color;
	};

	saveColor(){
		console.log('saveColor', this.theme);
		if(this.theme.isDark){
			this.theme.name = this.theme.primary + '_' + this.theme.accent + '_dark';
		}
		else{
			this.theme.name = this.theme.primary + '_' + this.theme.accent + '_light';
		}
		this._colorService.changeCurrentTheme({
			name: this.theme.name,
			primary: this.theme.primary,
			accent: this.theme.accent,
			isDark: this.theme.isDark
		});
	};
}

settingsCtrl.$inject = ['$mdColorPalette', 'colorService'];

class colorService {
	constructor($mdTheming, themeProvider, $mdColors, $rootScope, userService){
		'ngInject';
		this._$mdTheming = $mdTheming;
		this._$mdColors = $mdColors;
		this._$rootScope = $rootScope;
		this._themeProvider = themeProvider;
		this._userService = userService;
		this.current = '';
		themeProvider.alwaysWatchTheme(true);
		themeProvider.generateThemesOnDemand(true);
		var vm = this;
		this.getCurrentColors().then(data => {
			var colorPalette = data;
			vm.current = colorPalette.name;
			vm.changeCurrentTheme({name: vm.current, primary: colorPalette.primary, accent: colorPalette.accent, isDark: colorPalette.isDark});
		},
		function(err){
			console.log(err);
		});

	};

	getActiveBackgroundColor(){
		return this.activeBackgroundColor;
	}

	getCurrentColors(){
		return this._userService.getUserData().then((data) => {
			console.log('in getCurrenColors', data);
			return data.settings.colorPalette;
		});
	};

	changeCurrentTheme(newTheme){
		console.log('changingCurrentColor', newTheme);
		var theme;
		if(newTheme.isDark){
			newTheme.name = newTheme.name;
			theme = this._themeProvider.theme(newTheme.name)
						.primaryPalette(newTheme.primary)
						.accentPalette(newTheme.accent)
						.dark();
		}
		else{
			newTheme.name = newTheme.name;
			theme = this._themeProvider.theme(newTheme.name)
						.primaryPalette(newTheme.primary)
						.accentPalette(newTheme.accent);
		}
		try{
			this._$mdTheming.generateTheme(newTheme.name);
			this._themeProvider.setDefaultTheme(newTheme.name);
			this._$mdTheming.THEMES[newTheme.name] = theme;
			this._$mdTheming.generateTheme(newTheme.name);
			console.log('generate ' + newTheme.name);
			this.current = newTheme.name;	
			var name = this._$mdTheming.THEMES[this._$mdTheming.defaultTheme()].colors.accent.name;
	    	var hue = this._$mdTheming.THEMES[this._$mdTheming.defaultTheme()].colors.accent.hues.default;
	    	this.activeBackgroundColor = this._$mdColors.getThemeColor(name + '-' + hue + '-.8');
	    	console.log(this.activeBackgroundColor);
	    	this._userService.saveColorSettings(newTheme);
	    }
	    catch(err){
	    	console.log(err);
	    }
	}


}

colorService.$inject = ['$mdTheming', 'themeProvider', '$mdColors', '$rootScope', 'userService'];

class userService {
	constructor($http){
		'ngInject';
		this._$http = $http;
		this.data;
		//this._jetpack = jetpack;

		this.getUserData().then((data) => {
			this.data = data;
		});
	};

	getUserData(){
		/*return jetpack.readAsync('./data/user.json').then(data => {
			return JSON.parse(data);
		});*/
		return this._$http.get('../data/user.json').then(data => {
			return data.data;
		});
	}

	saveColorSettings(theme){
		this.data.settings.colorPalette = theme;
		//console.log(this.data);
		console.log('saving Color Settings');
		try {
			jetpack.write('./data/user.json', this.data);
		}
		catch(err){
			console.log('error');
			console.log(err);
		}
	};
}

userService.$inject = ['$http'];

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
	.service('userService', userService)
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
		.when('/upload/spotify', {
			templateUrl: './client/upload/uploadSpotify.html'
		})
		.when('/upload/soundcloud', {
			templateUrl: './client/upload/uploadSoundcloud.html'
		})
		.when('/upload/youtube', {
			templateUrl: './client/upload/uploadYoutube.html'
		})
		.when('/upload/localFiles', {
			templateUrl: './client/upload/uploadLocalFiles.html'
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