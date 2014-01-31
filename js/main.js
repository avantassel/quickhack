var app = angular.module("brewapp", ["firebase"]);
var FBURL = "https://quickhack.firebaseio.com";

function SidebarCtrl($scope, $firebase) {
	
	$scope.timers = $firebase(new Firebase(FBURL+'/timers'));

}

function MainCtrl($scope, $firebase, $interval) {
	
	$scope.timers = $firebase(new Firebase(FBURL+'/users/0/timers'));

	$scope.auth = new FirebaseSimpleLogin(new Firebase(FBURL), function(error, user) {
		  if (error) {
		    // an error occurred while attempting login
		    console.log(error);
		  } else if (user) {
		    // user authenticated with Firebase
		    console.log('User ID: ' + user.id + ', Provider: ' + user.provider);
		    //create new user
		    $exists = new Firebase(FBURL).child('users/'+user.id);
		    if(!$exists)
		    	new Firebase(FBURL).child('users/'+user.id).set(user);
		    $scope.user=user;
		    $('.user-photo img').attr('src','http://graph.facebook.com/'+$scope.user.id+'/picture');
		    $scope.loadUserTimers();

		  } else {
		    console.log('logged out');
		  }
		});

	$scope.logout = function(){

		$scope.user = "";
		$scope.timers = {};
		$scope.auth.logout();

	};

	$scope.login = function(){
		
		$scope.auth.login('facebook', {
		  rememberMe: true,
		  scope: 'email,user_likes'
		});
	};

	$scope.loadUserTimers = function(){

		$scope.timers = $firebase(new Firebase(FBURL+'/users/'+$scope.user.id+'/timers'));

	};

	$scope.addTimer = function() {
		$hsl = Math.random() * (360 - 1) + 1;
		
		if($scope.user)
			$scope.timers.$add({name: $scope.timerName, duration: 3600, elapsed:0, hsl: Math.floor($hsl), userId: $scope.user.id, userName: $scope.user.displayName});
		else
			$scope.timers.$add({name: $scope.timerName, duration: 3600, elapsed:0, hsl: Math.floor($hsl), userId: '0', userName: 'Anonymous'});
	};

	$scope.startTimer = function (timer,event){

		if($(event.target).hasClass('glyphicon-play')){
			$scope.clock = $interval(function () { 
				timer.elapsed++; 
				//this does not update firebase, not sure why
				//$scope.timers.$save();
				if(timer.elapsed == timer.duration){
					$scope.stopTimer();
				}
			}, 1000);	
			$(event.target).removeClass('glyphicon-play').addClass('glyphicon-pause');
		} else {
			$interval.cancel($scope.clock);
			$(event.target).removeClass('glyphicon-pause').addClass('glyphicon-play');
		}
    };

    $scope.addMin = function (timer,event){
        timer.duration+=60; 
        $scope.timers.$save();
    };

    $scope.subMin = function (timer,event){
        if(timer.duration>0)
        	timer.duration-=60;
        $scope.timers.$save();
    };

    $scope.getMin = function (timer){
    	var time = timer.duration-timer.elapsed;
        return Math.floor(time / 60);
    };

    $scope.getSec = function (timer){
    	var time = timer.duration-timer.elapsed;
        return time - $scope.getMin(timer) * 60;
    };
}