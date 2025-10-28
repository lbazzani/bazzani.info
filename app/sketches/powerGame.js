
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

let maxBallPower=10;
var balls =[];
var totalPower=0;
var nunBalls;
var raggio;
var correctv=0;
var resetTimer=1000;
var maxBalls;
var cnvWidth;
var cnvHeight;
var scaleWidth = bfsetting.canvasScaleWidth;
var scaleHeight = bfsetting.canvasScaleHeight;


export const powerGame = (p5) => {
    p5.setup = () => {
      // Reset delle variabili globali
      cnv = null;
      balls = [];
      nunBalls = 0;
      totalPower = 0;
      resetTimer = 1000;
      correctv = 0;

      cnvHeight=p5.round(window.innerHeight*scaleHeight);
      cnvWidth=p5.round(window.innerWidth*scaleWidth);
      cnv=p5.createCanvas(cnvWidth, cnvHeight);

      // Inizializza le balls
      resetBalls();
    };
      
    
    p5.draw = () => {
        if(nunBalls===0 || balls.length===0){
            resetBalls();
        }
        if(nunBalls===1){
            if(resetTimer===0) {
                resetTimer=1000;
                resetBalls();
            }
            (resetTimer>0) && (resetTimer--)
        }
        p5.background(0);
        var sumTotalPower=0;
        var leaderPower=0;
        var leaderIndex=0;
        try {
                for(var i=0; i<balls.length; i++){
                if(!balls[i].expoled){
                    balls[i].drow(p5);
                    balls[i].collide(p5);
                    var ballPower=Math.abs(balls[i].vx)+Math.abs(balls[i].vy);
                    if(!balls[i].inexplosion) {
                        sumTotalPower+=ballPower;
                        if(ballPower>leaderPower) {
                            leaderPower=ballPower; 
                            leaderIndex=i;
                        }
                    }
                    balls[i].isLeader=false;
                }
            }
            balls[leaderIndex].isLeader=true;
            totalPower=sumTotalPower;
        } catch (error) {
            //errore possibile in caso di reset
        }

        //correggo il rimblzo in base al totalPower
        correctv = nunBalls*maxBallPower/Math.max(totalPower,1) * (1+(1/nunBalls));


        p5.noStroke();
        //p5.line(cnvWidth/2, cnvHeight-10, balls[leaderIndex].x, balls[leaderIndex].y);
        if(nunBalls===1){
            p5.textSize(24);
            p5.text("There is a winner !!!!!!!!!!!!!!!!!!" , 2, cnvHeight/2); 
            p5.text("Reset Counter: " + resetTimer, 2, cnvHeight -10 );
        } else {
            p5.textSize(12);
            p5.text("Balls: " + nunBalls, 2, cnvHeight -40 );
            p5.text("Total Power: " + parseInt(totalPower/(nunBalls*maxBallPower)*100) +"%", 2, cnvHeight -25); 
            p5.text("Bounce Control: " + parseInt(correctv*100)/100, 2, cnvHeight -10 );
            p5.text("Clik to add a Ball", cnvWidth-100, cnvHeight -10 );
        }
    };

    p5.mousePressed = () => {
      if(p5.mouseY>0 && p5.mouseY<cnvHeight){
        addBall(p5.mouseX, p5.mouseY);
        nunBalls ++;
        return false;
      }
    }

    p5.touchStarted = () => {
      if(p5.mouseY>0 && p5.mouseY<cnvHeight){
        addBall(p5.mouseX, p5.mouseY);
        nunBalls ++;
        return false;
      }
    }

    p5.windowResized = () => {
        cnvWidth=p5.windowWidth*scaleWidth;
        cnvHeight=p5.windowHeight*scaleHeight;
        cnv=(!cnv)?(p5.createCanvas(cnvWidth, cnvHeight)):(p5.resizeCanvas(cnvWidth, cnvHeight))    
    }


};

