"use strict";
class settingsCtrl {
	constructor ($mdColorPalette, colorService) {
		'ngInject';
		this._$mdColorPalette = $mdColorPalette;
		this._colorService = colorService;
		this.colors = Object.keys($mdColorPalette);
		this.theme = {};
		this.stuff = 'default';
	};

	selectPrimaryTheme(color){
		this.theme.primary = color;
	};

	selectSecondaryTheme(color){
		this.theme.secondary = color;
	};

	saveColor(){
		this._colorService.changeCurrentTheme({
			name: this.theme.primary + '_' + this.theme.secondary,
			primary: this.theme.primary,
			accent: this.theme.secondary
		});
	};
}
settingsCtrl.$inject = ['$mdColorPalette', 'colorService'];
export default settingsCtrl;