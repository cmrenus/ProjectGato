

export default class playlistsCtrl {
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
		this._$scope.musicControls.state.playlistSelected = false;
	}

	selectPlaylist(i){
		this._$scope.musicControls.state.playlistSelected = true;
		this._$scope.musicControls.songs = this.playlists[i];
	}
}

playlistsCtrl.$inject = ['musicService', '$scope'];