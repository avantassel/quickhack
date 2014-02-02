var app = angular.module("brewapp",["firebase"]);

app.FBURL = "https://quickhack.firebaseio.com";

app.factory('brewService',function ($firebase) {
	return { 
            fn: function(userId, callback) {
            	var ref = $firebase(new Firebase("https://quickhack.firebaseio.com/users/"+userId+"/timers"));
				if(callback)
					callback( ref );
			}
	}; 
});


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

function formatDateDiff(ts){
	var today = new Date().getTime();
    	var resp = '';
    	if((time = dateDiff('s',ts,today)) < 60)
    		resp = (time==1)?time+' second ago':time+' seconds ago';
    	else if((time = dateDiff('n',ts,today)) < 60)
    		resp = time+' min ago';
    	else if((time = dateDiff('h',ts,today)) < 24)
    		resp = (time==1)?time+' hour ago':time+' hours ago';
    	else if((time = dateDiff('d',ts,today)) < 30)
    		resp = (time==1)?time+' day ago':time+' days ago';
    	else
    		resp = (time==1)?time+' week ago':time+' weeks ago';
    	
    	return resp;
}


app.controller("MainCtrl", function ($scope, brewService, $interval) {
	/* Auth */
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
		    brewService.fn(user.id, function(ref){
				$scope.timers = ref;
			});
		    $scope.$apply();

		  } else {
		    //logout
		    $scope.user = null;
			brewService.fn('0', function(ref){
				$scope.timers = ref;
			});
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
	/* End Auth */

	/* Sidebar */
	brewService.fn('0', function(ref){
		$scope.pubtimers = ref;
	});
	/* End Sidebar*/

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

		//update placeholder to have text of last timer name
		$(event.target).find('.form-control').val('').attr('placeholder', $scope.timerName);
	};

	$scope.startTimer = function (key,timer,event){

		if($(event.target).hasClass('glyphicon-play')){
			$scope.clock = $interval(function () { 
				timer.elapsed++; 
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
    
    $scope.stopTimer = function(){
    	$interval.cancel($scope.clock);
    	$scope.clock = null;
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
    	return formatDateDiff(ts);
    };
});