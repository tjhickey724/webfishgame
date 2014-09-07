var gameControl = (function() {
    console.log("loading controller");

    var showView = function(selected) {
            window.location.hash = '#' + selected;
            $('.view').hide();
            $('#'+selected+'-view').show();
            console.log("showing "+'#'+selected+'-view')
        };


    var log = [];
    var gameStart = (new Date()).getTime();
    var gameStats =
       {fastfast:{tries:0,correct:0,time:0},
       fastslow:{tries:0,correct:0,time:0},
       slowfast:{tries:0,correct:0,time:0},
       slowslow:{tries:0,correct:0,time:0},
      }
    
    function pushLog(data){
        log.push(data);
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

    function goodKeyPress(now) {

        console.log("pressed P");


        if (gameModel.getFishVisible()) {
            gameModel.killFish();


            if (gameModel.isGoodFish()) {
                gameModel.logKeyPress('good', 'P', now);
                gameView.playGood(now);
            } else {
                gameModel.logKeyPress('bad', 'P', now);
                gameView.playBad(now);
            }
        }

        gameModel.goodKeyPress();

    }

    function badKeyPress(now) {
        console.log("pressed L");


        if (gameModel.getFishVisible()) {
            gameModel.killFish();

            if (gameModel.isGoodFish()) {
                gameModel.logKeyPress('good', 'L', now);
                gameView.playBad();
            } else {
                gameModel.logKeyPress('bad', 'L', now);
                gameView.playGood();
            }
        }
        gameModel.badKeyPress();

    }
    
    function endGame(){
        var logelt = document.getElementById('log');
        logelt.textContent = (JSON.stringify(log));
        showView("log");
        gameLoop.stop();
    }
    
    function runVisual(){
        showView("game");
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
        badKeyPress:badKeyPress,
        goodKeyPress:goodKeyPress,
        start:start,
        runVisual:runVisual,
        pushLog:pushLog,
        endGame:endGame
    })

}())
