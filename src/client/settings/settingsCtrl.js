"use strict";
class settingsCtrl {
	constructor ($mdColorPalette) {
		this._$mdColorPalette = $mdColorPalette;
		this.colors = Object.keys($mdColorPalette);
	};
}
settingsCtrl.$inject = ['$mdColorPalette'];
export default settingsCtrl;