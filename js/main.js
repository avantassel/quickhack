var app = angular.module("brewapp", ["firebase"]);

app.FBURL = "https://quickhack.firebaseio.com";

function getTimers(userId, $firebase){
	return $firebase(new Firebase(app.FBURL+'/users/'+userId+'/timers'));
}

app.controller("SidebarCtrl", function ($scope, $firebase) {
	
	//load anonymous timers
	$scope.timers = getTimers('0',$firebase);
	//add three way binding
	$scope.timers.$bind($scope, "timers");

});

app.controller("MainCtrl", function ($scope, $firebase, $interval) {
	
	$scope.getTimers = function(userId){
		//load anonymous timers
		$scope.timers = getTimers(userId,$firebase);

		//unbind first if unbind is set
		if($scope.unbind)
			$scope.unbind();

		//add three way binding
		$scope.timers.$bind($scope, "timers").then(function(unbind) {
		  //save this to later unbind
		  $scope.unbind = unbind;
		});
	};

	//load the timers
	if(!$scope.user)
		$scope.getTimers('0');

	// $scope.timers.$on("change", function() {
 	//  		console.log("A remote change was applied locally!");
	// });

	$scope.user = null;

	//setup auth
	$scope.auth = new FirebaseSimpleLogin(new Firebase(app.FBURL), function(error, user) {
		  if (error) {
		    console.log(error);
		  } else if (user) {
		    //create new user
		    $exists = new Firebase(app.FBURL).child('users/'+user.id);
		    if(!$exists)
		    	new Firebase(app.FBURL).child('users/'+user.id).set(user);
		    
		    //set user obj
		    $scope.user=user;
		    //set user photo
		    $scope.user.photo = 'http://graph.facebook.com/'+user.id+'/picture';
		    //load user timers
		    $scope.getTimers(user.id);
		    $scope.$apply();

		  } else {
		    //logout
		    $scope.user = null;
		    $scope.getTimers('0');
			$scope.$apply();
		  }
	});

	$scope.logout = function(){

		$scope.auth.logout();
	};

	$scope.login = function(){
		
		$scope.auth.login('facebook', {
		  rememberMe: true,
		  scope: 'email,user_likes'
		});
	};

	$scope.addTimer = function() {
		var hsl = Math.random() * (360 - 1) + 1;
		var timestamp = new Date().getTime();

		if($scope.user)
			$scope.timers.$add({name: $scope.timerName, duration: 3600, elapsed:0, hsl: Math.floor(hsl), ts: timestamp, userId: $scope.user.id, userName: $scope.user.displayName});
		else
			$scope.timers.$add({name: $scope.timerName, duration: 3600, elapsed:0, hsl: Math.floor(hsl), ts: timestamp, userId: '0', userName: 'Anonymous'});
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
    };

    $scope.subMin = function (timer,event){
        if(timer.duration>0)
        	timer.duration-=60;
    };

    $scope.getMin = function (timer){
    	var time = timer.duration-timer.elapsed;
        return Math.floor(time / 60);
    };

    $scope.getSec = function (timer){
    	var time = timer.duration-timer.elapsed;
        return time - $scope.getMin(timer) * 60;
    };
});