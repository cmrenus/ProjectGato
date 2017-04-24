
export default class youtubeUploadCtrl {
	constructor(musicService, $mdToast){
		'ngInject';
		this._musicService = musicService;
		this._$mdToast = $mdToast;
	}

	getId(url){
		return new Promise(function(resolve, reject){
			var p = url.split('?');
			var params = p[1].split('&');
			if(params.length === 0){
				reject('improper url');
			}
			for(var x = 0; x < params.length; x++){
				var pair = params[x].split('=');
				if(pair[0] === 'v'){
					resolve(pair[1]);
				}
				else if(x === params.length){
					reject('improper url');
				}
			}
		})
		
	}

	addToLibrary(url){
		var vm = this;
		vm.getId(url).then(function(id){
			console.log(id);
			vm._musicService.addYoutubeSong(id).then(function(){
				console.log('success!');
				vm._$mdToast.show({
					template: '<md-toast>' +
					          '<div class="md-toast-content">' +
					            'Song Added to Library!' +
					          '</div>' +
					        '</md-toast>',
					position: 'top right',
					parent: document.getElementById('content')
				});
				vm.url = undefined;
			},
			function(err){
				console.log(err);
			})
		},
		function(err){
			console.log(err);
		});
	}

}

youtubeUploadCtrl.$inject = ['musicService', '$mdToast'];