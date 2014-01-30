var app = angular.module("myapp", ["firebase"]);

function MyController($scope, $firebase) {
	var timersRef = new Firebase("https://quickhack.firebaseio.com/timers");
	// Automatically syncs everywhere in realtime
	$scope.timers = $firebase(timersRef);

	$scope.addTimer = function() {
	    $scope.timers.$add({name: $scope.name});
	}
}
