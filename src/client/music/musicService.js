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
		this.getPlaylists();
	}

	getSongs() {
		console.log(userDataPath + slash + 'library' + slash + 'library.json');
		console.log(jetpack.read(userDataPath + slash + 'library' + slash + 'library.json'));
		if(jetpack.read(userDataPath + slash + 'library.json')) {
			console.log('hi');
			this.library = JSON.parse(jetpack.read(userDataPath + slash + 'library.json'));
			var songs = this.createSongsList();
			return songs;
		}
		else {
			console.log('No existing library');
			this.library = {};
		}
	}

	createSongsList() {
		var songs = []
		for (var key1 in this.library) {
			if (this.library.hasOwnProperty(key1)) {
				for (var key2 in this.library[key1]) {
					if (this.library[key1].hasOwnProperty(key2)) {
						for (var i = 0; i < this.library[key1][key2].length; i++) {
							songs.push(this.library[key1][key2][i]);
						}
					}
				}
			}
		}
		return songs;
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

	getPlaylists() {
		if(jetpack.read(userDataPath + slash + 'playlists.json')) {
			this.playlists = JSON.parse(jetpack.read(userDataPath + slash + 'playlists.json'));
			return playlists;
		}
		else {
			console.log('No existing playlists');
			this.playlists = {};
			return {};
		}
	}

	createPlaylist(playlist_name) {
		//this.playlist = {};
		this.playlists[playlist.name] = [];
		jetpack.write(userDataPath + slash + 'playlists.json', this.playlists);
	}



	createPlaylistFromSpotifyPlaylist(playlist){
		var vm = this;
		if(vm.playlists[playlist.name]){
			return new Error('playlist already exists');
		}
		vm.playlists[playlist.name] = [];
		for(var x = 0; x < playlist.tracks.length; x++){
			vm.playlists[playlist.name].push({
				title: playlist.tracks.name,
				artist: playlist.tracks.artists[0].name,
				album: playlists.tracks.album.name,
				picture: playlists.tracks.album.images[0].url,
				source: 'spotify',
				song_id: playlist.track.id,
				preview: playlist.track.preview_url
			});
			if(x - 1 === playlist.tracks.length){
				jetpack.write(userDataPath + slash + 'playlists.json', vm.playlists);
				return true;
			}
		}

	}
}

musicService.$inject = ['$rootScope'];