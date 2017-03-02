

export default class colorService {
	constructor($mdTheming, themeProvider){
		'ngInject';
		this._$mdTheming = $mdTheming;
		this._themeProvider = themeProvider;
		this.current = 'redblue';
		themeProvider.alwaysWatchTheme(true);
		themeProvider.generateThemesOnDemand(true);
		themeProvider.theme('redblue').primaryPalette('red').accentPalette('blue');
		$mdTheming.generateTheme('redblue');
		themeProvider.setDefaultTheme('redblue');
		//this._$mdTheming.THEMES[newTheme.name] = theme;
		this._$mdTheming.generateTheme('redblue');
	};
	//this.current = 'redblue';
	//current = 'redblue';
	/*currentTheme(){
		return this.current;
	}*/

	changeCurrentTheme(newTheme){
		var theme = this._themeProvider.theme(newTheme.name)
		.primaryPalette(newTheme.primary)
		.accentPalette(newTheme.accent);
		this._$mdTheming.generateTheme(newTheme.name);
		this._themeProvider.setDefaultTheme(newTheme.name);
		this._$mdTheming.THEMES[newTheme.name] = theme;
		this._$mdTheming.generateTheme(newTheme.name);
		this.current = newTheme.name;		
	}
}

colorService.$inject = ['$mdTheming', 'themeProvider'];

//export default ( new colorService);
