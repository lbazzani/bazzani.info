
import bfsetting from  './bfsettings';

export const  getRandomInt =  (min, max) => {
  if(!max) { //gestione parametro opzionale
    max=min;
    min=0;
  }
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


export let cnv=null;