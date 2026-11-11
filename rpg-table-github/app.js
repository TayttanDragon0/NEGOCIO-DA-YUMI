const $=x=>document.getElementById(x);
const state={assets:[],characters:[],scenes:[{id:"main",name:"Cena Principal",tokens:[]}],active:"main"};
let selected=null,editing=null;
const uid=()=>Math.random().toString(36).slice(2,10);
const scene=()=>state.scenes.find(x=>x.id===state.active);

function render(){
 $("assets").innerHTML=""; $("characters").innerHTML=""; $("scenes").innerHTML="";
 state.assets.forEach(a=>{let e=document.createElement("div");e.className="item";e.draggable=true;e.textContent="🖼️ "+a.name;e.ondragstart=ev=>ev.dataTransfer.setData("asset",a.id);$("assets").append(e)});
 state.characters.forEach(c=>{let e=document.createElement("div");e.className="item";e.draggable=true;e.textContent="👤 "+c.name;e.ondragstart=ev=>ev.dataTransfer.setData("character",c.id);e.onclick=()=>openCharacter(c);$("characters").append(e)});
 state.scenes.forEach(s=>{let e=document.createElement("div");e.className="item scene "+(s.id===state.active?"active":"");e.textContent="🎬 "+s.name;e.onclick=()=>{state.active=s.id;render()};$("scenes").append(e)});
 renderWorld();
}
function renderWorld(){
 const w=$("world");w.innerHTML="";scene().tokens.forEach(t=>{
  let e=document.createElement("div");e.className="token";e.style.cssText=`left:${t.x}px;top:${t.y}px;width:${t.w}px;height:${t.h}px`;
  e.innerHTML=`<img src="${t.src}"><span>${t.name}</span>`;e.onclick=ev=>{ev.stopPropagation();selected=t;e.classList.add("selected");$("inspector").innerHTML=`<b>${t.name}</b><p class="muted">${t.type}</p><button onclick="removeToken('${t.id}')">🗑️ Remover</button>`};
  let sx,sy,ox,oy;e.onpointerdown=ev=>{sx=ev.clientX;sy=ev.clientY;ox=t.x;oy=t.y;e.setPointerCapture(ev.pointerId);e.onpointermove=q=>{t.x=ox+q.clientX-sx;t.y=oy+q.clientY-sy;e.style.left=t.x+"px";e.style.top=t.y+"px"};e.onpointerup=()=>{e.onpointermove=null}};w.append(e)
 });$("empty").style.display=scene().tokens.length?"none":"block";
}
window.removeToken=id=>{scene().tokens=scene().tokens.filter(t=>t.id!==id);render()};
$("viewport").ondragover=e=>e.preventDefault();
$("viewport").ondrop=e=>{e.preventDefault();const r=$("viewport").getBoundingClientRect();const x=e.clientX-r.left,y=e.clientY-r.top;
 let a=state.assets.find(z=>z.id===e.dataTransfer.getData("asset"));let c=state.characters.find(z=>z.id===e.dataTransfer.getData("character"));
 if(a)scene().tokens.push({id:uid(),name:a.name,src:a.src,type:"Objeto",x,y,w:150,h:150});
 if(c)scene().tokens.push({id:uid(),name:c.name,src:c.portrait||"",type:"Personagem",characterId:c.id,x,y,w:170,h:170});
 render();
};
$("import").onclick=()=>$("images").click();$("images").onchange=e=>[...e.target.files].forEach(f=>{let r=new FileReader();r.onload=q=>{state.assets.push({id:uid(),name:f.name.replace(/\.[^.]+$/,""),src:q.target.result});render()};r.readAsDataURL(f)});
$("newScene").onclick=()=>{let n=prompt("Nome da nova cena");if(n){state.scenes.push({id:uid(),name:n,tokens:[]});state.active=state.scenes.at(-1).id;render()}};
$("newCharacter").onclick=()=>openCharacter(null);
function openCharacter(c){editing=c||null;c=c||{name:"",appearance:"",weapon:"",personality:"",life:100,fatigue:0,defenses:"",strength:0,speed:0,intelligence:0,build:"",proficiencies:"",powers:"",weaknesses:"",universeType:"",history:"",portrait:""};Object.entries({cName:c.name,appearance:c.appearance,weapon:c.weapon,personality:c.personality,life:c.life,fatigue:c.fatigue,defenses:c.defenses,strength:c.strength,speed:c.speed,intelligence:c.intelligence,build:c.build,proficiencies:c.proficiencies,powers:c.powers,weaknesses:c.weaknesses,universeType:c.universeType,history:c.history}).forEach(([k,v])=>$(k).value=v??"");$("modal").classList.remove("hidden")}
$("cancel").onclick=()=>$("modal").classList.add("hidden");
$("saveCharacter").onclick=()=>{let c=editing||{id:uid(),portrait:""};["appearance","weapon","personality","defenses","build","proficiencies","powers","weaknesses","universeType","history"].forEach(k=>c[k]=$(k).value);c.name=$("cName").value||"Personagem";["life","fatigue","strength","speed","intelligence"].forEach(k=>c[k]=+$ (k).value||0);if(!editing)state.characters.push(c);$("modal").classList.add("hidden");render()};
$("saveFile").onclick=()=>{let b=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="minha-campanha-rpg.json";a.click()};
$("loadFile").onclick=()=>$("file").click();$("file").onchange=e=>{let r=new FileReader();r.onload=q=>{try{let d=JSON.parse(q.target.result);Object.assign(state,d);render()}catch{alert("Arquivo inválido")}};r.readAsText(e.target.files[0])};
render();