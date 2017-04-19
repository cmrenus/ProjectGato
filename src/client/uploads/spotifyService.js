import request from 'request';
import $q from 'q';
const {BrowserWindow} = require('electron').remote;


export default class spotifyService {
	constructor($http, $q, $window){
		'ngInject';
		this.CLIENT_ID = '40e6577107c843879fac67522c207a06';
		this.CLIENT_SECRET = '0b0d27063e0d40d48e42cf1da9b1a423';
		this._$window = $window;
		this._$http = $http;
	}

	authenticated(){
		if(this._$window.localStorage['spotifyToken']){
			return true;
		}
		else {
			return false;
		}
	}

	login(){
		console.log('login service');
		var deferred = $q.defer();
		var width = 450,
			height = 730,
			left = (screen.width / 2) - (width / 2),
			top = (screen.height / 2) - (height / 2);
		var scopes = [
				'user-read-private',
				'playlist-read-private',
				'playlist-modify-public',
				'playlist-modify-private',
				'user-library-read',
				'user-library-modify',
				'user-follow-read',
				'user-follow-modify'
			];
		//console.log(CLIENT_ID);
		let win = new BrowserWindow({width: 800, height: 600})
		/*win.on('closed', () => {
		  win = null
		})*/

		// Load a remote URL
		//win.loadURL('https://github.com')
		var authURL = 'https://accounts.spotify.com/authorize?' +
					'client_id=' + this.CLIENT_ID + 
					'&response_type=code' +
					'&redirect_uri=http://localhost/callback.html' +
					'&scope=' + encodeURIComponent(scopes.join(' '));
					//'Spotify' +
					//'menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left

		console.log(authURL);
		win.loadURL(authURL);
		

				// Show window only after window is loaded
		win.webContents.on('did-stop-loading', function (event, oldUrl, newUrl, isMainFrame) {
		  win.show();
		});

		win.webContents.on('did-get-redirect-request', function (event, oldUrl, newUrl, isMainFrame) {
		  // event.preventDefault();
		  //console.log(event);
		  win.close();
		  console.log(newUrl);
		  var code = newUrl.split('?')[1].split('code=')[1];
		  deferred.resolve(code);
		  console.log(code);
		});

		win.on('closed', function() {
			win = null;
		});
		/*window.onmessage = function (e) {
			console.log(e);
			var code = JSON.parse(e.data).code;
			deferred.resolve(code);
		};*/
		return deferred.promise
	}

	setToken(token, expires, refresh_token){
		this._$window.localStorage['spotifyToken'] = token;
		this._$window.localStorage['spotifyExpiresIn'] = expires;
		if(refresh_token){
			this._$window.localStorage['spotifyRefreshToken'] = refresh_token;
		}
	}

	getToken(code){
		var deferred = $q.defer();
		console.log(code);
		var token = this._$window.localStorage['spotifyToken'];
		console.log(new Date().getTime() / 1000 > this._$window.localStorage['spotifyExpiresIn'])
		if(new Date().getTime() / 1000 > this._$window.localStorage['spotifyExpiresIn']){
			console.log('we need a refresh!');
			//deferred.reject('we need a refresh!');
			this.refreshToken().then(function(token){
				deferred.resolve(token);
			},
			function(err){
				deferred.reject(err);
			});
		}
		else if(token && token != 'undefined'){
			console.log('got Token');
			console.log(token);
			deferred.resolve(token);
		}
		else{
			login().then(function(code){
				getNewToken(code).then(function(token){
					deferred.resolve(token);
				},
				function(err){
					deferred.reject(err);
				})
			},
			function(err){
				deferred.reject(err);
			});
		}
		return deferred.promise;
	}

	getNewToken(code){
		/*return $http({
			method: 'POST',
			url: '/spotify/accessToken',
			data: {
				code: code
			}
		}).then(function(data){
			console.log(data);
			setToken(data.data.access_token, data.data.expires_in, data.data.refresh_token);
			return data.data.access_token;
		},
		function(err){
			return err;
		});*/
		var vm = this;
		console.log('getNewToken', code);
		var deferred = $q.defer();
		var options = { 
			method: 'POST',
		  	url: 'https://accounts.spotify.com/api/token',
		  	headers: { 
		     	'cache-control': 'no-cache',
		     	'content-type': 'application/x-www-form-urlencoded'
		    },
		  	form: { 
		 		code: code,
		    	client_id: this.CLIENT_ID,
		    	client_secret: this.CLIENT_SECRET,
		    	grant_type: 'authorization_code',
		    	redirect_uri: 'http://localhost/callback.html'
		    }
		};
		console.log('before request')
		request(options, function (error, response, body) {
			if (error) {
				console.log(error);
				deferred.reject(err);
			}
			console.log(body, response);
			body = JSON.parse(body);
			body['expires_in'] = ((new Date().getTime()) / 1000 | 0) + body['expires_in'];
			vm.setToken(body.access_token, body.expires_in, body.refresh_token);
			deferred.resolve(body.access_token);
			//res.status(200).send(body);
		});

		return deferred.promise;

	}

	refreshToken(){
		/*return $http({
			method: 'POST',
			url: '/spotify/refreshToken',
			data: {
				refresh_token: this._$window.localStorage['spotifyRefreshToken']
			}
		}).then(function(data){
			console.log(data);
			setToken(data.data.access_token, data.data.expires_in, data.data.refresh_token);
			return data.data.access_token;
		},
		function(err){
			console.log(err);
		});*/
		var vm = this;
		var deferred = $q.defer();
		var options = {
			method: 'POST',
			url: 'https://accounts.spotify.com/api/token',
			form: {
				refresh_token: this._$window.localStorage['spotifyRefreshToken'],
				grant_type: 'refresh_token',
				client_id: vm.CLIENT_ID,
				client_secret: vm.CLIENT_SECRET
			}
		}

		request(options, function (error, response, body){
			if(error){
				console.log(error);
				return;
			}
			body = JSON.parse(body);
			body['expires_in'] = ((new Date().getTime()) / 1000 | 0) + body['expires_in'];
			console.log(body);
			vm.setToken(body.access_token, body.expires_in, body.refresh_token);
			deferred.resolve(body.access_token);
			//res.status(200).send(body);
		});
		return deferred.promise;
	}

	getUserPlaylists(){
		var vm = this;
		return vm.getToken().then(function(token){
			return vm._$http({
				method: 'GET',
				url: 'https://api.spotify.com/v1/me/playlists',
				headers: {
					Authorization: 'Bearer ' + token
				}
			});
		});
	}

}

spotifyService.$inject = ['$http', '$q', '$window'];