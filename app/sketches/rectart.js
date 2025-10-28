
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


var cnvWidth;
var cnvHeight;
var scaleWidth = bfsetting.canvasScaleWidth;
var scaleHeight = bfsetting.canvasScaleHeight;
var sceneFrame=-1;
var sceneDuration=bfsetting.enableVideoSaving?1:10; //sec
var frameRate=60;

var birds=[];
var birdsCount=10000;
var points;
var cross=true;

var videoWriter;

var saveMode=false;




var s=null;


const init = (p5) => {
    // Reset variabili globali
    birds = [];
    points = null;
    s = null;
    sceneFrame = -1;

    if(bfsetting.enableVideoSaving){
        cnvHeight=500;
        cnvWidth=500;
    }
    else{
        cnvHeight=p5.round(p5.windowHeight*scaleHeight);
        cnvWidth=p5.round(p5.windowWidth*scaleWidth);
    }

    if(saveMode){
        cnvHeight= p5.displayHeight;
        cnvWidth= p5.displayWidth;
    }

    cross=getRandomInt(0,1);

    birdsCount=Math.round((cnvWidth*cnvHeight)/(getRandomInt(100,1000)));

    birds=[];
    for(var i=0; i< birdsCount; i++){
        birds.push(new Bird())
    }
    points = [...Array(cnvWidth)].map(item => Array(cnvHeight).fill(0));
    p5.createCanvas(cnvWidth, cnvHeight);
}

export const rectart = (p5) => {    
    p5.setup = () => {
        init(p5);
        p5.frameRate(frameRate);
    };
      
    
    p5.draw = () => {
        if(sceneFrame==-1){ //|| sceneFrame==sceneDuration*frameRate) {
            p5.background(getRandomInt(10,50),getRandomInt(100,200));

            s= new Scene();
        }
        s && s.drow(p5);

        var drowed=0;

        
        if(saveMode){
            p5.background(getRandomInt(10,50),getRandomInt(100,200));
            p5.noLoop();
            console.log("savemode");
            drowed=1;
            while(drowed){
                drowed=0;
                for(var i=0; i< birdsCount; i++){
                    drowed+=birds[i].drow(p5);
                }
                //console.log("drowed: " + drowed);
            }
        } else {
            for(var i=0; i< birdsCount; i++){
                drowed+=birds[i].drow(p5);
            }
        }
        
        p5.noStroke();
        p5.fill(255,255);
        p5.textSize(12);
        p5.text("@bazzani", cnvWidth-80, cnvHeight-10 );

        if(saveMode){
            p5.save("TecnoCity_"+birdsCount);
            console.log("saved");
            setTimeout(()=>{
                init(p5);
                p5.loop();
            }, 10000);   
        } else {
            if(drowed==0){
                p5.noLoop();
                setTimeout(()=>{
                    init(p5);
                    p5.loop();
                }, 10000);   
            }
        }

        
    };


    p5.windowResized = () => {
        init(p5);   
    }
  
};

class Bird {
    constructor() {
        this.x=getRandomInt(1,cnvWidth-1);
        this.y=getRandomInt(1,cnvHeight-1);
        this.dx=getRandomInt(-1,1);
        this.dy=getRandomInt(-1,1);
        this.r=getRandomInt(40,255);
        this.g=getRandomInt(10,255);
        this.b=getRandomInt(10,255);
        this.h=getRandomInt(200,255);

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
        if(nx!=0 && nx!=cnvWidth && ny!=0 && ny!=cnvHeight && !isNear(nx,ny,1)){
            this.x=nx;
            this.y=ny;
            p5.stroke(this.r,this.g,this.b,this.h);
            p5.point(nx,ny);
            points[nx][ny]=1;
            drowed++;
        } else {
            this.dx=getRandomInt(-1,1);
            this.dy=getRandomInt(-1,1);
            //(this.h>10) && this.h--;
        }
        return drowed;
        
    }
}

const isNear=(x,y,d) => {
    for(var xn=x-d;xn!=x+d;xn++){
        for(var yn=y-d;yn!=y+d;yn++){
            if(points[xn][yn]){
                return true;
            }
        }
    }
    return false;
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


