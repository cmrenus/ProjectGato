

export default class playlistsCtrl {
	constructor(musicService, $scope){
		'ngInject';
		this._musicService = musicService;
		this._$scope = $scope;
		this.init();
		this.currentPlaylist = {};
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
		this._$scope.musicControls.state.playlistSelected = false;
	}

	selectPlaylist(name){
		this._$scope.musicControls.state.playlistSelected = true;
		this._$scope.musicControls.songs = this.playlists[name];
		this.currentPlaylist = {
			name: name,
			duration: 0,
			count: this.playlists[name].length
		};
		var vm = this;
		for(var x = 0; x < this.playlists[name].length; x++){
			vm.currentPlaylist.duration += Number(vm.playlists[name][x].duration);
			if(x === vm.playlists[name].length - 1){
				vm._$scope.$apply();
			}
			//console.log(vm.playlists[name][x].duration);
		}
	}
}

playlistsCtrl.$inject = ['musicService', '$scope'];