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
var request = _interopDefault(require('request'));
var $q = _interopDefault(require('q'));

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

var userDataPath = app.getPath('userData');
console.log(userDataPath);
var slash = (function() {
	if(process.platform === 'darwin' || process.platform === 'linux') {
			return '/';
	}
	else return '\\'
})();


class musicService {
	constructor($rootScope){
		'ngInject';
		this._$rootScope = $rootScope;

		this.getSongs();
		this.setPlaylists();
	}

	getSongs() {
		console.log(userDataPath + slash + 'library' + slash + 'library.json');
		console.log(jetpack$1.read(userDataPath + slash + 'library' + slash + 'library.json'));
		if(jetpack$1.read(userDataPath + slash + 'library.json')) {
			console.log('hi');
			this.library = JSON.parse(jetpack$1.read(userDataPath + slash + 'library.json'));
			var music = this.createLibrary();
			return music;
		}
		else {
			console.log('No existing library');
			this.library = {};
		}
	}

	createLibrary() {
		var songs = [];
		var artistsObj = {};
		var artists = [];
		var albumsObj = {};
		var albums = [];
		for (var key1 in this.library) {
			if (this.library.hasOwnProperty(key1)) {
				artistsObj[key1] = [];
				for (var key2 in this.library[key1]) {
					if (this.library[key1].hasOwnProperty(key2)) {
						albumsObj[key2] = [];
						for (var i = 0; i < this.library[key1][key2].length; i++) {
							songs.push(this.library[key1][key2][i]);
							artistsObj[key1].push(this.library[key1][key2][i]);
							albumsObj[key2].push(this.library[key1][key2][i]);
						}
					}
				}
			}
		}

		for (var key in artistsObj) {
			if(artistsObj.hasOwnProperty(key)) {
				artists.push({artist: key, songs: artistsObj[key]});
			}
		}

		for (var key in albumsObj) {
			if(albumsObj.hasOwnProperty(key)) {
				albums.push({album: key, songs: albumsObj[key]});
			}
		}

		return {
			songs: songs,
			artists: artists,
			albums: albums
		};
	}

	libraryEmpty(){
		console.log(this.library);
		return Object.keys(this.library).length === 0 && this.library.constructor === Object;
	}

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
					});
			});
	}
	//Function to search our directory, takes a path, an empty array for promises, and a callback function
	searchDir(path, promises, callback) {
			//Getting an array of our files
			var fileList = jetpack$1.list(path);
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
	}

	openFileExplorer() {
		var musicController = this;
		this.library = {};
		dialog.showOpenDialog({properties: ['openDirectory']}, function(files) {
				//Getting the path to our files
				var musicFolder = files[0];
				//Creating an empty array for promises
				var promises = [];
				//Run our search directory function, give it a callback
				musicController.searchDir(musicFolder, promises, function() {
						//This checks all of the promises that were added to our promise array
						Promise.all(promises).then(function() {
								console.log(musicController.library);
								musicController.currentSong = musicController.library[0];
								console.log('writing');
								jetpack$1.remove(userDataPath + slash + 'library.json');
								jetpack$1.write(userDataPath + slash + 'library.json', musicController.library);
								musicController._$rootScope.$broadcast('uploadedMusic');
						});
				});
		});
	}

	setPlaylists() {
		if(jetpack$1.read(userDataPath + slash + 'playlists.json')) {
			this.playlists = JSON.parse(jetpack$1.read(userDataPath + slash + 'playlists.json'));
			return this.playlists;
		}
		else {
			console.log('No existing playlists');
			this.playlists = {};
			return {};
		}
	}

	getPlaylists(){
		return this.playlists || {};
	}

	createPlaylist(playlist_name) {
		//this.playlist = {};
		this.playlists[playlist_name] = [];
		jetpack$1.remove(userDataPath + slash + 'playlists.json');
		jetpack$1.write(userDataPath + slash + 'playlists.json', this.playlists);
	}

	addToPlaylist(song, playlist_name, source) {

	}


	createPlaylistFromSpotifyPlaylist(playlist){
		var vm = this;

		return new Promise(function(reject, resolve){
			if(vm.playlists[playlist.name]){
				reject('playlist already exists');
			}
			vm.playlists[playlist.name] = [];
			for(var x = 0; x < playlist.tracks.length; x++){
				vm.playlists[playlist.name].push({
					title: playlist.tracks[x].track.name,
					artist: playlist.tracks[x].track.artists[0].name,
					album: playlist.tracks[x].track.album.name,
					picture: playlist.tracks[x].track.album.images[0].url,
					source: 'spotify',
					song_id: playlist.tracks[x].track.id,
					preview: playlist.tracks[x].track.preview_url
				});
				if(x === playlist.tracks.length - 1){
					jetpack$1.remove(userDataPath + slash + 'playlists.json');
					jetpack$1.write(userDataPath + slash + 'playlists.json', vm.playlists);
					resolve();
				}
			}
		})

	}
}

