export const $=x=>document.getElementById(x);
export const uid=()=>Math.random().toString(36).slice(2,10);
export function blankState(){return {assets:[],characters:[],scenes:[{id:"main",name:"Cena Principal",tokens:[]}],active:"main"}}
export function scene(state){return state.scenes.find(x=>x.id===state.active)}
export function roomId(){return Math.random().toString(36).slice(2,8).toUpperCase()+Math.random().toString(36).slice(2,5).toUpperCase()}