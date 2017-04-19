
export default class spotifyUploadCtrl {
	constructor(spotifyService, $scope){
		'ngInject';
		console.log('contructed');
		this._spotifyService = spotifyService;
		this.playlists = [];
		var vm = this;
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

};

spotifyUploadCtrl.$inject = ['spotifyService', '$scope'];