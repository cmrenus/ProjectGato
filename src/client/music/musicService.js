var jsmediatags = require('jsmediatags');
var fs = require('fs');
var jetpack = require('fs-jetpack');
var { dialog, app } = require('electron').remote;
var Song = require('../src/classes/song.js').Song;


export default class musicService {
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
			this.library = JSON.parse(jetpack.read('./data/library.json'));
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
					})
			});
	}
	//Function to search our directory, takes a path, an empty array for promises, and a callback function
	searchDir(path, promises, callback) {
			//Getting an array of our files
			var fileList = jetpack.list(path);
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
				var promises = []
				//Run our search directory function, give it a callback
				vm.searchDir(musicFolder, promises, function() {
						//This checks all of the promises that were added to our promise array
						Promise.all(promises).then(function() {
								console.log(vm.library);
								vm.currentSong = vm.library[0];
								jetpack.write('./data/library.json', vm.library);
								vm._$rootScope.$broadcast('uploadedMusic');
						});
				});
		});
	}
}

musicService.$inject = ['$rootScope'];