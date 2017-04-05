

export default class colorService {
	constructor($mdTheming, themeProvider, $mdColors, $rootScope){
		'ngInject';
		this._$mdTheming = $mdTheming;
		this._$mdColors = $mdColors;
		this._$rootScope = $rootScope;
		this._themeProvider = themeProvider;
		this.current = 'red_blue';

		themeProvider.alwaysWatchTheme(true);
		themeProvider.generateThemesOnDemand(true);
		this.changeCurrentTheme({name: this.current, primary: 'red', accent: 'blue'});
	};

	getActiveBackgroundColor(){
		return this.activeBackgroundColor;
	}

	changeCurrentTheme(newTheme){
		var theme = this._themeProvider.theme(newTheme.name)
		.primaryPalette(newTheme.primary)
		.accentPalette(newTheme.accent);
		this._$mdTheming.generateTheme(newTheme.name);
		this._themeProvider.setDefaultTheme(newTheme.name);
		this._$mdTheming.THEMES[newTheme.name] = theme;
		this._$mdTheming.generateTheme(newTheme.name);
		this.current = newTheme.name;	
		var name = this._$mdTheming.THEMES[this._$mdTheming.defaultTheme()].colors.accent.name;
    	var hue = this._$mdTheming.THEMES[this._$mdTheming.defaultTheme()].colors.accent.hues.default;
    	this.activeBackgroundColor = this._$mdColors.getThemeColor(name + '-' + hue + '-.8');
	}


}

colorService.$inject = ['$mdTheming', 'themeProvider', '$mdColors', '$rootScope'];