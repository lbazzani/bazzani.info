
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
var sceneDuration=bfsetting.enableVideoSaving?1:10; //sec
var frameRate=10;

var videoWriter;
var captured=false;

const hMargin=0.9;
var current_news;
var current_image;
var iW;
var iH;


var s=null;

var news=null;

var server_url="https://news.bazzify.com";

const init = () => {
    var url=server_url + "/topnews.json";
    var request = new XMLHttpRequest();
    console.log(url);
    request.open('GET', url, false);
    request.send(null);
    var data=request.response;
    news=JSON.parse(data);
}

export const topNews = (p5) => {
    p5.setup = () => {
        // Reset variabili globali
        cnv = null;
        s = null;
        current_news = null;
        current_image = null;
        sceneFrame = -1;

        if(bfsetting.enableVideoSaving){
            cnvHeight=500;
            cnvWidth=500;
        }
        else{
            cnvHeight=p5.round(window.innerHeight*scaleHeight);
            cnvWidth=p5.min(window.innerWidth*scaleWidth, cnvHeight);
        }
        init();
        cnv=p5.createCanvas(cnvWidth, cnvHeight);
        p5.frameRate(frameRate);
        if(bfsetting.enableVideoSaving){
            videoWriter = new window.WebMWriter({
                quality: 0.95,    // WebM image quality from 0.0 (worst) to 0.99999 (best), 1.00 (VP8L lossless) is not supported
                fileWriter: null, // FileWriter in order to stream to a file instead of buffering to memory (optional)
                fd: null,         // Node.js file handle to write to instead of buffering to memory (optional)
            
                // You must supply one of:
                frameDuration: 1000/frameRate*2, // Duration of frames in milliseconds
                frameRate: null,     // Number of frames per second
            
                transparent: false,      // True if an alpha channel should be included in the video
                alphaQuality: undefined, // Allows you to set the quality level of the alpha channel separately.
                                        // If not specified this defaults to the same value as `quality`.
            });
        }
    };
      
    
    p5.draw = () => {
        //
        const radius=Math.min(cnvWidth,cnvHeight)*0.9/2;

        if(sceneFrame==-1 || sceneFrame==sceneDuration*frameRate) {
            p5.noLoop();
            if(!news || news.length==0) {init();}
            var index=getRandomInt(0,news.length-1);
            current_news=news[index];
            news.splice(index, 1); //rimuovo la news visualizzata
            p5.loadImage(server_url+current_news.local_image,(imageLoaded) => {
                current_image=imageLoaded;
                s = new Scene();
                sceneFrame=0;
                console.log("new scene at " + p5.minute() + ":" +p5.second());
                p5.loop();
            } );
            return;
        }
        s && s.drow(p5);
    };

    p5.touchStarted = () => {
        if(p5.mouseY>0 && p5.mouseY<cnvHeight){
            p5.isLooping()?p5.noLoop():p5.loop()
            return false;
        }
      }

    p5.mousePressed = () => {
        console.log("mouse on: " + p5.mouseX + "," + p5.mouseY);
        if(p5.mouseY>0 && p5.mouseY<cnvHeight){
            p5.isLooping()?p5.noLoop():p5.loop()
            return false;
        }
    }

    p5.windowResized = () => {
        cnvHeight=p5.windowHeight*scaleHeight;
        cnvWidth=p5.min(p5.windowWidth*scaleWidth, cnvHeight) ;
        cnv=(!cnv)?(p5.createCanvas(cnvWidth, cnvHeight)):(p5.resizeCanvas(cnvWidth, cnvHeight))     
    }
  
};

class Scene {
    constructor() {
        this.rnd1=getRandomInt(40,100)/100;
        this.rnd2=getRandomInt(10,100)/100;
        this.rnd3=getRandomInt(10,100)/100;
        this.rnd4=getRandomInt(10,100)/100;
        this.rnd5=getRandomInt(10,100)/100;
    } 

    preload(p5){
        console.log("preload");
    }

    drow(p5) { 
        iW=current_image.width;
        iH=current_image.height;
        const iScale=iW/iH;
        
        if(iW<cnvWidth || iH<cnvHeight){ //scale up
            iH=cnvHeight*hMargin;
            iW=iH*iScale;
        }
        if(iW>cnvWidth || iH>cnvHeight){ //scale down
            if(iW>cnvWidth){
                iW=cnvWidth;
                iH=iW/iScale;
            }
            if(iH>cnvHeight*hMargin){
                iH=cnvHeight*hMargin;
                iW=iH*iScale;
            }

        }

        p5.push();
        //p5.translate(this.x,this.y);
        const s=cnvWidth*0.9;
        var scale=1/(frameRate*(sceneDuration)) * (sceneFrame+1);
        var scaleSin=p5.sin(scale*p5.PI);

        p5.background(100);
        var niW=iW;
        var niH=iH;
        if (scaleSin >0  && scale < 0.5){
            niW=iW*scaleSin;
            niH=iH*scaleSin;
        }
        //p5.image(current_image, cnvWidth/2-niW/2, cnvHeight*(1-hMargin), niW,niH);
        var iX=cnvWidth/2-iW/2;
        var iY=cnvHeight*(1-hMargin)
        p5.image(current_image, iX, iY, iW,iH);
        p5.fill(180);
        p5.noStroke();
        //p5.rect(cnvWidth/2-niW/2, cnvHeight*(1-hMargin), niW,niH);

    
        var postdate =moment(current_news.postdate).fromNow();
        var domain=current_news.domain + " - " + postdate
        var title=current_news.title;
        var description=current_news.description;
        current_news.article_body && (description+="\n----\n"+current_news.article_body)
        
        var ts= cnvHeight*(1-hMargin)/2.5 ;

        p5.noStroke();
        

        p5.textFont('Georgia');
        p5.fill(180);
        p5.textSize(ts*0.8);
        p5.text(domain,5, ts );

        p5.fill(240);
        p5.textSize(ts);
        var slideTitle=0;
        if(p5.textWidth(title)>cnvWidth){
            slideTitle=(p5.textWidth(title)-cnvWidth+cnvWidth*0.1)*scale;
        }
        p5.text(title,5-slideTitle, ts*2 );

        p5.stroke(255);
        p5.strokeWeight(4);
        p5.line(iX, iY+iH-2 ,(iX+iW)*scale,iY+iH-2);

        //se c'è spazio visualizzo la descrizione
        if(iY+iH+ts*2 < cnvHeight){
            p5.noStroke();
            p5.textSize(ts*0.5);
            p5.textWrap(p5.WORD)
            p5.text(description,5,iY+iH+5,cnvWidth-5,cnvHeight-5)
        }

        p5.pop();

        if(bfsetting.enableVideoSaving) {
            if(p5.frameCount<=60*frameRate){
                //var dataurl=document.querySelector('#defaultCanvas0.p5Canvas').toDataURL();
                videoWriter.addFrame(document.querySelector('#defaultCanvas0.p5Canvas'));
            }
            else{
                if(!captured){
                    captured=true;
                    videoWriter.complete().then(function(webMBlob) {
                        var objUrl=URL.createObjectURL(webMBlob);
                        saveBlob(objUrl,"video.webm");
                    });
                }
            }
        }


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
