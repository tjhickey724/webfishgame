var gameControl = (function() {
    console.log("loading controller");

    var showView = function(selected) {
            window.location.hash = '#' + selected;
            $('.view').hide();
            $('#'+selected+'-view').show();
            if (selected=="game"){
                $('#header').hide();
            }else {
                $('#header').show();
            }
            console.log("showing "+'#'+selected+'-view')
        };


    var log = [];
    var gameStart = (new Date()).getTime();
    
    function initStat(name){
        return( {name:name, tries:0,correct:0,incorrect:0,missed:0,time:0,reaction:0,missing:0,wrong:0,accuracy:0} );
        };
        
    function initGameStats(){
      return (     
       {
           fast:{fast:initStat("ff"), slow:initStat("fs")},
           slow:{fast:initStat("sf"), slow:initStat("ss")} 
       });
     };
     
     var gameStats = initGameStats();
    
    function pushLog(data){
        console.log("pushing "+data);
        log.push(data);
        updateStats(data);
    }

    window.addEventListener("keydown", keyDownHandler, false);

    function keyDownHandler(event) {
        
        var now = (new Date()).getTime();

        var keyPressed = String.fromCharCode(event.keyCode);
        //console.log("keydown = "+keyPressed);
        if (keyPressed == "P") {
            if (!gameModel.getFishVisible()) return;
            goodKeyPress(now);
        } else if (keyPressed == "L") {
            if (!gameModel.getFishVisible()) return;
            badKeyPress(now);
        }
    }
    
    function updateStats(event){
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
            stats.missing = Math.round(stats.missed/stats.tries*100)+"%";
            stats.accuracy = Math.round(stats.correct/stats.tries*100)+"%";
            stats.wrong = Math.round(stats.incorrect/stats.tries*100)+"%";
        }
        if (stats.correct>0) {
            stats.reaction = Math.round(stats.time/stats.correct);           
        }
        console.log("stats are "+JSON.stringify(stats));
    }

    function goodKeyPress(now) {

        console.log("pressed P");


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
        console.log("pressed L");


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
    
    function endGame(){
        var logelt = document.getElementById('log');
        //logelt.textContent = JSON.stringify(gameStats)+"\n\n\n"+(JSON.stringify(log));
        var statString = "<h2>Congruent</h2><ul><li>"
           +JSON.stringify(gameStats.fast.fast)+"</li><li>"
           +JSON.stringify(gameStats.slow.slow)+"</li></ul><h2>Incongruent</h2><ul><li>"
           +JSON.stringify(gameStats.fast.slow)+"</li><li>"
           +JSON.stringify(gameStats.slow.fast)+"</li></ul><br/><h2>Log</h2>";
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
    
    
    function start(){
        showView("consent");
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
        endGame:endGame
    })

}())
