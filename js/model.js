/*
The game model is a scrolling background where fish come out from the left or right, one at a time,
and their are three options for the visual and auditory oscillations (fast, slow, none).

The fish appear on the screen for at most 2 seconds.
If the user presses a key, then they disappear, otherwise they disappear after 2 seconds.
Once a fish disappears, a timer is started for when the next fish will appear.
When a fish is spawned, the visual and auditory oscillations are selected as are the side (left/right)

*/


var gameModel = (function() {
    console.log("creating gameModel");
    var startTime = (new Date()).getTime();
    var endTime = startTime + 30*1000;


    var width = height = 100;

    // state of scrolling background
    var imageOffset = 0; // this varies from -100 to 100
    var imageSpeed = 30; // this is in percent of height per second
    // state of timing
    var lastTime = (new Date()).getTime();

    // state of the fish
    var fishPos = [0, 50];
    var fishXVelocity = 10;
    var fishYVelocity = 0;
    var fishVisible = true;
    var fishVisualOscillation = 'fast';
    var fishAudioOscillation = 'fast';
    var fishSide = 'left';
    var fishCount = 0;
    var fishBirth = 0;

    function isGoodFish() {
        return fishVisualOscillation == 'slow';
    }

    function getFishVisible() {
        return fishVisible;
    }

    function setFishVisible(val) {
        fishVisible = val;
    }

    function randInt(N) {
        return Math.round(N * Math.random());
    }

    function spawnFish() {
        var now = (new Date()).getTime();
        if (now > endTime) {
            gameControl.endGame();
            return;
        }
        fishPos = [0, 50];
        fishVisible = true;
        fishVisualOscillation = (randBool()) ? 'fast' : 'slow';
        fishAudioOscillation = (randBool()) ? 'fast' : 'slow';
        fishSide = (randBool()) ? 'left' : 'right';
        fishXVelocity = (fishSide == 'left') ? 20 : -20;
        fishYVelocity = 0;
        fishPos[0]= (fishSide=='left')?0:100;
        newFish = true;

        
        fishCount++;
        console.log("spawned fish " + (new Date()).getTime());
        console.log(JSON.stringify([fishVisualOscillation, fishVisualOscillation,fishSide,fishXVelocity]));
        setTimeout(killFishIfVisible(fishCount), 3000);
        
        fishBirth = (new Date()).getTime();
        var entry = {time:fishBirth-gameStart, action:'birth',visual:fishVisualOscillation,audio:fishAudioOscillation, side:fishSide};
        gameControl.pushLog(entry);
        console.log(JSON.stringify(entry));
        gameView.playFishAudio();
    }
    

    function killFishIfVisible(n) {
       return( function() {
            console.log("Times up!");
            if (fishVisible && (fishCount == n)) {
                var now = (new Date()).getTime();
                var entry=({time:now-gameStart,action:"missedFish"});
                gameControl.pushLog(entry);
                console.log(entry);
                killFish();
            }
        });
    }

    function killFish() {

        fishVisible = false;
        var delay = 1000 + randInt(1000);
        console.log("fish killed... new fish will spawn in " + delay + " ms");
        setTimeout(spawnFish, delay);
        gameView.stopFishAudio();

    }

    function start() {
        fishVisible = false;
        gameStart = (new Date()).getTime();
        var delay = 2000 + randInt(1000);
        console.log("game started... new fish will spawn in " + delay + " ms");
        setTimeout(spawnFish, delay)
    }
    
    function logKeyPress(fishType,key,now){
        var entry = 
          {time:(now-gameStart),action:'keypress',fishType:fishType, key:key, 
             consistent: fishAudioOscillation==fishVisualOscillation, 
             reaction:(now-fishBirth)};
        gameControl.pushLog(entry);
        console.log(JSON.stringify(entry));
    }

    function randBool() {
        return (Math.random() > 0.5);
    }


    function update(now) {
        var dt = (now - lastTime) / 1000.0;
        var theTime = (now - startTime);
        imageOffset += imageSpeed * dt;

        lastTime = now;

        if (imageOffset > 2 * height) {
            imageOffset -= 2 * height;
        }

        if (!fishVisible) return;

        fishPos[0] += fishXVelocity*dt;
        //console.log("fishpos = "+JSON.stringify([fishPos,fishXVelocity,dt,fishXVelocity*dt]));
        if (fishPos[0] > 100) {
            fishXVelocity *= -1;
        } else if (fishPos[0] < 0) {
            fishXVelocity *= -1;
        }
    }

    function goodKeyPress() {
        //fishVisible = false;
        console.log("fishVisible=" + fishVisible);
        //killFish();

    }

    function badKeyPress() {
        //fishVisible = true;
        console.log("fishVisible=" + fishVisible);
        //killFish();

    }
    
    function analyzeLog(log){
        var slowSlow= 0;
    }

    return {
        width: width,
        height: height,
        getFishPos: function(){return fishPos;},
        getFishVisible: getFishVisible,
        setFishVisible: setFishVisible,
        goodKeyPress: goodKeyPress,
        badKeyPress: badKeyPress,
        getImageOffset: function() {
            return (imageOffset)
        },
        getFishAudioOscillation: function() {
            return fishAudioOscillation;
        },
        getFishVisualOscillation: function() {
            return fishVisualOscillation;
        },
        getFishSide: function() {
            return fishSide;
        },
        killFish: killFish,
        isGoodFish: isGoodFish,
        start: start,
        logKeyPress: logKeyPress,
        update: update
    }
}());
