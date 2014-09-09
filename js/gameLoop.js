var gameLoop = (function(){
    console.log("creating gameLoop");
    
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
        //    console.log("time="+currentTime);

        if(delta > interval) {
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