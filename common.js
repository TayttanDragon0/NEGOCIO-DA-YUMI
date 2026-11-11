export const $=id=>document.getElementById(id);
export const uid=()=>crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)+Date.now();
export const roomId=()=>Math.random().toString(36).slice(2,8).toUpperCase();
export function blankState(){return {active:"scene-1",assets:[],characters:[],scenes:[{id:"scene-1",name:"Cena Principal",background:"",tokens:[]}]};}
export const currentScene=s=>s.scenes.find(x=>x.id===s.active)||s.scenes[0];
