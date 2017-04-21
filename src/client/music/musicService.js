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
	constructor($rootScope){
		'ngInject';
		this._$rootScope = $rootScope;

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


	createPlaylistFromSpotifyPlaylist(playlist){
		var vm = this;

		return new Promise(function(reject, resolve){
			if(vm.playlists[playlist.name]){
				reject('playlist already exists');
			}
			vm.playlists[playlist.name] = [];
			for(var x = 0; x < playlist.tracks.length; x++){
				var artist, album, picture;

				if(playlist.tracks[x].track.artists && playlist.tracks[x].track.artists[0]){
					artist = playlist.tracks[x].track.artists[0].name
				}
				else{
					artist = undefined;
				}

				if(playlist.tracks[x].track.album){
					album = playlist.tracks[x].track.album.name;
				}
				else{
					album = undefined;
				}

				if(playlist.tracks[x].track.album && playlist.tracks[x].track.album.images && playlist.tracks[x].track.album.images[0]){
					picture = playlist.tracks[x].track.album.images[0].url;
				}
				else{
					picture = undefined;
				}

				var song = {
					title: playlist.tracks[x].track.name,
					artist: artist,
					album: album,
					picture: picture,
					source: 'spotify',
					song_id: playlist.tracks[x].track.id,
					preview: playlist.tracks[x].track.preview_url,
					duration: playlist.tracks[x].track.duration
				}


				vm.playlists[playlist.name].push(new Song(song, song.picture, song.source));
				if(!vm.library[playlist.tracks[x].track.artists[0].name]){
					vm.library[playlist.tracks[x].track.artists[0].name] = {};
				}
				if(!vm.library[playlist.tracks[x].track.artists[0].name][playlist.tracks[x].track.album.name]){
					vm.library[playlist.tracks[x].track.artists[0].name][playlist.tracks[x].track.album.name] = [];
				}
				vm.library[playlist.tracks[x].track.artists[0].name][playlist.tracks[x].track.album.name].push(new Song(song, song.picture, song.source));
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

musicService.$inject = ['$rootScope'];