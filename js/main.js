var app = angular.module("myapp", ["firebase"]);

function MyController($scope, $firebase) {
	var timersRef = new Firebase("https://quickhack.firebaseio.com/timers");
	// Automatically syncs everywhere in realtime
	$scope.timers = $firebase(timersRef);

	$scope.addTimer = function() {
	    $scope.timers.$add({name: $scope.name, time: '3600'});
	}

	$scope.timerRunning = true;

    $scope.startTimer = function (){
        $scope.$broadcast('timer-start');
        $scope.timerRunning = true;
    };

    $scope.stopTimer = function (){
        $scope.$broadcast('timer-stop');
        $scope.timerRunning = false;
    };
}
app.$inject = ['$scope'];