musicService.$inject = ['$rootScope'];

const {BrowserWindow} = require('electron').remote;


class spotifyService {
	constructor($http, $q$$1, $window){
		'ngInject';
		this.CLIENT_ID = '40e6577107c843879fac67522c207a06';
		this.CLIENT_SECRET = '0b0d27063e0d40d48e42cf1da9b1a423';
		this._$window = $window;
		this._$http = $http;
	}

	authenticated(){
		if(this._$window.localStorage['spotifyToken']){
			return true;
		}
		else {
			return false;
		}
	}

	login(){
		console.log('login service');
		var deferred = $q.defer();
		var width = 450,
			height = 730,
			left = (screen.width / 2) - (width / 2),
			top = (screen.height / 2) - (height / 2);
		var scopes = [
				'user-read-private',
				'playlist-read-private',
				'playlist-modify-public',
				'playlist-modify-private',
				'user-library-read',
				'user-library-modify',
				'user-follow-read',
				'user-follow-modify'
			];
		//console.log(CLIENT_ID);
		let win = new BrowserWindow({width: 800, height: 600});
		/*win.on('closed', () => {
		  win = null
		})*/

		// Load a remote URL
		//win.loadURL('https://github.com')
		var authURL = 'https://accounts.spotify.com/authorize?' +
					'client_id=' + this.CLIENT_ID + 
					'&response_type=code' +
					'&redirect_uri=http://localhost/callback.html' +
					'&scope=' + encodeURIComponent(scopes.join(' '));
					//'Spotify' +
					//'menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left

		console.log(authURL);
		win.loadURL(authURL);
		

				// Show window only after window is loaded
		win.webContents.on('did-stop-loading', function (event, oldUrl, newUrl, isMainFrame) {
		  win.show();
		});

		win.webContents.on('did-get-redirect-request', function (event, oldUrl, newUrl, isMainFrame) {
		  // event.preventDefault();
		  //console.log(event);
		  win.close();
		  console.log(newUrl);
		  var code = newUrl.split('?')[1].split('code=')[1];
		  deferred.resolve(code);
		  console.log(code);
		});

		win.on('closed', function() {
			win = null;
		});
		/*window.onmessage = function (e) {
			console.log(e);
			var code = JSON.parse(e.data).code;
			deferred.resolve(code);
		};*/
		return deferred.promise
	}

	setToken(token, expires, refresh_token){
		this._$window.localStorage['spotifyToken'] = token;
		this._$window.localStorage['spotifyExpiresIn'] = expires;
		if(refresh_token){
			this._$window.localStorage['spotifyRefreshToken'] = refresh_token;
		}
	}

	getToken(code){
		var deferred = $q.defer();
		console.log(code);
		var token = this._$window.localStorage['spotifyToken'];
		console.log(new Date().getTime() / 1000 > this._$window.localStorage['spotifyExpiresIn']);
		if(new Date().getTime() / 1000 > this._$window.localStorage['spotifyExpiresIn']){
			console.log('we need a refresh!');
			//deferred.reject('we need a refresh!');
			this.refreshToken().then(function(token){
				deferred.resolve(token);
			},
			function(err){
				deferred.reject(err);
			});
		}
		else if(token && token != 'undefined'){
			console.log('got Token');
			console.log(token);
			deferred.resolve(token);
		}
		else{
			login().then(function(code){
				getNewToken(code).then(function(token){
					deferred.resolve(token);
				},
				function(err){
					deferred.reject(err);
				});
			},
			function(err){
				deferred.reject(err);
			});
		}
		return deferred.promise;
	}

	getNewToken(code){
		/*return $http({
			method: 'POST',
			url: '/spotify/accessToken',
			data: {
				code: code
			}
		}).then(function(data){
			console.log(data);
			setToken(data.data.access_token, data.data.expires_in, data.data.refresh_token);
			return data.data.access_token;
		},
		function(err){
			return err;
		});*/
		var vm = this;
		console.log('getNewToken', code);
		var deferred = $q.defer();
		var options = { 
			method: 'POST',
		  	url: 'https://accounts.spotify.com/api/token',
		  	headers: { 
		     	'cache-control': 'no-cache',
		     	'content-type': 'application/x-www-form-urlencoded'
		    },
		  	form: { 
		 		code: code,
		    	client_id: this.CLIENT_ID,
		    	client_secret: this.CLIENT_SECRET,
		    	grant_type: 'authorization_code',
		    	redirect_uri: 'http://localhost/callback.html'
		    }
		};
		console.log('before request');
		request(options, function (error, response, body) {
			if (error) {
				console.log(error);
				deferred.reject(err);
			}
			console.log(body, response);
			body = JSON.parse(body);
			body['expires_in'] = ((new Date().getTime()) / 1000 | 0) + body['expires_in'];
			vm.setToken(body.access_token, body.expires_in, body.refresh_token);
			deferred.resolve(body.access_token);
			//res.status(200).send(body);
		});

		return deferred.promise;

	}

