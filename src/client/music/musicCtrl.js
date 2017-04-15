

export default class musicCtrl {
	constructor($routeParams){
		'ngInject'
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
}

musicCtrl.$inject = ['$routeParams'];