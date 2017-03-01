(function () {'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var os = require('os');
var electron = require('electron');
var jetpack = _interopDefault(require('fs-jetpack'));
var angular$1 = _interopDefault(require('angular'));
var angularRoute = require('angular-route');
var angularAnimate = require('angular-animate');
var angularAria = require('angular-aria');
var angularMaterial = require('angular-material');

// Simple wrapper exposing environment variables to rest of the code.

// The variables have been written to `env.json` by the build process.
var env = jetpack.cwd(__dirname).read('env.json', 'json');

(function(){
	angular.module('ProjectGato')
	.controller('mainHeaderCtrl', mainHeaderCtrl);

	mainHeaderCtrl.$inject = ['$scope', '$timeout', '$mdSidenav', '$log'];

	function mainHeaderCtrl($scope, $timeout, $mdSidenav, $log){
		$scope.toggleLeft = buildDelayedToggler('left');
	    $scope.toggleRight = buildToggler('right');
	    $scope.isOpenRight = function(){
	      return $mdSidenav('right').isOpen();
	    };

	    /**
	     * Supplies a function that will continue to operate until the
	     * time is up.
	     */
	    function debounce(func, wait, context) {
	      var timer;

	      return function debounced() {
	        var context = $scope,
	            args = Array.prototype.slice.call(arguments);
	        $timeout.cancel(timer);
	        timer = $timeout(function() {
	          timer = undefined;
	          func.apply(context, args);
	        }, wait || 10);
	      };
	    }

	    /**
	     * Build handler to open/close a SideNav; when animation finishes
	     * report completion in console
	     */
	    function buildDelayedToggler(navID) {
	      return debounce(function() {
	        // Component lookup should always be available since we are not using `ng-if`
	        $mdSidenav(navID)
	          .toggle()
	          .then(function () {
	            $log.debug("toggle " + navID + " is done");
	          });
	      }, 200);
	    }

	    function buildToggler(navID) {
	      return function() {
	        // Component lookup should always be available since we are not using `ng-if`
	        $mdSidenav(navID)
	          .toggle()
	          .then(function () {
	            $log.debug("toggle " + navID + " is done");
	          });
	      };
	    }
	}
})();

// Here is the starting point for your application code.
// All stuff below is just to show you how it works. You can delete all of it.

// Use new ES6 modules syntax for everything.
//import { greet } from './hello_world/hello_world'; // code authored by you in this project
(function(){
	"use strict";

	angular$1.module('ProjectGato', ['ngAnimate', 'ngRoute', 'ngMaterial'])
	.config(config);

	config.$inject = ['$routeProvider', '$mdThemingProvider'];

	function config($routeProvider, $mdThemingProvider){
		$routeProvider
		.when('/', {
			templateUrl: './client/landing/welcome.html'
		});

		$mdThemingProvider.theme('default').dark();
	}


})();

}());
//# sourceMappingURL=app.js.map