	refreshToken(){
		/*return $http({
			method: 'POST',
			url: '/spotify/refreshToken',
			data: {
				refresh_token: this._$window.localStorage['spotifyRefreshToken']
			}
		}).then(function(data){
			console.log(data);
			setToken(data.data.access_token, data.data.expires_in, data.data.refresh_token);
			return data.data.access_token;
		},
		function(err){
			console.log(err);
		});*/
		var vm = this;
		var deferred = $q.defer();
		var options = {
			method: 'POST',
			url: 'https://accounts.spotify.com/api/token',
			form: {
				refresh_token: this._$window.localStorage['spotifyRefreshToken'],
				grant_type: 'refresh_token',
				client_id: vm.CLIENT_ID,
				client_secret: vm.CLIENT_SECRET
			}
		};

		request(options, function (error, response, body){
			if(error){
				console.log(error);
				return;
			}
			body = JSON.parse(body);
			body['expires_in'] = ((new Date().getTime()) / 1000 | 0) + body['expires_in'];
			console.log(body);
			vm.setToken(body.access_token, body.expires_in, body.refresh_token);
			deferred.resolve(body.access_token);
			//res.status(200).send(body);
		});
		return deferred.promise;
	}

	getUserPlaylists(){
		var vm = this;
		return vm.getToken().then(function(token){
			return vm._$http({
				method: 'GET',
				url: 'https://api.spotify.com/v1/me/playlists',
				headers: {
					Authorization: 'Bearer ' + token
				}
			});
		});
	}

	getPlaylistDetails(user_id, playlist_id){
		var vm = this;
		return vm.getToken().then(function(token){
			return vm._$http({
				method: 'GET',
				url: 'https://api.spotify.com/v1/users/' + user_id + '/playlists/'+ playlist_id + '/tracks',
				headers: {
					Authorization: 'Bearer ' + token
				}
			});
		});
	}

}

spotifyService.$inject = ['$http', '$q', '$window'];

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

var userDataPath$1 = app$1.getPath('userData');
var slash$1 = (function() {
	if(process.platform === 'darwin' || process.platform === 'linux') {
			return '/';
	}
	else return '\\'
})();


class musicControlsCtrl {
	constructor(colorService, $scope, musicService){
		'ngInject';
		this.primaryColor = colorService.getThemeColor('primary', 'default');
		this.accentColor = colorService.getThemeColor('accent', 'default');
		this.status = 'paused';
		this.volume = 100;
		this.library = {};
		this.songs = [];
		this.artists = [];
		this.albums = [];
		this.index = 0;
		this.player = document.getElementById('music-player');
		this.percentPlayed = 0;
		this.currentSong = null;
		var vm = this;
		this._musicService = musicService;

		this.state = {
			albumSelected: false,
			artistSelected: false,
			playlistSelected: false
		};

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

		$scope.$on('uploadedMusic', function(e){
			vm.library = vm._musicService.getSongs();
			vm.songs = vm.library.songs;
			vm.currentSong = vm.songs[0];
			vm.albums = vm.library.albums;
			vm.artists = vm.library.artists;
		});

		this.library = musicService.getSongs();
		if(this.library) {
			this.songs = this.library.songs;
			this.currentSong = this.songs[0];
			this.albums = this.library.albums;
			this.artists = this.library.artists;
		}

		function update() {
			if(vm.status === 'playing') {
				$scope.$apply(function() {
					vm.percentPlayed = vm.player.currentTime/vm.player.duration * 100;
					vm.player.volume = vm.volume/100;
				});
			}
			window.requestAnimationFrame(update);
		}

		window.requestAnimationFrame(update);

	};

	selectLibrary() {
		this.songs = this.library.songs;
	}

	selectAlbum(i) {
		this.state.albumSelected = true;
		this.songs = this.albums[i].songs;
	}

	setTime() {
		var percent = event.clientX/window.innerWidth;
		var newTime = percent * this.player.duration;
		this.player.currentTime = newTime;
	}

