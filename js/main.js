var app = angular.module("myapp", ["firebase"]);

function MyController($scope, $firebase) {
	var timersRef = new Firebase("https://quickhack.firebaseio.com/timers");
	// Automatically syncs everywhere in realtime
	$scope.timers = $firebase(timersRef);

	$scope.addTimer = function() {
		$hsl = Math.random() * (360 - 1) + 1;
	    $scope.timers.$add({name: $scope.name, time: '3600', hsl: Math.floor($hsl) });
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