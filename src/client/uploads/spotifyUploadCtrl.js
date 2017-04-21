
export default class spotifyUploadCtrl {
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

};

spotifyUploadCtrl.$inject = ['spotifyService', '$scope', 'musicService'];