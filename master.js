import{$,uid,roomId,blankState,currentScene}from"./common.js";
import{db,readyAuth,doc,setDoc,uploadImage}from"./firebase.js";
let state=blankState(),room=null,editing=null;
const sc=()=>currentScene(state);
async function sync(){if(room)await setDoc(doc(db,"rpgRooms",room),{state,updatedAt:Date.now()},{merge:true});}
function render(){
 $("assets").innerHTML="";$("characters").innerHTML="";$("scenes").innerHTML="";
 state.assets.forEach(a=>{let e=document.createElement("div");e.className="item";e.draggable=true;e.textContent="🖼️ "+a.name;e.ondragstart=v=>v.dataTransfer.setData("asset",a.id);$("assets").append(e);});
 state.characters.forEach(c=>{let e=document.createElement("div");e.className="item";e.draggable=true;e.textContent="👤 "+c.name;e.ondragstart=v=>v.dataTransfer.setData("character",c.id);e.onclick=()=>openChar(c);$("characters").append(e);});
 state.scenes.forEach(s=>{let e=document.createElement("div");e.className="item scene "+(s.id===state.active?"active":"");e.textContent="🎬 "+s.name;e.onclick=async()=>{state.active=s.id;render();await sync()};$("scenes").append(e);});
 let w=$("world");w.innerHTML="";w.style.backgroundImage=sc().background?`url("${sc().background}")`:"";
 sc().tokens.forEach(t=>{let e=document.createElement("div");e.className="token";e.style.cssText=`left:${t.x}px;top:${t.y}px;width:${t.w}px;height:${t.h}px`;e.innerHTML=`<img src="${t.src}"><span>${t.name}</span>`;
 e.onclick=ev=>{ev.stopPropagation();$("inspector").innerHTML=`<b>${t.name}</b><p class="muted">${t.type}</p><button id="removeToken">🗑️ Remover</button>`;$("removeToken").onclick=async()=>{sc().tokens=sc().tokens.filter(x=>x.id!==t.id);render();await sync()}};
 let sx,sy,ox,oy;e.onpointerdown=ev=>{sx=ev.clientX;sy=ev.clientY;ox=t.x;oy=t.y;e.setPointerCapture(ev.pointerId);e.onpointermove=q=>{t.x=ox+q.clientX-sx;t.y=oy+q.clientY-sy;e.style.left=t.x+"px";e.style.top=t.y+"px"};e.onpointerup=async()=>{e.onpointermove=null;await sync()}};w.append(e);});
 $("empty").style.display=sc().tokens.length?"none":"block";
}
$("viewport").ondragover=e=>e.preventDefault();
$("viewport").ondrop=async e=>{e.preventDefault();let r=$("world").getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;let a=state.assets.find(z=>z.id===e.dataTransfer.getData("asset")),c=state.characters.find(z=>z.id===e.dataTransfer.getData("character"));if(a)sc().tokens.push({id:uid(),name:a.name,src:a.src,type:"Objeto",x,y,w:150,h:150});if(c)sc().tokens.push({id:uid(),name:c.name,src:c.portrait||"",type:"Personagem",x,y,w:170,h:170});render();await sync();};
$("createRoom").onclick=async()=>{try{await readyAuth();room=roomId();await setDoc(doc(db,"rpgRooms",room),{state,createdAt:Date.now(),updatedAt:Date.now()});$("roomCode").textContent=room;$("roomPanel").classList.remove("hidden");$("roomLabel").textContent="🌐 SALA "+room;$("roomLabel").classList.remove("hidden");$("createRoom").disabled=true;let link=new URL("player.html",location.href);link.searchParams.set("room",room);$("copyRoom").onclick=async()=>{await navigator.clipboard.writeText(link.href);$("copyRoom").textContent="✓ Copiado!"};}catch(e){alert("Firebase: "+e.message);console.error(e)}};
$("import").onclick=()=>{if(!room)return alert("Primeiro crie a sala online.");$("images").click()};
$("images").onchange=async e=>{try{for(const f of [...e.target.files]){if(!f.type.startsWith("image/"))continue;let url=await uploadImage(room,f);state.assets.push({id:uid(),name:f.name.replace(/\.[^.]+$/,""),src:url});await sync();render();}}catch(x){alert("Erro no upload: "+x.message);console.error(x)}e.target.value=""};
$("newScene").onclick=async()=>{let n=prompt("Nome da cena");if(!n)return;state.scenes.push({id:uid(),name:n,background:"",tokens:[]});state.active=state.scenes.at(-1).id;render();await sync()};
$("background").onclick=()=>{if(!room)return alert("Crie a sala primeiro.");$("backgroundFile").click()};
$("backgroundFile").onchange=async e=>{let f=e.target.files[0];if(!f)return;try{sc().background=await uploadImage(room,f);render();await sync()}catch(x){alert(x.message)}e.target.value=""};
$("newCharacter").onclick=()=>openChar();
function openChar(c=null){editing=c;let d=c||{name:"",appearance:"",weapon:"",personality:"",life:100,fatigue:0,defenses:"",strength:0,speed:0,intelligence:0,build:"",proficiencies:"",powers:"",weaknesses:"",universeType:"",history:""};let m={cName:d.name,appearance:d.appearance,weapon:d.weapon,personality:d.personality,life:d.life,fatigue:d.fatigue,defenses:d.defenses,strength:d.strength,speed:d.speed,intelligence:d.intelligence,build:d.build,proficiencies:d.proficiencies,powers:d.powers,weaknesses:d.weaknesses,universe:d.universeType,history:d.history};Object.entries(m).forEach(([k,v])=>$(k).value=v??"");$("modal").classList.remove("hidden")}
$("cancel").onclick=()=>$("modal").classList.add("hidden");
$("saveCharacter").onclick=async()=>{let c=editing||{id:uid(),portrait:""};c.name=$("cName").value||"Personagem";c.appearance=$("appearance").value;c.weapon=$("weapon").value;c.personality=$("personality").value;c.life=+$("life").value||0;c.fatigue=+$("fatigue").value||0;c.defenses=$("defenses").value;c.strength=+$("strength").value||0;c.speed=+$("speed").value||0;c.intelligence=+$("intelligence").value||0;c.build=$("build").value;c.proficiencies=$("proficiencies").value;c.powers=$("powers").value;c.weaknesses=$("weaknesses").value;c.universeType=$("universe").value;c.history=$("history").value;if(!editing)state.characters.push(c);$("modal").classList.add("hidden");render();await sync()};
$("saveFile").onclick=()=>{let b=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="campanha-rpg.json";a.click()};
$("loadFile").onclick=()=>$("file").click();
$("file").onchange=e=>{let r=new FileReader();r.onload=q=>{try{state=JSON.parse(q.target.result);render();sync()}catch{alert("JSON inválido")}};r.readAsText(e.target.files[0])};
render();
