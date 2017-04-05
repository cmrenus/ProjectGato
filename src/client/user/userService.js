
export default class userService {
	constructor($http){
		'ngInject';
		this._$http = $http;
	};

	getUserData(){
		return this._$http.get('./data/user.json')
	}
}

userService.$inject = ['$http'];