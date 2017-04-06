
import jetpack from 'fs-jetpack';

export default class userService {
	constructor($http){
		'ngInject';
		this._$http = $http;
		this.data;
		//this._jetpack = jetpack;

		this.getUserData().then((data) => {
			this.data = data;
		});
	};

	getUserData(){
		/*return jetpack.readAsync('./data/user.json').then(data => {
			return JSON.parse(data);
		});*/
		return this._$http.get('../data/user.json').then(data => {
			return data.data;
		});
	}

	saveColorSettings(theme){
		this.data.settings.colorPalette = theme;
		//console.log(this.data);
		console.log('saving Color Settings');
		try {
			jetpack.write('./data/user.json', this.data);
		}
		catch(err){
			console.log('error');
			console.log(err);
		}
	};
}

userService.$inject = ['$http'];