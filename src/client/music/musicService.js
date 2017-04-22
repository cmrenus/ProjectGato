var jsmediatags = require('jsmediatags');
var fs = require('fs');
var jetpack = require('fs-jetpack');
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


export default class musicService {
	constructor($rootScope, spotifyService, $mdToast){
		'ngInject';
		this._$rootScope = $rootScope;
		this._spotifyService = spotifyService;
		this._$mdToast = $mdToast;

		this.getSongs();
		this.setPlaylists();
	}

	getSongs() {
		console.log(userDataPath + slash + 'library' + slash + 'library.json');
		console.log(jetpack.read(userDataPath + slash + 'library' + slash + 'library.json'));
		if(jetpack.read(userDataPath + slash + 'library.json')) {
			console.log('hi');
			this.library = JSON.parse(jetpack.read(userDataPath + slash + 'library.json'));
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
							albumsObj[key2].push(this.library[key1][key2][i])
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
	}

	openFileExplorer() {
		var musicController = this;
		this.library = {};
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
								console.log('writing');
								jetpack.remove(userDataPath + slash + 'library.json');
								jetpack.write(userDataPath + slash + 'library.json', musicController.library);
								musicController._$rootScope.$broadcast('uploadedMusic');
						});
				});
		});
	}

	setPlaylists() {
		if(jetpack.read(userDataPath + slash + 'playlists.json')) {
			this.playlists = JSON.parse(jetpack.read(userDataPath + slash + 'playlists.json'));
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
		jetpack.remove(userDataPath + slash + 'playlists.json');
		jetpack.write(userDataPath + slash + 'playlists.json', this.playlists);
	}

	addToPlaylist(song, playlist_name, source) {

	}

	addSpotifySongToLibrary(track_id){
		var vm = this;
		console.log(track_id)
		vm._spotifyService.getSongDetails(track_id).then(function(data){
			console.log(data);
			vm.addSpotifySong(data.data);
			jetpack.remove(userDataPath + slash + 'library.json');
			jetpack.write(userDataPath + slash + 'library.json', vm.library);
			//vm._$rootScope.$broadcast('uploadedMusic');
		},
		function(err){
			console.log(err);
		});
	}


	addSpotifySong(song){
		var artist, album, picture;
		var vm = this;
		if(song.artists && song.artists[0]){
			artist = song.artists[0].name
		}
		else{
			artist = undefined;
		}

		if(song.album){
			album = song.album.name;
		}
		else{
			album = undefined;
		}

		if(song.album && song.album.images && song.album.images[0]){
			picture = song.album.images[0].url;
		}
		else{
			picture = undefined;
		}

		var formattedSong = {
			title: song.name,
			artist: artist,
			album: album,
			picture: picture,
			source: 'spotify',
			song_id: song.id,
			preview: song.preview_url,
			duration: song.duration_ms
		}

		if(!vm.library[song.artists[0].name]){
			vm.library[song.artists[0].name] = {};
		}
		if(!vm.library[song.artists[0].name][song.album.name]){
			vm.library[song.artists[0].name][song.album.name] = [];
		}
		vm.library[song.artists[0].name][song.album.name].push(new Song(formattedSong, formattedSong.picture, formattedSong.source));
		return formattedSong;
	}

	createPlaylistFromSpotifyPlaylist(playlist){
		var vm = this;

		return new Promise(function(reject, resolve){
			if(vm.playlists[playlist.name]){
				reject('playlist already exists');
			}
			vm.playlists[playlist.name] = [];
			for(var x = 0; x < playlist.tracks.length; x++){
				var song = vm.addSpotifySong(playlist.tracks[x]);


				vm.playlists[playlist.name].push(new Song(song, song.picture, song.source));
				if(x === playlist.tracks.length - 1){
					jetpack.remove(userDataPath + slash + 'playlists.json');
					jetpack.write(userDataPath + slash + 'playlists.json', vm.playlists);
					jetpack.remove(userDataPath + slash + 'library.json');
					jetpack.write(userDataPath + slash + 'library.json', vm.library);
					vm._$rootScope.$broadcast('uploadedMusic');
					resolve();
				}
			}
		})

	}
}

musicService.$inject = ['$rootScope', 'spotifyService', '$mdToast'];