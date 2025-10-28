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

var crazyCit =[
    {
        text:"I\'m crazy like a clock", author:"I\'s me, The clock"
    },
    {
        text:"Taking crazy things seriously is a serious waste of time.", author:"Haruki Murakami, Kafka on the Shore"
    },
    {
        text:"A question that sometimes drives me hazy: am I or are the others crazy?", author:"Albert Einstein"
    },
    {
        text:"Being crazy isn\'t enough.", author:"Dr. Seuss"
    },
    {
        text:"When you are crazy you learn to keep quiet.", author:"Philip K. Dick, VALIS"
    },
    {
        text:"Where to look if you've lost your mind?", author:"Bernard Malamud, The Fixer"
    },
    {
        text:"But you are crazy.", author:"You know?"
    },
    {
        text:"Happiness is not the absence of problems, it’s the ability to deal with them.", author:"Steve Maraboli"
    },
    {
        text:"Happiness is not being pained in body or troubled in mind.", author:"Thomas Jefferson"
    },
    {
        text:"The secret of happiness is to find a congenial monotony.", author:"V.S. Pritchett"
    },
    {
        text:"There is only one happiness in this life, to love and be loved.", author:"George Sand"
    },
    {
        text:"Happiness is not an ideal of reason, but of imagination.", author:"Immanuel Kant"
    },
    {
        text:"To be without some of the things you want is an indispensable part of happiness.", author:"Bertrand Russell"
    },
    {
        text:"The secret of happiness is freedom, the secret of freedom is courage.", author:"Carrie Jones"
    },
    {
        text:"It is not how much we have, but how much we enjoy, that makes happiness.", author:"Charles Spurgeon"
    },
    {
        text:"The only way to find true happiness is to risk being completely cut open.", author:"Chuck Palahniuk"
    },
    {
        text:"Nobody really cares if you’re miserable, so you might as well be happy.", author:"Cynthia Nelms"
    },
    {
        text:"Happiness is not something ready made. It comes from your own actions.", author:"Dalai Lama"
    },
    {
        text:"I think the key to life is just being a happy person, and happiness will bring you success.", author:"Diego Val"
    },
    {
        text:"Happiness is the interval between periods of unhappiness.", author:"Don Marquis"
    },
    {
        text:"The world is full of people looking for spectacular happiness while they snub contentment.", author:"Doug Larson"
    },
    {
        text:"Happiness grows at our own firesides, and is not to be picked in strangers’ gardens.", author:"Douglas Jerrold"
    },
    {
        text:"Happiness is always the serendipitous result of looking for something else.", author:"Dr. Idel Dreimer"
    },
    {
        text:"The search for happiness is one of the chief sources of unhappiness.", author:"Eric Hoffer"
    },
    {
        text:"Happiness lies in the joy of achievement and the thrill of creative effort.", author:"Frederick Keonig"
    },
    {
        text:"There can be no happiness if the things we believe in are different from the things we do.", author:"Freya Stark"
    },
    {
        text:"Happiness is having a large, loving, caring, close-knit family in another city.", author:"George Burns"
    },
    {
        text:"Happiness is a by-product of an effort to make someone else happy.", author:"Gretta Brooker Palmer"
    },
    {
        text:"Cheerfulness is what greases the axles of the world. Don’t go through life creaking.", author:"H.W. Byles"
    },
    {
        text:"All happiness depends on courage and work.", author:"Honoré de Balzac"
    },
    {
        text:"Now and then it’s good to pause in our pursuit of happiness and just be happy.", author:"Guillaume Apollinaire"
    },
    {
        text:"Happiness is distraction from the human tragedy.", author:"J.M. Reinoso"
    },
    {
        text:"Real happiness is cheap enough, yet how dearly we pay for its counterfeit.", author:"Hosea Ballou"
    },
    {
        text:"The foolish man seeks happiness in the distance, the wise grows it under his feet.", author:"James Oppenheim"
    },
    {
        text:"I must learn to be content with being happier than I deserve.", author:"Jane Austen, Pride and Prejudice"
    },
    {
        text:"Ask yourself whether you are happy and you cease to be so.", author:"John Stuart Mill"
    },
    {
        text:"You cannot protect yourself from sadness without protecting yourself from happiness.", author:"Jonathan Safran Foer"
    },
    {
        text:"You can’t be happy unless you’re unhappy sometimes.", author:"Lauren Oliver"
    },
    {
        text:"He who lives in harmony with himself lives in harmony with the universe.", author:"Marcus Aurelius"
    },
    {
        text:"The happiness of your life depends upon the quality of your thoughts.", author:"Marcus Aurelius"
    },
    {
        text:"Happiness is not a state to arrive at, but a manner of traveling.", author:"Margaret Lee Runbeck"
    },
    {
        text:"Happiness is when what you think, what you say, and what you do are in harmony.", author:"Mahatma Gandhi"
    },
    {
        text:"Happiness is a well-balanced combination of love, labour, and luck.", author:"Mary Wilson Little"
    },
    {
        text:"Happiness is a dry martini and a good woman. Or a bad woman.", author:"George Burns"
    },
    {
        text:"Happiness is holding someone in your arms and knowing you hold the whole world.", author:"Orhan Pamuk"
    },
    {
        text:"Happiness is an accident of nature, a beautiful and flawless aberration.", author:"Pat Conroy"
    },
    {
        text:"It’s the moments that I stopped just to be, rather than do, that have given me true happiness.", author:"Sir Richard Branson"
    },
    {
        text:"Most people would rather be certain they’re miserable, than risk being happy.", author:"Robert Anthony"
    },
    {
        text:"Don’t waste your time in anger, regrets, worries, and grudges. Life is too short to be unhappy.", author:"Roy T. Bennett"
    },
    {
        text:"Love is that condition in which the happiness of another person is essential to your own.", author:"Robert A. Heinlein"
    },
    {
        text:"Happiness is a conscious choice, not an automatic response.", author:"Mildred Barthel"
    },
    {
        text:"Learn to value yourself, which means: fight for your happiness.", author:"Ayn Rand"
    },
    {
        text:"People should find happiness in the little things, like family.", author:"Amanda Bynes"
    },
    {
        text:"If only we’d stop trying to be happy we could have a pretty good time.", author:"Edith Wharton"
    },
    {
        text:"Happiness is the meaning and the purpose of life, the whole aim and end of human existence.", author:"Aristotle"
    },
    {
        text:"Happiness makes up in height for what it lacks in length.", author:"Robert Frost"
    },
    {
        text:"Happiness lies in the joy of achievement and the thrill of creative effort.", author:"Franklin D. Roosevelt"
    },
    {
        text:"If you are not happy here and now, you never will be.", author:"Taisen Deshimaru"
    },
    {
        text:"We all live with the objective of being happy; our lives are all different and yet the same.", author:"Anne Frank"
    },
    {
        text:"I have only two kinds of days: happy and hysterically happy.", author:"Allen J. Lefferdink"
    },
    {
        text:"Be happy with what you have. Be excited about what you want.", author:"Alan Cohen"
    },
    {
        text:"The best way to cheer yourself up is to try to cheer somebody else up.", author:"Mark Twain"
    },
    {
        text:"A truly happy person is one who can enjoy the scenery while on a detour.", author:"Unknown"
    },
    {
        text:"We are no longer happy so soon as we wish to be happier.", author:"Walter Savage Landor"
    }
]

