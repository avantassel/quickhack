var app = angular.module("brewapp", ["firebase"]);

app.FBURL = "https://quickhack.firebaseio.com";

function getTimers(userId, $firebase){
	return $firebase(new Firebase(app.FBURL+'/users/'+userId+'/timers'));
}

function dateDiff(datepart, fromdate, todate) {	
  datepart = datepart.toLowerCase();	
  var diff = todate - fromdate;	
  var divideBy = { w:604800000, 
                   d:86400000, 
                   h:3600000, 
                   n:60000, 
                   s:1000 };	
  
  return Math.floor( diff/divideBy[datepart]);
}

app.controller("SidebarCtrl", function ($scope, $firebase) {
	
	$scope.timers = getTimers('0',$firebase);

	$scope.getDateDiff = function (ts){
    	var today = new Date().getTime();
    	var resp = '';
    	if((time = dateDiff('s',ts,today)) < 60)
    		resp = time+' secs ago';
    	else if((time = dateDiff('n',ts,today)) < 60)
    		resp = time+' mins ago';
    	else if((time = dateDiff('h',ts,today)) < 24)
    		resp = time+' hrs ago';
    	else if((time = dateDiff('d',ts,today)) < 30)
    		resp = time+' days ago';
    	else
    		resp = time+' wks ago';
    	
    	return resp;
    };

});

app.controller("MainCtrl", function ($scope, $firebase, $interval) {
	
	//load anonymous timers
	$scope.timers = getTimers('0',$firebase);

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
		    $scope.timers = getTimers(user.id,$firebase);
		    $scope.$apply();

		  } else {
		    //logout
		    $scope.user = null;
			$scope.timers = getTimers('0',$firebase);
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
		var newtimer = {tname: $scope.timerName, duration: 3600, elapsed:0, hsl: Math.floor(hsl), ts: timestamp, userId: '0', userName: 'Anonymous'};

		//update timer with user info
		if($scope.user){
			newtimer.userId = $scope.user.id;
			newtimer.userName = $scope.user.displayName;
		}

		$scope.timers.$add(newtimer);
		
	};

	$scope.startTimer = function (key,timer,event){

		if($(event.target).hasClass('glyphicon-play')){
			$scope.clock = $interval(function () { 
				timer.elapsed++; 
				//this does not update firebase, not sure why
				$scope.timers.$save(key);
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

    $scope.addMin = function (key,timer,event){
        timer.duration+=60; 
        $scope.timers.$save(key);
    };

    $scope.subMin = function (key,timer,event){
        if(timer.duration>0)
        	timer.duration-=60;
        $scope.timers.$save(key);
    };

    $scope.getMin = function (timer){
    	var time = timer.duration-timer.elapsed;
        return Math.floor(time / 60);
    };

    $scope.getSec = function (timer){
    	var time = timer.duration-timer.elapsed;
        return time - $scope.getMin(timer) * 60;
    };

    $scope.removeTimer = function (key,event){
        $scope.timers.$remove(key);
    };

    $scope.getDateDiff = function (ts){
    	var today = new Date().getTime();
    	var resp = '';
    	if((time = dateDiff('s',ts,today)) < 60)
    		resp = time+' secs ago';
    	else if((time = dateDiff('n',ts,today)) < 60)
    		resp = time+' mins ago';
    	else if((time = dateDiff('h',ts,today)) < 24)
    		resp = time+' hrs ago';
    	else if((time = dateDiff('d',ts,today)) < 30)
    		resp = time+' days ago';
    	else
    		resp = time+' wks ago';
    	
    	return resp;
    };
});