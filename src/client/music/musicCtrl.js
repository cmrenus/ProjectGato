

export default class musicCtrl {
	constructor($routeParams, musicService){
		'ngInject'
		this.reverse = false;
		this.predicate = ['artist', 'title'];

		if($routeParams.currentTab === 'playlists'){
			this.currentTab = 0;
		}
		else if($routeParams.currentTab === 'artists'){
			this.currentTab = 1;
		}
		else if($routeParams.currentTab === 'albums'){
			this.currentTab = 2;
		}
		else {
			this.currentTab = 3;
		}
	}

	order(predicate) {
		this.reverse = (this.predicate[0] === predicate) ? !this.reverse : false;
	    this.predicate = [predicate, 'title'];
	}
}

musicCtrl.$inject = ['$routeParams'];