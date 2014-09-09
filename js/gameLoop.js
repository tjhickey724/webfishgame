var gameLoop = (function(){
    debugPrint("creating gameLoop");
    
    var lastTime = currentTime();
    var count=0;
    var fps=60;
    var interval = 1000/fps;
    var gameOver=false;
    
    function stopGame(){
        gameOver=true;
    }
    
    
    function gameLoop() {
        if (gameOver) return;
        count++;
        
        window.requestAnimationFrame(gameLoop);

        var now = currentTime();;
        var delta = (now-lastTime);
        lastTime=now;
        //    debugPrint("time="+currentTime);

        if(delta > interval) {
            debugPrint("delta="+ delta);
            gameModel.update(now);
            gameView.update(now);
        }
    }
    
    function currentTime(){
        return( (new Date()).getTime()  );
    }
    
    gameLoopObj = {
        start: gameLoop,
        stop: stopGame
    };
    
    return(gameLoopObj);
} ())