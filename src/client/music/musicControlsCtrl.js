var jsmediatags = require('jsmediatags');
var fs = require('fs');
var jetpack = require('fs-jetpack');
var { dialog, app } = require('electron').remote;
var Song = require('../src/classes/song.js').Song;

var userDataPath = app.getPath('userData');
var slash = (function() {
	if(process.platform === 'darwin' || process.platform === 'linux') {
			return '/';
	}
	else return '\\'
})();


export default class musicControlsCtrl {
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
		this.playlists = null;
		this.index = 0;
		this.player = document.getElementById('music-player');
		this.percentPlayed = 0;
		this.currentSong = null;
		this.selectedSong = null;
		var vm = this;
		this._musicService = musicService;
		this.menu = {
			open: '',
			subMenu: false,
			x: 0,
			y:0
		}

		this.state = {
			albumSelected: false,
			artistSelected: false,
			playlistSelected: false
		}

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
			vm.playlists = vm._musicService.setPlaylists();
			console.log(vm.playlists);
			vm.songs = vm.library.songs;
			vm.currentSong = vm.songs[0];
			vm.albums = vm.library.albums;
			vm.artists = vm.library.artists;
		});

		this.library = musicService.getSongs();
		this.playlists = musicService.setPlaylists();
		console.log(this.playlists);
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
		this.state.albumSelected = this.albums[i];
		this.songs = this.albums[i].songs;
	}

	selectArtist(i) {
		this.state.artistSelected = this.artists[i];
		this.songs = this.artists[i].songs;
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

	back(){
		this.state = {
			albumSelected: false,
			artistSelected: false,
			playlistSelected: false
		}
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

	checkMenuOpen(evt, song) {
		if (evt.which === 3) {
			this.menu.open = 'show-menu';
			this.menu.x = event.clientX;
			this.menu.y = event.clientY;

			this.selectedSong = this.songs[this.songs.indexOf(song)];
			console.log(this.selectedSong);
		}
	}

	menuAdd(playlist_name) {
		console.log(playlist_name);
		console.log(this.selectedSong);
		this._musicService.addToPlaylist(this.selectedSong, playlist_name);

		this.menu.open = '';
		this.menu.subMenu = false;
	}

	openFileExplorer() {
		this._musicService.openFileExplorer();
	}
};

musicControlsCtrl.$inject = ['colorService', '$scope', 'musicService'];