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

    var fishLifetime = 4000; // how long fish stays on the screen in ms
    var minFishSpawn = 500; // minimum time before new fish appears
    var maxFishSpawn = 1500; // maximum time before new fish appears
    var avmode = "visual"; // which mode determines whether a fish is "good"
    // two choices: visual or aural
    // this determines which feature the player should be attending to
    

    function setAVMode(mode) {
        avmode = mode;
    }


    // record the start time of the game and set the end time, all games are the same length
    var gameStart = (new Date()).getTime();
    var gameDuration = 60; // in seconds
    var endTime = gameStart + gameDuration * 1000;


    var correct=0
    var incorrect=0;
    var missed=0;
    var timeRemaining= gameDuration;
    var totalReactionTime=1;
    var lastReactionTime=1;



    // specify the size of the gameboard in the model (having nothing to do with pixels!!)
    var width = height = 100;


    // state of scrolling background
    var imageOffset = 0; // this varies from -100 to 100
    var imageSpeed = 30; // this is in percent of height per second
    // state of timing
    var lastTime = (new Date()).getTime();


    // state of the fish
    // we ought to use a model for the fish... maybe in the next version... but there is only one fish at a time...
    var fishPos = [0, 50];
    var fishXVelocity = 10;
    var fishYVelocity = 0;
    var fishVisible = true;
    var fishVisual = 'fast';
    var fishAudio = 'fast';
    var fishSide = 'left';
    var fishCount = 0;
    var fishBirth = 0;

    function shuffle(o) { //v1.0
        for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    };

    function isGoodFish() {
        if (avmode == "visual") {
            return fishVisual == 'slow';
        } else {
            return fishAudio == 'slow';
        }
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
        fishVisual = (randBool()) ? 'fast' : 'slow';
        fishAudio = (randBool()) ? 'fast' : 'slow';
        fishSide = (randBool()) ? 'left' : 'right';
        fishXVelocity = (fishSide == 'left') ? 20 : -20;
        fishYVelocity = 0;
        fishPos[0] = (fishSide == 'left') ? 0 : 100;
        newFish = true;
        
        if (randInt(2)==0){
            console.log("oddball!");
            if (randBool()){
                fishVisual='none';
            }else {
                fishAudio='none';
            }
        }


        fishCount++;
        console.log("spawned fish #" + fishCount + " at time " + (new Date()).getTime());
        console.log(JSON.stringify([fishVisual, fishVisual, fishSide, fishXVelocity]));
        setTimeout(killFishIfVisible(fishCount), fishLifetime);

        fishBirth = (new Date()).getTime();
        console.log("about to push birth!");
        var entry = {
            time: fishBirth - gameStart,
            action: 'birth',
            id: fishCount,
            visual: fishVisual,
            audio: fishAudio,
            side: fishSide
        };
        gameControl.pushLog(entry);
        console.log("just pushed birth" + JSON.stringify(entry));
        gameView.playFishAudio();
    }


    function killFishIfVisible(n) {
        return (function() {
            console.log("Times up!");
            if (fishVisible && (fishCount == n)) {
                var now = (new Date()).getTime();
                fishVisible = false;
                var entry = {
                    time: now - gameStart,
                    action: "missed",
                    visual: fishVisual,
                    audio: fishAudio,
                    side: fishSide
                };
                gameControl.pushLog(entry);
                console.log(entry);
                killFish();
                lastReactionTime=0;
                if (fishVisual=='none' || fishAudio=='none'){
                    gameView.playGood();
                }else {
                missed++;
                gameView.playBad();
            }
        }});
    }

    function killFish() {

        fishVisible = false;
        var delay = minFishSpawn + randInt(maxFishSpawn - minFishSpawn);
        console.log("fish killed... new fish will spawn in " + delay + " ms");
        setTimeout(spawnFish, delay);
        gameView.stopFishAudio();

    }

    function start() {
        fishVisible = false;
        gameStart = (new Date()).getTime();
        endTime = gameStart + gameDuration * 1000;
        fishCount = 0;

        fishLifetime = parseInt($("#lifetime").val());
        minFishSpawn = parseInt($("#minIFI").val());
        maxFishSpawn = parseInt($("#maxIFI").val());

        var delay = 1000 + randInt(1000);
        console.log("game started... new fish will spawn in " + delay + " ms");
        setTimeout(spawnFish, delay);

        setCanvasSize();
        window.onresize = setCanvasSize; 
    };

    function setCanvasSize() {
        var canvas = document.getElementById('canvas');
        canvas.width = Math.min(1000, window.innerWidth);
        canvas.height = Math.min(1000, window.innerHeight);
    };

    function logKeyPress(fishType, key, isCorrect, now) {
        var entry = {
            time: (now - gameStart),
            action: 'keypress',
            fishType: fishType,
            key: key,
            correct: (isCorrect == 'correct'),
            consistent: fishAudio == fishVisual,
            reaction: (now - fishBirth),
            visual: fishVisual,
            audio: fishAudio,
            side: fishSide
        };
        gameControl.pushLog(entry);
        console.log(JSON.stringify(entry));
        if (isCorrect=="correct") {
            correct++; 
            lastReactionTime = (now-fishBirth);
            totalReactionTime += lastReactionTime;
        }else {
            incorrect++;
            lastReactionTime = 0;
        }
    }

    function randBool() {
        return (Math.random() > 0.5);
    }


    function update(now) {
        var dt = (now - lastTime) / 1000.0;
        var theTime = (now - gameStart);
        imageOffset += imageSpeed * dt;
        timeRemaining = gameDuration-theTime/1000;

        lastTime = now;

        if (imageOffset > 2 * height) {
            imageOffset -= 2 * height;
        }

        if (!fishVisible) return;

        fishPos[0] += fishXVelocity * dt;
        //console.log("fishpos = "+JSON.stringify([fishPos,fishXVelocity,dt,fishXVelocity*dt]));
        if (fishPos[0] > 100) {
            fishXVelocity *= -1;
        } else if (fishPos[0] < 0) {
            fishXVelocity *= -1;
        }
    }


    function analyzeLog(log) {
        var slowSlow = 0;
    }
    
    function getStatus(){
        return(
            {correct:correct, 
             incorrect:incorrect, 
             missed:missed,
             totalReactionTime:totalReactionTime,
             lastReactionTime: lastReactionTime,
             timeRemaining:timeRemaining});
    }

    return {
        width: width,
        height: height,
        getFishPos: function() {
            return fishPos;
        },
        getFishVisible: getFishVisible,
        setFishVisible: setFishVisible,

        getImageOffset: function() {
            return (imageOffset)
        },
        getFishAudio: function() {
            return fishAudio;
        },
        getFishVisual: function() {
            return fishVisual;
        },
        getFishSide: function() {
            return fishSide;
        },
        killFish: killFish,
        isGoodFish: isGoodFish,
        start: start,
        logKeyPress: logKeyPress,
        update: update,
        setAVMode: setAVMode,
        getStatus: getStatus
    }
}());
