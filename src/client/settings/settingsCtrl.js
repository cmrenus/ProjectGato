"use strict";
class settingsCtrl {
	constructor ($mdColorPalette, colorService) {
		'ngInject';
		this._$mdColorPalette = $mdColorPalette;
		this._colorService = colorService;
		this.colors = Object.keys($mdColorPalette);
		this.theme = {};
		this.stuff = 'default';
		this.init(this);	
	};

	init(vm){
		this._colorService.getCurrentColors().then(function(data){
			console.log('getCurrentColors', data);
			vm.theme = data;
		});
	};

	selectPrimaryTheme(color){
		this.theme.primary = color;
		console.log(this.theme);
	};

	selectSecondaryTheme(color){
		this.theme.accent = color;
	};

	saveColor(){
		console.log('saveColor', this.theme)
		if(this.theme.isDark){
			this.theme.name = this.theme.primary + '_' + this.theme.accent + '_dark';
		}
		else{
			this.theme.name = this.theme.primary + '_' + this.theme.accent + '_light';
		}
		this._colorService.changeCurrentTheme({
			name: this.theme.name,
			primary: this.theme.primary,
			accent: this.theme.accent,
			isDark: this.theme.isDark
		});
	};
}

settingsCtrl.$inject = ['$mdColorPalette', 'colorService'];
export default settingsCtrl;