const resetBalls =() => {
    nunBalls = getRandomInt(2,maxBalls=200);
    console.log(nunBalls);
    raggio=Math.max(parseInt(Math.min(cnvHeight,cnvWidth)/ Math.sqrt(nunBalls)/4),10);
    //raggio=parseInt(Math.max(Math.min(cnvHeight*cnvWidth/nunBalls/4,cnvHeight/10)));
    balls=[];
    for(var i=0; i<nunBalls; i++){
        addBall(getRandomInt(raggio,cnvWidth-raggio),getRandomInt(raggio,cnvHeight-raggio));
    } 
}

const addBall =(x,y) => {
    balls.push(new Ball(x,y,getRandomInt(-3,3),getRandomInt(-3,3),raggio,getRandomInt(255),getRandomInt(255),getRandomInt(255),balls.length+1));
}

class Ball {
    constructor(x,y,vx,vy,raggio,r,g,b,id) {
      this.x = x;
      this.y = y;
      this.vx=vx;
      this.vy=vy;
      this.raggio=raggio;
      this.r=r;
      this.g=g;
      this.b=b;
      this.id=id;
      this.collided=false;
      this.inexplosion=false;
      this.expoled=false;
      this.isLeader=false;
    }
    collide(p5) {
      for (let i = 0; i < balls.length; i++) { 
        balls[i].collided = false 
      }
      for (let i = 0; i < balls.length; i++) {
        let other=balls[i];
        //if(this.id!==other.id && !this.collided && !other.collided && !this.inexplosion && !other.inexplosion){
        if(this.id!==other.id && !this.inexplosion && !other.inexplosion){
          let dx = other.x - this.x;
          let dy = other.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          let minDist = other.raggio + this.raggio;
          if (distance < minDist) {
            other.collided=true;
            this.collided=true;
            let angle = Math.atan2(dy, dx);
            let targetX = this.x + Math.cos(angle) * minDist;
            let targetY = this.y + Math.sin(angle) * minDist;
            let ax = (targetX - other.x)*correctv;
            let ay = (targetY - other.y)*correctv;
            this.vx -= ax;
            this.vy -= ay;
            other.vx += ax;
            other.vy += ay;
          }
        }
      }
    }
    drow(p5){
      if(!this.inexplosion && this.vx+this.vy > maxBallPower && this.collided){
        this.inexplosion=true
        nunBalls--;
      }

      if(this.inexplosion){
        this.raggio-=0.1;
        this.vx*=0.9;
        this.vy*=0.9;
        this.r*=0.9;
        this.g*=0.9;
        this.b*=0.9;
        ((this.vx+this.vy)<=0.2 || this.raggio < 0.1) && (this.expoled=true);
      }

      
      p5.noStroke();
      p5.fill(this.r,this.g,this.b);
      p5.ellipse(this.x, this.y, this.raggio*2, this.raggio*2);

      p5.fill(255);
      if(this.isLeader){
        p5.triangle(this.x-this.raggio/2, this.y-this.raggio/4, this.x+this.raggio/2, this.y-this.raggio/4, this.x,this.y-this.raggio/2-this.raggio/4);
      }

      p5.strokeWeight(3);
      var cg=Math.max(this.vx+this.vy,1)/maxBallPower;
      p5.stroke(255,255-255*cg,255*-255*cg);
      p5.line(this.x, this.y, this.x+ this.vx*this.raggio/3, this.y+this.vy*this.raggio/3);

      
      (this.x>=p5.width-this.raggio||this.x<=0+this.raggio) && (this.vx=-this.vx*correctv);
      (this.y>=p5.height-this.raggio||this.y<=0+this.raggio) && (this.vy=-this.vy*correctv);
      if(totalPower<nunBalls*100){
        if(!this.inexplosion){
          this.x+=this.vx;
          this.y+=this.vy;
          //tengo dentro i bordi
          this.x = Math.min(Math.max((this.x), this.raggio), cnvWidth-this.raggio);
          this.y = Math.min(Math.max((this.y), this.raggio), cnvHeight-this.raggio);
        }
      }
      else{
        resetBalls();
      }
    }
}
 
