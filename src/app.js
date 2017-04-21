// Here is the starting point for your application code.
// All stuff below is just to show you how it works. You can delete all of it.

// Use new ES6 modules syntax for everything.
import os from 'os'; // native node.js module
import { remote } from 'electron'; // native electron module
import jetpack from 'fs-jetpack'; // module loaded from npm
//import { greet } from './hello_world/hello_world'; // code authored by you in this project
import env from './env';
import angular from 'angular';
import ngRoute from 'angular-route';
import ngAnimate from 'angular-animate';
import ngAria from 'angular-aria';
import ngMaterial from 'angular-material';
import mainHeaderCtrl from './client/header/mainHeaderCtrl';
import settingsCtrl from './client/settings/settingsCtrl';
import colorService from './client/settings/colorService';
import userService from './client/user/userService';
import musicService from './client/music/musicService';
import spotifyService from './client/uploads/spotifyService';
import rootCtrl from './client/root/rootCtrl';
import musicControlsCtrl from './client/music/musicControlsCtrl';
import musicCtrl from './client/music/musicCtrl';
import spotifyUploadCtrl from './client/uploads/spotifyUploadCtrl';
import playlistsCtrl from './client/music/playlistsCtrl';

(function(){
	"use strict";

	angular.module('ProjectGato', ['ngAnimate', 'ngRoute', 'ngMaterial'])
	.config(config)
	.service('colorService', colorService)
	.service('userService', userService)
	.service('musicService', musicService)
	.service('spotifyService', spotifyService)
	.controller('mainHeaderCtrl', mainHeaderCtrl)
	.controller('settingsCtrl', settingsCtrl)
	.controller('rootCtrl', rootCtrl)
	.controller('musicControlsCtrl', musicControlsCtrl)
	.controller('spotifyUploadCtrl', spotifyUploadCtrl)
	.controller('musicCtrl', musicCtrl)
	.controller('playlistsCtrl', playlistsCtrl)
	.filter('formatDuration', function () {
	    return function (input) {
	        var totalHours, totalMinutes, totalSeconds, hours, minutes, seconds, result='';

	        totalSeconds = input / 1000;
	        totalMinutes = totalSeconds / 60;
	        totalHours = totalMinutes / 60;

	        seconds = Math.floor(totalSeconds) % 60;
	        minutes = Math.floor(totalMinutes) % 60;
	        hours = Math.floor(totalHours) % 60;

	        if (hours !== 0) {
	            result += hours+':';

	            if (minutes.toString().length == 1) {
	                minutes = '0'+minutes;
	            }
	        }

	        result += minutes+':';

	        if (seconds.toString().length == 1) {
	            seconds = '0'+seconds;
	        }

	        result += seconds;

	        return result;
	    };
	});
	

	config.$inject = ['$routeProvider', '$mdThemingProvider', '$mdColorPalette', '$provide'];

	function config($routeProvider, $mdThemingProvider, $mdColorPalette, $provide){
		$routeProvider
		.when('/', {
			templateUrl: './client/landing/welcome.html'
		})
		.when('/music/:currentTab/:item', {
			templateUrl: './client/music/musicPage.html'
		})
		.when('/music/:currentTab', {
			templateUrl: './client/music/musicPage.html'
		})
		.when('/upload/spotify', {
			templateUrl: './client/upload/uploadSpotify.html'
		})
		.when('/upload/soundcloud', {
			templateUrl: './client/upload/uploadSoundcloud.html'
		})
		.when('/upload/youtube', {
			templateUrl: './client/upload/uploadYoutube.html'
		})
		.when('/upload/localFiles', {
			templateUrl: './client/upload/uploadLocalFiles.html'
		})
		.when('/upload', {
			templateUrl: './client/upload/uploadExternalSources.html'
		});

		$mdThemingProvider.alwaysWatchTheme(true);
		$mdThemingProvider.generateThemesOnDemand(true);
		$provide.value('themeProvider', $mdThemingProvider);


	}
})();

