/**
The game controller handles all user input, including clicking on checkboxes,
pressing keys, starting and ending the game, etc.
**/
var gameControl = (function() {
    debugPrint("loading controller");

    var showView = function(selected) {
            window.location.hash = '#' + selected;
            $('.view').hide();
            $('#'+selected+'-view').show();
            
            if (selected=="game"){
                //$('#header').hide();
                $("#canvas").css("display","block");
            }else {
                $('#header').show();
            }
            debugPrint("showing "+'#'+selected+'-view')
            if (selected=="dashboard"){
                gameModel.updateParameters();
            }
        };


    var log = [];
    var gameStart = (new Date()).getTime();
    
    function initStat(name){
        return( {name:name, tries:0,correct:0,incorrect:0,missed:0,time:0,reaction:0,missing:0,wrong:0,accuracy:0} );
        };
        
    function initGameStats(){
      return (     
       {
           fast:{fast:initStat("ff"), slow:initStat("fs"), none:initStat("fn")},
           slow:{fast:initStat("sf"), slow:initStat("ss"), none:initStat("sn")},
           none:{fast:initStat("nf"), slow:initStat("ns"), none:initStat("nn")}
       });
     };
     
     var gameStats = initGameStats();
    
    // this is called after a "game event" has occurred
    function pushLog(data){
        debugPrint("pushing "+data);
        log.push(data);
        updateStats(data);
    }
    
    // here is where we update the current stats for this players game
    // at the end we will show it to the player and send this data to the server...
    function updateStats(event){
         debugPrint("updateStat:"+event.visual+" "+event.audio);
         var stats = gameStats[event.visual][event.audio];
         if (event.action=="keypress"){
             stats.tries++;
             if (event.correct) {
                 stats.correct++;
                 stats.time += event.reaction;
             } else {
                 stats.incorrect++;
             }
         } else if (event.action=="missed"){
             stats.missed ++;
             stats.tries++;

         }
         if (stats.tries>0){
            if (event.visual=='none' || event.audio=='none'){
                // in oddball cases the player is supposed to miss!
                stats.missing = Math.round(stats.missed/stats.tries*100)+"%";
                stats.accuracy = Math.round(stats.missed/stats.tries*100)+"%";
                stats.wrong = Math.round(stats.incorrect/stats.tries*100)+"%";  
            }
         else 
           {
             stats.missing = Math.round(stats.missed/stats.tries*100)+"%";
             stats.accuracy = Math.round(stats.correct/stats.tries*100)+"%";
             stats.wrong = Math.round(stats.incorrect/stats.tries*100)+"%";
         }}
         if (stats.correct>0) {
             stats.reaction = Math.round(stats.time/stats.correct);           
         }
         debugPrint("stats are "+JSON.stringify(stats));
     }
     
    window.addEventListener("keydown", keyDownHandler, false);

    /** handle a key press. We only recognize P and L for now.
    **/
    function keyDownHandler(event) {
        if (window.location.hash != "#game") return;
        
        var now = (new Date()).getTime();
        var keyPressed = String.fromCharCode(event.keyCode);
                
        // this is the case where there was no fish visible
        // and they pressed the key. It doesn't count as correct
        // or incorrect 
        if (!gameModel.getFishVisible()) {
            gameModel.logKeyPress('nofish',keyPressed,'incorrect',now);
            gameView.playBad(now);
            return;
        }


        //debugPrint("keydown = "+keyPressed);
        // here is the case where they saw and/or heard a fish
        // and pressed a key classifying it as good or bad
        if (keyPressed == "P") {
            goodKeyPress(now);
        } else if (keyPressed == "L") {
            badKeyPress(now);
        }
    }
    
 

    function goodKeyPress(now) {

        debugPrint("pressed P");

        // if there is not visual or audio any keypresses are wrong!
        // these are the oddball cases ...
        if (gameModel.getFishVisual()=='none' ){
            gameModel.logKeyPress('novis','P','incorrect',now);
            gameView.playBad(now);
            debugPrint("goodKeyPress: goodkey no visual");
            gameModel.killFish();
            return;
        }
        if (gameModel.getFishAudio()=='none'){
            gameModel.logKeyPress('noaud','P','incorrect',now);
            gameView.playBad(now);
            debugPrint("goodKeyPress: goodkey no audio");
            gameModel.killFish();
            return;
        }

        if (gameModel.getFishVisible()) {
            gameModel.killFish();


            if (gameModel.isGoodFish()) {
                gameModel.logKeyPress('good', 'P', 'correct', now);
                gameView.playGood(now);
            } else {
                gameModel.logKeyPress('bad', 'P', 'incorrect', now);
                gameView.playBad(now);
                
            }
        }


    }

    function badKeyPress(now) {
        debugPrint("pressed L");
        
        // if there is not visual or audio any keypresses are wrong!
        // these are the oddball cases ...
        if (gameModel.getFishVisual()=='none' ){
            gameModel.logKeyPress('novis','L','incorrect',now);
            gameView.playBad(now);
            gameModel.killFish();
            return;
        }
        if (gameModel.getFishAudio()=='none'){
            gameModel.logKeyPress('noaud','L','incorrect',now);
            gameView.playBad(now);
            gameModel.killFish();
            return;
        }


        // this is the case where they saw and heard a fish
        //  and pushed the "L" key        
        if (gameModel.getFishVisible()) {
            gameModel.killFish();

            if (gameModel.isGoodFish()) {
                gameModel.logKeyPress('good', 'L', 'incorrect', now);
                gameView.playBad();
            } else {
                gameModel.logKeyPress('bad', 'L', 'correct', now);
                gameView.playGood();
            }
        }

    }
    
    function getPercentCorrect(){
        var totalTries = gameStats.fast.fast.tries + gameStats.fast.slow.tries + gameStats.slow.fast.tries + gameStats.slow.slow.tries;
        var totalCorrect = gameStats.fast.fast.correct + gameStats.fast.slow.correct + gameStats.slow.fast.correct + gameStats.slow.slow.correct;
        var percent = (totalTries==0)? 0: totalCorrect*100/totalTries;
        return percent;
    }
    
    function endGame(){
        var logelt = document.getElementById('log');
        var percentCorrect = getPercentCorrect();
        var msgString = "Sorry you did not advance to the next level...";

        if (percentCorrect > 90) {
            var userLevel = gameModel.incrementUserLevel();

            alert("new level is "+userLevel);
            msgString = "Congrats!!! You have advanced to level "+ userLevel;
        }
        //logelt.textContent = JSON.stringify(gameStats)+"\n\n\n"+(JSON.stringify(log));
        var statString = "<h2>Congruent</h2>"+ "Percent correct: "+getPercentCorrect() + "<br/>"+msgString+
          "<ul><li>"
           +JSON.stringify(gameStats.fast.fast)+"</li><li>"
           +JSON.stringify(gameStats.slow.slow)+"</li></ul><h2>Incongruent</h2><ul><li>"
           +JSON.stringify(gameStats.fast.slow)+"</li><li>"
           +JSON.stringify(gameStats.slow.fast)+"</li></ul><br/><h2>OddBall</h2><ul><li>"
           +JSON.stringify(gameStats.none.fast)+"</li><li>"
           +JSON.stringify(gameStats.none.slow)+"</li><li>"
           +JSON.stringify(gameStats.fast.none)+"</li><li>"
           +JSON.stringify(gameStats.slow.none)+
           "</li></ul><br/><h2>Log</h2>"
           ;
        $("#log").html( statString+"<\hr>"+(JSON.stringify(log)))
        showView("log");
        gameLoop.stop();
    }
    
    function runVisual(){
        showView("game");
        gameModel.setAVMode("visual");
        startGame();
    }
    
    function runAural(){
        showView("game");
        gameModel.setAVMode("audio");
        startGame();
    }
    
    function consent(){
        window.localStorage.consentStatus = "consented";
        showView("dashboard");
    }
    
    
    function start(){
        if (window.localStorage.consentStatus != "consented")
            showView("consent");
        else
            showView("dashboard");
    }
    
    function startGame(){
        gameLoop.start(); 
        gameModel.start();   
    }
    
    return({
        showView:showView,

        start:start,
        runVisual:runVisual,
        runAural:runAural,
        pushLog:pushLog,
        endGame:endGame,
        consent:consent
    })

}())
