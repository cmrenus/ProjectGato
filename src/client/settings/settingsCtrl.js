"use strict";
class settingsCtrl {
	constructor ($mdColorPalette, colorService) {
		'ngInject';
		this._$mdColorPalette = $mdColorPalette;
		this._colorService = colorService;
		//this._$mdTheming = $mdTheming;
		//this._themeProvider = themeProvider;
		this.colors = Object.keys($mdColorPalette);
		this.theme = {};
		this.stuff = 'default';
		//themeProvider.alwaysWatchTheme(true);
		//themeProvider.generateThemesOnDemand(true);
	};

	selectPrimaryTheme(color){
		this.theme.primary = color;
	};

	selectSecondaryTheme(color){
		this.theme.secondary = color;
	};

	saveColor(){
		this._colorService.changeCurrentTheme({
			name: this.theme.primary + this.theme.secondary,
			primary: this.theme.primary,
			accent: this.theme.secondary
		});
		/*var theme = this._themeProvider.theme(this.theme.primary + this.theme.secondary)
		.primaryPalette(this.theme.primary)
		.accentPalette(this.theme.secondary);

		this._$mdTheming.generateTheme(this.theme.primary + this.theme.secondary);
		this._themeProvider.setDefaultTheme(this.theme.primary + this.theme.secondary);
		this._$mdTheming.THEMES[this.theme.primary + this.theme.secondary] = theme;
		this._$mdTheming.generateTheme(this.theme.primary + this.theme.secondary);*/
	};
}
settingsCtrl.$inject = ['$mdColorPalette', 'colorService'];
export default settingsCtrl;