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

	constructor($mdSidenav, $log, $location, colorService, $scope, musicService, $mdToast, $window){
		'ngInject';

		this._$mdSidenav = $mdSidenav;
		this._$log = $log;
		this.toggleRight = this.buildToggler('right');
    this.activeBackgroundColor = colorService.getActiveBackgroundColor();
    this.active = $location.path().split('/')[0];
    
    var vm = this;

    //check if first time starting application
    this.newApp = musicService.libraryEmpty();
    if(this.newApp === false){
      $window.location.href = '#/music/songs';
    }

    $scope.$watch(function(){return colorService.getActiveBackgroundColor()}, function(newVal, oldVal, scope){
      if(newVal){
        vm.activeBackgroundColor = newVal;
      }
    }, true);



    $scope.$on('uploadedMusic', function(e, value){
      console.log(e, value);
      vm.newApp = false;
      $scope.$apply();
      $window.location.href = '#/music/songs';
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
mainHeaderCtrl.$inject = ['$mdSidenav', '$log', '$location', 'colorService', '$scope', 'musicService', '$mdToast', '$window'];


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
			return data.settings.colorPalette;
		});
	};

	getThemeColor(theme, hueName){
		var name = this._$mdTheming.THEMES[this._$mdTheming.defaultTheme()].colors[theme].name;
	    var hue = this._$mdTheming.THEMES[this._$mdTheming.defaultTheme()].colors[theme].hues[hueName];
	    return this._$mdColors.getThemeColor(name + '-' + hue + '-1');
	}

	changeCurrentTheme(newTheme){
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
			this.current = newTheme.name;
			console.log('DEFAULT THEME', this._$mdTheming.defaultTheme());
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

var jsmediatags = require('jsmediatags');
var fs = require('fs');
var jetpack$1 = require('fs-jetpack');
var { dialog, app } = require('electron').remote;
var Song = require('../src/classes/song.js').Song;


class musicService {
	constructor($rootScope){
		'ngInject';
		this.slash = (function() {
					if(process.platform === 'darwin' || process.platform === 'linux') {
							return '/';
					}
					else return '\\'
		})();
		this._$rootScope = $rootScope;

		this.getLibrary();
	}

	getLibrary() {
		/*return jetpack.readAsync('./data/user.json').then(data => {
			return JSON.parse(data);
		});*/
		if(this.library){
			return this.library;
		}
		else{
			this.library = JSON.parse(jetpack$1.read('./data/library.json'));
			if(this.library) {
				this.currentSong = this.library[0];
				return this.library
			}
			else {
				console.log('No existing library');
				this.library = [];
				return [];
			}
		}
	}

	libraryEmpty(){
		return this.library.length === 0;
	}

	getMusicData(path) {
			//Setting a variable for the controller
			var vm = this;
			//Hands back a promise to be resolved
			return new Promise(function(resolve, reject) {
					//using jsmediatags to read our music file data
					jsmediatags.read(path, {
							onSuccess: function(data) {
									vm.library.push(new Song(data.tags, path));
									//Resolve the promise
									resolve();
							},
							onError: function(error) {
									reject();
							}
					});
			});
	}
	//Function to search our directory, takes a path, an empty array for promises, and a callback function
	searchDir(path, promises, callback) {
			//Getting an array of our files
			var fileList = jetpack$1.list(path);
			for(var i = 0; i < fileList.length; i++) {
					//Getting the path of the file in list
					var file = path + this.slash + fileList[i];

					//If the file we are given is actually a folder
					if(fs.lstatSync(file).isDirectory()) {
							//Recurse and run search directory again
							this.searchDir(file, promises);
					}
					//If the file is an mp3
					else if(file.substr(file.length - 4) === '.mp3') {
							//Push returned data to our promise array
							promises.push(this.getMusicData(file));
					}
			}

			//If there is a callback
			if(callback) {
					//Run our callback function
					callback(promises);
			}
	}

	openFileExplorer() {
		var vm = this;
		dialog.showOpenDialog({properties: ['openDirectory']}, function(files) {
				//Getting the path to our files
				console.log('hi');
				var musicFolder = files[0];
				//Creating an empty array for promises
				var promises = [];
				//Run our search directory function, give it a callback
				vm.searchDir(musicFolder, promises, function() {
						//This checks all of the promises that were added to our promise array
						Promise.all(promises).then(function() {
								console.log(vm.library);
								vm.currentSong = vm.library[0];
								jetpack$1.write('./data/library.json', vm.library);
								vm._$rootScope.$broadcast('uploadedMusic');
						});
				});
		});
	}
}

musicService.$inject = ['$rootScope'];

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

var jsmediatags$1 = require('jsmediatags');
var fs$1 = require('fs');
var jetpack$2 = require('fs-jetpack');
var { dialog: dialog$1, app: app$1 } = require('electron').remote;
var Song$1 = require('../src/classes/song.js').Song;

var userDataPath = app.getPath('userData');
var slash = (function() {
	if(process.platform === 'darwin' || process.platform === 'linux') {
			return '/';
	}
	else return '\\'
})();


class musicControlsCtrl {
<<<<<<< HEAD
	constructor(colorService, $scope){
=======
	constructor(colorService, $scope, musicService){
		this.slash = (function() {
					if(process.platform === 'darwin' || process.platform === 'linux') {
							return '/';
					}
					else return '\\'
		})();
>>>>>>> dev
		'ngInject';
		this.primaryColor = colorService.getThemeColor('primary', 'default');
		this.accentColor = colorService.getThemeColor('accent', 'default');
		this.status = 'paused';
		this.volume = 35;
		this.library = {};
		this.songs = [];
		this.artists = [];
		this.albums = [];
		this.index = 0;
		this.player = document.getElementById('music-player');
		this.currentSong = null;
		var vm = this;
		this._musicService = musicService;

		$scope.$watch(function(){return colorService.getThemeColor('primary', 'default')}, function(newVal, oldVal, scope){
	      if(newVal){
	        vm.primaryColor = newVal;
	      }
	    }, true);

		$scope.$watch(function(){return colorService.getThemeColor('accent', 'default')}, function(newVal, oldVal, scope){
	      if(newVal){
	        vm.accentColor = newVal;
	      }
	    }, true);

		this.library = musicService.getLibrary();
		//this.openFileExplorer = musicService.openFileExplorer;
	};

	getLibrary() {
		/*return jetpack.readAsync('./data/user.json').then(data => {
			return JSON.parse(data);
		});*/
<<<<<<< HEAD
		if(jetpack$1.read(userDataPath + slash + 'library.json')) {
			this.library = JSON.parse(jetpack$1.read(userDataPath + slash + 'library.json'));
			this.createSongsList();
			this.currentSong = this.songs[0];
=======
		this.library = JSON.parse(jetpack$2.read('./data/library.json'));
		if(this.library) {
			this.currentSong = this.library[0];
>>>>>>> dev
		}
		else {
			console.log('No existing library');
			this.library = {};
		}
	}

	createSongsList() {
		for (var key1 in this.library) {
			if (this.library.hasOwnProperty(key1)) {
				for (var key2 in this.library[key1]) {
					if (this.library[key1].hasOwnProperty(key2)) {
						for (var i = 0; i < this.library[key1][key2].length; i++) {
							this.songs.push(this.library[key1][key2][i]);
						}
					}
				}
			}
		}
		console.log(this.songs);
	}

	setSong(i) {
		this.currentSong = this.library[this.library.indexOf(i)];
		this.pause();
		this.play();
	}

	play(){
		var musicController = this;
		if(this.currentSong.path) {
			window.setTimeout(function() {
				musicController.player.play();
			},0);
			this.status = 'playing';
		}
	}

	pause(){
		this.player.pause();
		this.status = 'paused';
	}

	next() {
		if(this.index < this.library.length -1) {
			this.index++;
		}
		else {
			this.index = 0;
		}

		this.currentSong = this.library[this.index];
		this.pause();
		this.play();
	}

	prev() {
		if(this.index > 0) {
			this.index--;
		}
		else {
			this.index = this.library.length - 1;
		}

		this.currentSong = this.library[this.index];
		this.pause();
		this.play();
	}
	/*
	getMusicData(path) {
			//Setting a variable for the controller
			var musicController = this;
			//Hands back a promise to be resolved
			return new Promise(function(resolve, reject) {
					//using jsmediatags to read our music file data
					jsmediatags.read(path, {
							onSuccess: function(data) {
									if (!musicController.library[data.tags.artist]) {
										musicController.library[data.tags.artist] = {};
									}
									if (!musicController.library[data.tags.artist][data.tags.album]) {
										musicController.library[data.tags.artist][data.tags.album] = [];
									}
									musicController.library[data.tags.artist][data.tags.album].push(new Song(data.tags, path));
									//Resolve the promise
									resolve();
							},
							onError: function(error) {
									reject();
							}
					})
			});
	}
	//Function to search our directory, takes a path, an empty array for promises, and a callback function
	searchDir(path, promises, callback) {
			//Getting an array of our files
			var fileList = jetpack.list(path);
			for(var i = 0; i < fileList.length; i++) {
					//Getting the path of the file in list
					var file = path + slash + fileList[i];

					//If the file we are given is actually a folder
					if(fs.lstatSync(file).isDirectory()) {
							//Recurse and run search directory again
							this.searchDir(file, promises);
					}
					//If the file is an mp3
					else if(file.substr(file.length - 4) === '.mp3') {
							//Push returned data to our promise array
							promises.push(this.getMusicData(file));
					}
			}

			//If there is a callback
			if(callback) {
					//Run our callback function
					callback(promises);
			}
	}*/

	openFileExplorer() {
<<<<<<< HEAD
		var musicController = this;
		this.library = {};
=======
		this._musicService.openFileExplorer();
		/*var musicController = this;
>>>>>>> dev
		dialog.showOpenDialog({properties: ['openDirectory']}, function(files) {
				//Getting the path to our files
				var musicFolder = files[0];
				//Creating an empty array for promises
				var promises = []
				//Run our search directory function, give it a callback
				musicController.searchDir(musicFolder, promises, function() {
						//This checks all of the promises that were added to our promise array
						Promise.all(promises).then(function() {
								console.log(musicController.library);
								musicController.currentSong = musicController.library[0];
<<<<<<< HEAD
								console.log('writing');
								jetpack$1.remove(userDataPath + slash + 'library.json');
								jetpack$1.write(userDataPath + slash + 'library.json', musicController.library);
=======
								jetpack.write('./data/library.json', musicController.library);
>>>>>>> dev
						});
				});
		});*/
	}
}

musicControlsCtrl.$inject = ['colorService', '$scope', 'musicService'];

class musicCtrl {
	constructor($routeParams){
		'ngInject';
		this.reverse = false;
		this.predicate = ['artist', 'title'];

		if($routeParams.currentTab === 'playlists'){
			this.currentTab = 0;
		}
		else if($routeParams.currentTab === 'artists'){
			this.currentTab = 1;
		}
		else if($routeParams.currentTab === 'albums'){
			this.currentTab = 2;
		}
		else {
			this.currentTab = 3;
		}
	}

	order(predicate) {
		this.reverse = (this.predicate[0] === predicate) ? !this.reverse : false;
	    this.predicate = [predicate, 'title'];
	}
}

musicCtrl.$inject = ['$routeParams'];

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
	.service('musicService', musicService)
	.controller('mainHeaderCtrl', mainHeaderCtrl)
	.controller('settingsCtrl', settingsCtrl)
	.controller('rootCtrl', rootCtrl)
	.controller('musicControlsCtrl', musicControlsCtrl)
	.controller('musicCtrl', musicCtrl);
	

	config.$inject = ['$routeProvider', '$mdThemingProvider', '$mdColorPalette', '$provide'];

	function config($routeProvider, $mdThemingProvider, $mdColorPalette, $provide){
		$routeProvider
		.when('/', {
			templateUrl: './client/landing/welcome.html'
		})
		.when('/music/:currentTab', {
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