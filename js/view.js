/**
this object has an update method which draws the current model onto the canvas
**/

var gameView = (function(){
        debugPrint("creating gameView");
    
    var canvas = document.getElementById('canvas'),
        cw = canvas.width,
        ch = canvas.height,
        cx = null;


    var img1 = new Image();
    img1.src = 'images/stream.jpg';
    
    var imgFishL = new Image();
    imgFishL.src = 'images/fish/fishL.png';
    
    var imgFishR = new Image();
    imgFishR.src = 'images/fish/fishR.png';

    
    var audioFastFish = new Audio('sounds/8hz/fish.wav'); //document.getElementById('fastFish');
    audioFastFish.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
    }, false);
    //audioFastFish.loop = true;
    //audioFastFish.play();
    
    var fishSound = audioFastFish;
    
    
    var audioGood = new Audio('sounds/good.wav'); 
    var audioBad = new Audio('sounds/bad.wav'); 
    
    var soundFast = new Audio('sounds/8hz/fish.wav'); 
    var soundSlow = new Audio('sounds/5hz/fish.wav'); 
    
    function playGood(){
        audioGood.play();
    }
    
    function playBad(){
        audioBad.play();
    }
    
    function playFishAudio(){
        fishSound = (gameModel.getFishAudio()=='fast')?soundFast:soundSlow;
        fishSound.play();
    }
    
    function stopFishAudio(){
        fishSound.pause();
        fishSound.currentTime=0;
    }


    function update(now){


        drawBackground2(img1); // draw the background flowing by in a seamless way...
        debugPrint(gameModel.getFishVisible());
        var hz = (gameModel.getFishVisual()=='fast')?8:5;
        if (gameModel.getFishVisible()){
            drawFish(imgFishL,hz);
        }
        
    }
    

   

function drawFish(img,hz){
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var cw = canvas.width;
    var ch = canvas.height;
    var fishPos = gameModel.getFishPos();
    var w = cw/5;
    var h = w*img.height/img.width;
    var sec = ((new Date()).getTime() % 1000)/1000.0;
    var scale = 1+(1-Math.cos(Math.PI*2*hz*sec))/2*1.0;
    var fishImage = (gameModel.getFishSide()=='left')?imgFishL:imgFishR;
    var hscale = (gameModel.getFishSide()=='left')?1:-1;
    
    //debugPrint("in drawFish:"+JSON.stringify([fishImage==imgFishL, fishImage==imgFishR,fishPos]));

    ctx.save();
    ctx.translate((fishPos[0])*cw/100,(fishPos[1])*ch/100);
    ctx.scale(hscale,scale);
    ctx.drawImage(img,-w/2,-h/2,w,h);
    ctx.restore();
    

    //ctx.drawImage(img,(fishPos[0])*cw/100-w/2,(fishPos[1])*ch/100-h/2,w,h);
}

/*
to draw a vertically flipped image whose upper-left corner is at position (x,y) and whose dimensions are (w,h) and offset is (x',y')
on a canvas of dimension (W,H)
one can flip the canvas vertically, then translate y'+h from the bottom and draw the image ...
*/

    /* this version tries to use CSS but it needs the image to be handled by CSS too */
    function drawBackground1(img) {
        var canvas = document.getElementById('canvas');
        var yValue = gameModel.getImageOffset()*5;
        document.getElementById('canvas').style.backgroundPosition = '0px ' + yValue + 'px';
        
    }

    /* this image draws the background using the canvas API */
    function drawBackground2(img) {
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');
        var cw = canvas.width;
        var ch = canvas.height;
        var yoff = gameModel.getImageOffset();

        drawFlippedImage(img,0,yoff*ch/100   ,cw,ch);
        if (yoff > 100)
          yoff -= 200;
        ctx.drawImage(img,0,yoff*ch/100,cw,ch);
 
    }
    
    function drawFlippedImage(img,xoff,yoff,w,h){
        var ctx = document.getElementById('canvas').getContext('2d');

        ctx.save();
        ctx.scale(1,-1);
        ctx.drawImage(img,0,-yoff,w,h);
        ctx.restore();
    }
    
    return({
        update: update,
        playGood: playGood,
        playBad: playBad,
        playFishAudio: playFishAudio,
        stopFishAudio: stopFishAudio
    })
}())