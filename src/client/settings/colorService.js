

export default class colorService {
	constructor($mdTheming, themeProvider, $mdColors, $rootScope, userService){
		'ngInject';
		this._$mdTheming = $mdTheming;
		this._$mdColors = $mdColors;
		this._$rootScope = $rootScope;
		this._themeProvider = themeProvider;
		this._userService = userService;
		this.current = '';
		themeProvider.alwaysWatchTheme(true);
		themeProvider.generateThemesOnDemand(true);
		var vm = this;
		this.getCurrentColors().then(data => {
			var colorPalette = data;
			vm.current = colorPalette.name;
			vm.changeCurrentTheme({name: vm.current, primary: colorPalette.primary, accent: colorPalette.accent, isDark: colorPalette.isDark});
		},
		function(err){
			console.log(err);
		});

	};

	getActiveBackgroundColor(){
		return this.activeBackgroundColor;
	}

	getCurrentColors(){
		return this._userService.getUserData().then((data) => {
			return data.settings.colorPalette;
		});
	};

	getThemeColor(theme, hueName){
		var name = this._$mdTheming.THEMES[this._$mdTheming.defaultTheme()].colors[theme].name;
	    var hue = this._$mdTheming.THEMES[this._$mdTheming.defaultTheme()].colors[theme].hues[hueName];
	    return this._$mdColors.getThemeColor(name + '-' + hue + '-1');
	}

	changeCurrentTheme(newTheme){
		var theme;
		if(newTheme.isDark){
			newTheme.name = newTheme.name;
			theme = this._themeProvider.theme(newTheme.name)
						.primaryPalette(newTheme.primary)
						.accentPalette(newTheme.accent)
						.dark();
		}
		else{
			newTheme.name = newTheme.name;
			theme = this._themeProvider.theme(newTheme.name)
						.primaryPalette(newTheme.primary)
						.accentPalette(newTheme.accent);
		}
		try{
			this._$mdTheming.generateTheme(newTheme.name);
			this._themeProvider.setDefaultTheme(newTheme.name);
			this._$mdTheming.THEMES[newTheme.name] = theme;
			this._$mdTheming.generateTheme(newTheme.name);
			this.current = newTheme.name;
			console.log('DEFAULT THEME', this._$mdTheming.defaultTheme());
			var name = this._$mdTheming.THEMES[this._$mdTheming.defaultTheme()].colors.accent.name;
	    	var hue = this._$mdTheming.THEMES[this._$mdTheming.defaultTheme()].colors.accent.hues.default;
	    	this.activeBackgroundColor = this._$mdColors.getThemeColor(name + '-' + hue + '-.8');
	    	console.log(this.activeBackgroundColor);
	    	this._userService.saveColorSettings(newTheme);
	    }
	    catch(err){
	    	console.log(err);
	    }
	}


}

colorService.$inject = ['$mdTheming', 'themeProvider', '$mdColors', '$rootScope', 'userService'];