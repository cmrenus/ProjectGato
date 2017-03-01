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

(function(){
	"use strict";

	angular.module('ProjectGato', ['ngAnimate', 'ngRoute', 'ngMaterial'])
	.config(config);

	config.$inject = ['$routeProvider', '$mdThemingProvider'];

	function config($routeProvider, $mdThemingProvider){
		/*$routeProvider
		.when('/', {
			templateUrl: 
		})*/

		$mdThemingProvider.theme('default').dark();
	}


})();