
import moment from 'moment';
import p5 from 'p5';
import bfsetting from  './bfsettings';

//import {cnv, cnvWidth, cnvHeight, scaleWidth, scaleHeight, getRandomInt} from './basesk'

import {getRandomInt} from './basesk'


var cnv;
var cnvWidth;
var cnvHeight;
var scaleWidth = bfsetting.canvasScaleWidth;
var scaleHeight = bfsetting.canvasScaleHeight;


var sceneFrame=-1;
//var sceneDuration=bfsetting.enableVideoSaving?1:10; //sec
var frameRate=60;

var birds=[];
var birdsCount=10000;
var points;
var cross=true;

var singleMode=true;
var globalMode=1;
var numModes=4;

var videoWriter;

var saveMode=false;




var s=null;


const init = (p5) => {
    // Reset variabili globali
    cnv = null;
    birds = [];
    points = null;
    s = null;
    sceneFrame = -1;

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

    cross=getRandomInt(0,1);
    singleMode=getRandomInt(0,1);
    globalMode=getRandomInt(1,numModes);

    //forced
    //singleMode=1;
    //globalMode=4;

    birdsCount=Math.round((cnvWidth*cnvHeight)/(getRandomInt(100,1000)));

    birds=[];
    for(var i=0; i< birdsCount; i++){
        birds.push(new Bird())
    }
    points = [...Array(cnvWidth)].map(item => Array(cnvHeight).fill(0));

    cnv=p5.createCanvas(cnvWidth, cnvHeight);
    p5.frameRate(frameRate);
}

export const circleart = (p5) => {    
    p5.setup = () => {

        init(p5);
    };
      
    
    p5.draw = () => {
        if(sceneFrame==-1){ //|| sceneFrame==sceneDuration*frameRate) {
            p5.background(getRandomInt(10,50),getRandomInt(100,200));

            s= new Scene();
        }
        s && s.drow(p5);

        var drowed=0;
        var stopat=birds.length*getRandomInt(5,20)/100;

        if(saveMode){
            p5.background(getRandomInt(10,50),getRandomInt(100,200));
            p5.noLoop();
            console.log("savemode");
            drowed=stopat+1;
            while(drowed>stopat){
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
            p5.save("CicleArt_"+birdsCount+"_"+singleMode+"_"+globalMode);
            console.log("saved");
            setTimeout(()=>{
                init(p5);
                p5.loop();
            }, 10000);   
        } else {
            if(drowed<stopat){
                p5.text("Click the image to repaint", 10, 10 );
                p5.noLoop();
            }
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
        this.radius=Math.min(cnvWidth,cnvHeight)/getRandomInt(20,100);
        this.angle=getRandomInt(0,Math.PI*200)/100;
        this.direction=getRandomInt(0,1)?-1:1;
        this.step=this.radius/getRandomInt(0.001,0.9);
        this.mode=(singleMode)?globalMode:getRandomInt(1,numModes);
        this.ellipseRadious1=getRandomInt(1,4);
        this.ellipseRadious2=getRandomInt(1,4);
        this.x=getRandomInt(1,cnvWidth-1);
        this.y=getRandomInt(1,cnvHeight-1);
        this.x1=null;
        this.y1=null;
        this.dx=getRandomInt(0,1)?-1:1;
        this.dy=getRandomInt(0,1)?-1:1;
        this.r=getRandomInt(40,255);
        this.g=getRandomInt(10,255);
        this.b=getRandomInt(10,255);
        this.h=getRandomInt(10,255);

    } 
    drow(p5){
        //var step=(2*p5.PI)/this.radius;
        //var step=getRandomInt
        var na=this.angle+(this.direction*this.step);
        var nx=this.x+p5.round(this.radius*p5.cos(na));
        var ny=this.y+p5.round(this.radius*p5.sin(na));


        if(cross && this.mode==1){
            if(nx>=cnvWidth) 
                {nx=nx-cnvWidth}
            if(nx<=0) 
                {nx=cnvWidth-nx}
            if(ny>=cnvHeight) 
                {ny=ny-cnvHeight}
            if(ny<=0) 
                {ny=cnvWidth-ny}
        }
        
        var drowed=0;
        if(nx>0 && nx<cnvWidth && ny>0 && ny<cnvHeight && points[nx][ny]==0){
            this.angle=na;
            p5.stroke(this.r,this.g,this.b,this.h);
            
            switch (this.mode) {
                case 1: //point
                    p5.point(nx,ny);
                    break;
                case 2: //line
                    p5.line(this.x,this.y,nx,ny);
                    break;
                case 3: //ellipse
                    p5.noStroke();
                    p5.fill(this.r,this.g,this.b,this.h);
                    p5.ellipse(nx,ny,2,this.ellipseRadious1,this.ellipseRadious2);
                    break;
                case 4: //geometric
                    if(this.x1 && this.y1){
                        p5.line(this.x1,this.y1,nx,ny);
                    }
                    this.x1=nx;
                    this.y1=ny;
  
                    break;
                default:
                    break;
            }
            
            points[nx][ny]=1;
            drowed++;
        } else {
            this.direction=getRandomInt(0,1)?-1:1;
            this.radius=this.radius+this.direction;

            (this.h>10 && this.h<255 ) && (this.h=this.h+this.direction);
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