	setSong(i) {
		this.currentSong = this.songs[this.songs.indexOf(i)];
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
		if(this.index < this.songs.length -1) {
			this.index++;
		}
		else {
			this.index = 0;
		}

		this.currentSong = this.songs[this.index];
		this.pause();
		this.play();
	}

	prev() {
		if(this.index > 0) {
			this.index--;
		}
		else {
			this.index = this.songs.length - 1;
		}

		this.currentSong = this.songs[this.index];
		this.pause();
		this.play();
	}

	openFileExplorer() {
		this._musicService.openFileExplorer();
	}
}

musicControlsCtrl.$inject = ['colorService', '$scope', 'musicService'];

class musicCtrl {
	constructor($routeParams, musicService){
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

class spotifyUploadCtrl {
	constructor(spotifyService, $scope, musicService){
		'ngInject';
		console.log('contructed');
		this._spotifyService = spotifyService;
		this.playlists = [];
		this._musicService = musicService;
		var vm = this;
		this._$scope = $scope;
		if(spotifyService.authenticated()){
			spotifyService.getUserPlaylists().then(function(data){
				//console.log(data);
				$scope.$apply(function(){
					vm.playlists = data.data.items;
				});
			},
			function(err){
				console.log(err);
			});
		}
	}

	loginToSpotify(){
		console.log('login');
		var vm = this;
		this._spotifyService.login().then(function(code){
			console.log(code);
			console.log('code success');
			vm._spotifyService.getNewToken(code).then(function(data){
				alert("Successfuly Logged in!");
				vm._spotifyService.getUserPlaylists().then(function(data){
					console.log(data);
					vm.playlists = data.data.items;
				},
				function(err){
					console.log(err);
				});
			},
			function(err){
				console.log(err);
			});
		},
		function(err){
			console.log(err);
		});
	}

	getPlaylistDetails(playlist){
		var vm = this;
		this._spotifyService.getPlaylistDetails(playlist.owner.id, playlist.id).then(function(data){
			console.log(data);
			vm._$scope.$apply(function(){
				playlist.tracks = data.data.items;
				vm.currentPlaylist = playlist;
				console.log(vm.currentPlaylist);
			});
		},
		function(err){
			console.log(err);
		});
	}

	addPlaylist(playlist){
		this._musicService.createPlaylistFromSpotifyPlaylist(playlist).then(function(){
			console.log('Playlist Added');
		},
		function(err){
			console.log(err);
		});
	};

}

spotifyUploadCtrl.$inject = ['spotifyService', '$scope', 'musicService'];

class playlistsCtrl {
	constructor(musicService, $scope){
		'ngInject';
		this._musicService = musicService;
		this._$scope = $scope;
		this.init();
	}

	init(){
		this.playlists = this._musicService.getPlaylists();
		var vm = this;
		vm._$scope.$watch(function(){return vm._musicService.getPlaylists()}, function(newVal, oldVal, scope){
			if(newVal){
				vm.playlists = newVal;
				console.log(vm.playlists);
			}
		}, true);
		console.log(this.playlists);
	}
}

playlistsCtrl.$inject = ['musicService', '$scope'];

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
	.service('spotifyService', spotifyService)
	.controller('mainHeaderCtrl', mainHeaderCtrl)
	.controller('settingsCtrl', settingsCtrl)
	.controller('rootCtrl', rootCtrl)
	.controller('musicControlsCtrl', musicControlsCtrl)
	.controller('spotifyUploadCtrl', spotifyUploadCtrl)
	.controller('musicCtrl', musicCtrl)
	.controller('playlistsCtrl', playlistsCtrl)
	.filter('formatDuration', function () {
	    return function (input) {
	        var totalHours, totalMinutes, totalSeconds, hours, minutes, seconds, result='';

	        totalSeconds = input / 1000;
	        totalMinutes = totalSeconds / 60;
	        totalHours = totalMinutes / 60;

	        seconds = Math.floor(totalSeconds) % 60;
	        minutes = Math.floor(totalMinutes) % 60;
	        hours = Math.floor(totalHours) % 60;

	        if (hours !== 0) {
	            result += hours+':';

	            if (minutes.toString().length == 1) {
	                minutes = '0'+minutes;
	            }
	        }

	        result += minutes+':';

	        if (seconds.toString().length == 1) {
	            seconds = '0'+seconds;
	        }

	        result += seconds;

	        return result;
	    };
	});
	

	config.$inject = ['$routeProvider', '$mdThemingProvider', '$mdColorPalette', '$provide'];

	function config($routeProvider, $mdThemingProvider, $mdColorPalette, $provide){
		$routeProvider
		.when('/', {
			templateUrl: './client/landing/welcome.html'
		})
		.when('/music/:currentTab/:item', {
			templateUrl: './client/music/musicPage.html'
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