var cnv;

var cnvWidth;
var cnvHeight;
var scaleWidth = bfsetting.canvasScaleWidth;
var scaleHeight = bfsetting.canvasScaleHeight;
var sceneStartSec=-1;
var sceneFrame=0;
var sceneDuration=10; //sec
var frameRate=20;

var videoWriter;
var captured=false;

var w=null;
var s=null;

export const simpleClock = (p5) => {
    p5.setup = () => {
        // Reset delle variabili globali
        cnv = null;
        w = null;
        s = null;
        sceneStartSec = -1;
        sceneFrame = 0;

        if(bfsetting.enableVideoSaving){
            cnvHeight=500;
            cnvWidth=500;
        }
        else{
            cnvHeight=p5.round(window.innerHeight*scaleHeight);
            cnvWidth=p5.round(window.innerWidth*scaleWidth);
        }

        cnv=p5.createCanvas(cnvWidth, cnvHeight);
        p5.frameRate(frameRate);

        if(bfsetting.enableVideoSaving){
            videoWriter = new window.WebMWriter({
                quality: 0.95,    // WebM image quality from 0.0 (worst) to 0.99999 (best), 1.00 (VP8L lossless) is not supported
                fileWriter: null, // FileWriter in order to stream to a file instead of buffering to memory (optional)
                fd: null,         // Node.js file handle to write to instead of buffering to memory (optional)
            
                // You must supply one of:
                frameDuration: 1000/frameRate, // Duration of frames in milliseconds
                frameRate: null,     // Number of frames per second
            
                transparent: false,      // True if an alpha channel should be included in the video
                alphaQuality: undefined, // Allows you to set the quality level of the alpha channel separately.
                                        // If not specified this defaults to the same value as `quality`.
            });
        }
        w=null;
        s=null;
        sceneStartSec=-1;
    };
      
    
    p5.draw = () => {
        p5.background(100);
        const radius=Math.min(cnvWidth,cnvHeight)*0.9/2;
        (!w) && (w= new Watch(cnvWidth/2,cnvHeight/2,radius));
        w.drow(p5);
        
        if((sceneStartSec==-1) || ((p5.second()-sceneStartSec)%sceneDuration==0 && sceneStartSec!=p5.second())) {
            s = new Scene(cnvWidth/2,cnvHeight/2,radius)
            sceneStartSec=p5.second();
            sceneFrame=0;
            console.log("new scene at " + sceneStartSec);
        }
        s && s.drow(p5);
    };

    p5.mousePressed = () => {
        
    }

    p5.windowResized = () => {
        cnvWidth=p5.windowWidth*scaleWidth;
        cnvHeight=p5.windowHeight*scaleHeight;
        w=null;
        s=null;
        cnv=(!cnv)?(p5.createCanvas(cnvWidth, cnvHeight)):(p5.resizeCanvas(cnvWidth, cnvHeight))   
    }
  


};

