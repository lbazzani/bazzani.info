
import moment from 'moment';
import bfsetting from  './bfsettings';

function getRandomInt(min, max) {
    if(!max) { //gestione parametro opzionale
      max=min;
      min=0;
    }
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var cnv;

var cnvWidth;
var cnvHeight;
var scaleWidth = bfsetting.canvasScaleWidth;
var scaleHeight = bfsetting.canvasScaleHeight;
var sceneFrame=-1;
var frameRate=60;

var birds=[];
var birdsCount=10000;
var points; //array dei punti
var cross=true;

var videoWriter;
var videoWriterRate=8; //ogni quanti frame catturo la videata per il video
var videoSceneNum=8; //registra 8 scene
var captured=false;

var saveMode=false; //salva il png ad ogni cambio
var directionMode=3;
var s=null;

var sceneCount=0;


const init = (p5) => {
    // Reset variabili globali
    cnv = null;
    birds = [];
    points = null;
    s = null;
    sceneFrame = -1;
    sceneCount = 0;

    if(bfsetting.enableVideoSaving){
        cnvHeight=500;
        cnvWidth=500;
    }
    else{
        cnvHeight=p5.round(window.innerHeight*scaleHeight);
        cnvWidth=p5.round(window.innerWidth*scaleWidth);
    }

    if(saveMode){
        cnvHeight= p5.displayHeight;
        cnvWidth= p5.displayWidth;
    }

    if(bfsetting.enableVideoSaving)
    {
        //cnvWidth=1280;
        //cnvHeight=720;

        cnvWidth=1080;
        cnvHeight=1080;
    }

    cross=getRandomInt(0,1);

    directionMode=(bfsetting.enableVideoSaving)?sceneCount%2:getRandomInt(1,3);

    birdsCount=Math.round((cnvWidth*cnvHeight)/(getRandomInt(100,1000)));

    if (directionMode==3) { //full direction
        birdsCount=Math.round(birdsCount/10);
    }

    birds=[];
    for(var i=0; i< birdsCount; i++){
        birds.push(new Bird())
    }
    points = [...Array(cnvWidth)].map(item => Array(cnvHeight).fill(0));

    cnv=p5.createCanvas(cnvWidth, cnvHeight);
    p5.frameRate(frameRate);
}

export const tecnocity = (p5) => {    
    p5.setup = () => {
        init(p5);

        if(bfsetting.enableVideoSaving){
            videoWriter = new window.WebMWriter({
                quality: 0.95,    // WebM image quality from 0.0 (worst) to 0.99999 (best), 1.00 (VP8L lossless) is not supported
                fileWriter: null, // FileWriter in order to stream to a file instead of buffering to memory (optional)
                fd: null,         // Node.js file handle to write to instead of buffering to memory (optional)
            
                // You must supply one of:
                frameDuration: (1000/frameRate)*2, // Duration of frames in milliseconds
                frameRate: null,     // Number of frames per second
            
                transparent: false,      // True if an alpha channel should be included in the video
                alphaQuality: undefined, // Allows you to set the quality level of the alpha channel separately.
                                        // If not specified this defaults to the same value as `quality`.
            });
        }
        
    };
      
    
    p5.draw = () => {
        if(sceneFrame==-1){ //|| sceneFrame==sceneDuration*frameRate) {
            p5.background(getRandomInt(10,50),getRandomInt(100,200));

            s= new Scene();
        }
        s && s.drow(p5);

        var drowed=0;

        var stopAt=(bfsetting.enableVideoSaving)?birds.length/100:0;

        for(var i=0; i< birdsCount; i++){
            drowed+=birds[i].drow(p5);
        }

        p5.noStroke();
        p5.fill(255,255);
        p5.textSize(12);
        p5.text("@bazzani", cnvWidth-80, cnvHeight-10 );

        

        if(bfsetting.enableVideoSaving) {
            if(sceneCount<videoSceneNum){ //
                //var dataurl=document.querySelector('#defaultCanvas0.p5Canvas').toDataURL();
                if(p5.frameCount%videoWriterRate==0 || drowed<=stopAt) { //salvo una scena ogni x 
                    videoWriter.addFrame(document.querySelector('#defaultCanvas0.p5Canvas'));
                    if(drowed<=stopAt){ //l'ultima scena la metto 4 volte volte
                        for(var i=0;i <4; i++){
                            videoWriter.addFrame(document.querySelector('#defaultCanvas0.p5Canvas'));
                        }
                    }
                }
            }
            else{
                if(!captured){
                    captured=true;
                    videoWriter.complete().then(function(webMBlob) {
                        var objUrl=URL.createObjectURL(webMBlob);
                        saveBlob(objUrl,"TecnoCity.webm");
                    });
                }
            }
        }



        if(drowed<=stopAt){
            p5.noLoop();
            if(saveMode){
                p5.save("TecnoCity_"+directionMode+"_"+birdsCount+"_"+cnvWidth+"_"+cnvHeight);
            }
            p5.text("Click the image to repaint", 10, 10 );
        }

        
    };

    p5.touchStarted = () => {
        if(p5.mouseY>0 && p5.mouseY<cnvHeight){
            init(p5);
            p5.loop();
            return false;
        }
      }

    p5.mousePressed = () => {
        console.log("mouse on: " + p5.mouseX + "," + p5.mouseY);
        if(p5.mouseY>0 && p5.mouseY<cnvHeight){
            init(p5);
            p5.loop();
            return false;
        }
    }

    p5.windowResized = () => {
        init(p5);   
    }
  
};

class Bird {
    constructor() {
        this.x=getRandomInt(1,cnvWidth-1);
        this.y=getRandomInt(1,cnvHeight-1);
        this.dx=0;
        this.dy=0;
        this.getDirection();

        this.r=getRandomInt(40,255);
        this.g=getRandomInt(10,255);
        this.b=getRandomInt(10,255);
        this.h=getRandomInt(200,255);

    } 
    getDirection() {
        switch (directionMode) {
            case 1: //oblique
                this.dx=getRandomInt(0,1)?-1:1;
                this.dy=getRandomInt(0,1)?-1:1;
                break;
            case 2: //straight
                var vd=[[0,1],[1,0],[0,-1],[-1,0]];
                var vdi=vd[getRandomInt(0,3)];
                this.dx=vdi[0];
                this.dy=vdi[1];
                break;
            case 3: //full
            var vd=[[0,1],[1,0],[0,-1],[-1,0],[1,1],[1,-1],[-1,-1],[-1,1]];
            var vdi=vd[getRandomInt(0,7)];
            this.dx=vdi[0];
            this.dy=vdi[1];
                break;
            default:
                return getRandomInt(0,1)?-1:1;
        }
    }
    drow(p5){
        var nx=this.x+this.dx;
        var ny=this.y+this.dy;
        if(cross){
            if(nx==cnvWidth) 
                {nx=1}
            if(nx==0) 
                {nx=cnvWidth-1}
            if(ny==cnvHeight) 
                {ny=1}
            if(ny==0) 
                {ny=cnvHeight-1}
        }
        var drowed=0;
        if(nx!=0 && nx!=cnvWidth && ny!=0 && ny!=cnvHeight && points[nx][ny]==0){
            this.x=nx;
            this.y=ny;
            p5.stroke(this.r,this.g,this.b,this.h);
            p5.point(nx,ny);
            points[nx][ny]=1;
            drowed++;
        } else {
            this.getDirection();

            (this.h>10) && (this.h=this.h-0.5);
        }
        return drowed;
        
    }
}

class Scene {
    constructor() {
        this.rnd1=getRandomInt(40,100)/100;
        this.rnd2=getRandomInt(10,100)/100;
        this.rnd3=getRandomInt(10,100)/100;
        this.rnd4=getRandomInt(10,100)/100;
        this.rnd5=getRandomInt(10,100)/100;
    } 



    drow(p5) { 

        //
        sceneFrame++;
    }

}


var saveBlob = (function () {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return function (objUrl, fileName) {
        var url = objUrl;
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());


