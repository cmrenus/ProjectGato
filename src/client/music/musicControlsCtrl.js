
export default class musicControlsCtrl {
	constructor(colorService, $scope){
		'ngInject';
		this.primaryColor = colorService.getThemeColor('primary', 'default');
		this.accentColor = colorService.getThemeColor('accent', 'default');
		this.status = 'paused';
		this.volume = 35;
		var vm = this;
		$scope.$watch(function(){return colorService.getThemeColor('primary', 'default')}, function(newVal, oldVal, scope){
	      if(newVal){
	        vm.primaryColor = newVal;
	      }
	    }, true);

		$scope.$watch(function(){return colorService.getThemeColor('accent', 'default')}, function(newVal, oldVal, scope){
	      if(newVal){
	        vm.accentColor = newVal;
	      }
	    }, true);	    
	};

	play(){
		this.status = 'playing';
	}

	pause(){
		this.status = 'paused';
	}
};

musicControlsCtrl.$inject = ['colorService', '$scope'];