class Scene {
    constructor(x,y,radius) {
        this.x = x;
        this.y = y;
        this.radius=radius;
        this.current=0;
        this.cit=crazyCit[getRandomInt(0,crazyCit.length-1)];
        this.rnd1=getRandomInt(40,100)/100;
        this.rnd2=getRandomInt(10,100)/100;
        this.rnd3=getRandomInt(10,100)/100;
        this.rnd4=getRandomInt(10,100)/100;
        this.rnd5=getRandomInt(10,100)/100;
    } 

    drow(p5) {
        p5.push();
        p5.translate(this.x,this.y);
        const s=cnvWidth*0.9;
        var scale=1/(frameRate*(sceneDuration)) * sceneFrame;
        var scaleSin=p5.sin(scale*p5.PI);
        //var bouncing=Math.abs(Math.sin(p5.millis() / 1000)*Math.cos(p5.millis() / 1000))+0.8;
        

        p5.fill(255*this.rnd2*scaleSin,50*this.rnd2*scaleSin,80*this.rnd2*scaleSin,120*scaleSin);
        p5.noStroke();
        p5.beginShape();
        var borderDist=s*0.3*scaleSin*this.rnd1;
        var hDist=Math.abs(s*0.1 *(scaleSin*this.rnd1));
        var xs=0;
        var ys=this.radius*0.8*this.rnd4;
        p5.vertex(xs-borderDist, ys);
        p5.bezierVertex(xs-borderDist/2,ys-(hDist*this.rnd2), xs+borderDist/2,ys-(hDist*this.rnd3),  xs+borderDist,ys);
        p5.bezierVertex(xs+borderDist/2,ys+(hDist*this.rnd4), xs-borderDist/2,ys+(hDist*this.rnd5), xs-borderDist, ys);
        p5.endShape('close');
        p5.ellipse(-ys,-ys, hDist*2*scaleSin*this.rnd2, hDist*2*scaleSin*this.rnd3);
        p5.ellipse(ys,-ys, hDist*2*scaleSin*this.rnd4, hDist*2*scaleSin*this.rnd5);
        //p5.line(-borderDist,ys,+borderDist,ys);

        p5.noStroke();
        p5.fill(255,255*scaleSin);

        var t1=this.cit.text;
        var t2=this.cit.author;
        
        var ts= s/t1.length*2 ;
        if(p5.windowWidth>=768) {ts=ts* scaleSin+1}

        p5.textFont('Georgia');
        p5.textSize(ts);
        p5.text(t1,-p5.textWidth(t1)/2, -(30) );
        p5.text(t2,-p5.textWidth(t2)/2, 30 );
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

class Watch {
    constructor(x,y,radius) {
        this.x = x;
        this.y = y;
        this.radius=radius;
    }
    drow(p5) {

        const s = p5.map(p5.second() , 0, 60, 0, p5.TWO_PI) - p5.HALF_PI;
        const m = p5.map(p5.minute() + p5.norm(p5.second(), 0, 60), 0, 60, 0, p5.TWO_PI) - p5.HALF_PI;
        const h = p5.map(p5.hour() + p5.norm(p5.minute(), 0, 60), 0, 24, 0, p5.TWO_PI * 2) - p5.HALF_PI;

        const secondsRadius=this.radius;
        const minutesRadius=this.radius*0.8;
        const hoursRadius=minutesRadius*0.8;
        p5.push();
        p5.translate(this.x,this.y);

        p5.strokeWeight(1);
        p5.stroke(200,0,0,200);
        p5.line(0,0,p5.cos(s)*secondsRadius,p5.sin(s)*secondsRadius );

        p5.stroke(0);
        p5.strokeWeight(3);
        p5.line(0,0,p5.cos(m)*minutesRadius,p5.sin(m)*minutesRadius );

        p5.strokeWeight(6);
        p5.line(0,0,p5.cos(h)*hoursRadius,p5.sin(h)*hoursRadius );

        //p5.fill(0, 102, 153);
        //p5.text(p5.hour()+ ":" + p5.minute()+ ":" + p5.second(), -this.secondsRadius/2, this.secondsRadius+20 );

        p5.strokeWeight(2);
        p5.beginShape(p5.POINTS);
        for (let a = 0; a < 360; a += 6) {
          let angle = p5.radians(a);
          let x = p5.cos(angle) * secondsRadius;
          let y = p5.sin(angle) * secondsRadius;
          p5.vertex(x, y);
        }
        p5.endShape();
        p5.pop();

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
 
