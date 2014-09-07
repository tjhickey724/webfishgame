/*
var vendors = ['webkit', 'moz'];
for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame =
	window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
}
*/

var canvas = document.getElementById('canvas'),
    cw = canvas.width,
    ch = canvas.height,
    cx = null,
    fps = 60,
    bX = 30,
    bY = 30,
    mX = 0.5,
    mY = 0.2,
    interval     =    1000/fps,
    lastTime     =    (new Date()).getTime(),
    currentTime  =    0,
    delta = 0;

function gameLoop() {
    window.requestAnimationFrame(gameLoop);

    currentTime = (new Date()).getTime();
    delta = (currentTime-lastTime);
    //    console.log("time="+currentTime);

    if(delta > interval) {

        //cx.clearRect(0,0,cw,cw);
	drawBackground((currentTime%10000)*0.0001);
        cx.beginPath();
        cx.fillStyle = 'red';
	radius = 20*(1+0.1*Math.sin(0*2*Math.PI*currentTime/1000.0));
        cx.arc(bX, bY, radius, 0, Math.PI * 360);
        cx.fill();
        if(bX >= cw || bX <= 0) { mX*=-1; }
        if(bY >= ch || bY <= 0) { mY*=-1; }

        bX+=mX;
        bY+=mY;

        lastTime = currentTime - (delta % interval);
    }
}

if (typeof (canvas.getContext) !== undefined) {
    cx = canvas.getContext('2d');

    gameLoop();
}

var img1 = new Image();
img1.src = 'images/stream.jpg';

var img2 = new Image();
img2.src = 'images/streamFLIP.jpg';


function drawBackground(dy) {
    var ctx = document.getElementById('canvas').getContext('2d');
    img = img1;

    ctx.save();
    ctx.scale(1,-1);
    ctx.translate(0,-img.height);
    ctx.drawImage(img,0,(1-dy)*img1.height-  img1.height,img1.width,img1.height);
    ctx.drawImage(img,0,(1-dy)*img1.height+  img1.height,img1.width,img1.height);
    ctx.restore();
    ctx.drawImage(img,0,dy*img1.height              ,img1.width,img1.height);
    ctx.drawImage(img,0,dy*img1.height+2*img1.height,img1.width,img1.height);


}

