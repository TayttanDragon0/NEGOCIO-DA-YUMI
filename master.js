import { $, uid, blankState, scene, roomId } from "./common.js";
import { db, readyAuth, doc, setDoc, uploadImage } from "./firebase.js";

let state = blankState();
let editing = null;
let room = null;
const current = () => scene(state);

async function sync() {
  if (!room) return;
  await setDoc(doc(db, "rpgRooms", room), { state, updatedAt: Date.now() }, { merge: true });
}

function render() {
  $("assets").innerHTML = "";
  $("characters").innerHTML = "";
  $("scenes").innerHTML = "";

  state.assets.forEach(a => {
    const e = document.createElement("div");
    e.className = "item";
    e.draggable = true;
    e.textContent = "🖼️ " + a.name;
    e.ondragstart = ev => ev.dataTransfer.setData("asset", a.id);
    $("assets").append(e);
  });

  state.characters.forEach(c => {
    const e = document.createElement("div");
    e.className = "item";
    e.draggable = true;
    e.textContent = "👤 " + c.name;
    e.ondragstart = ev => ev.dataTransfer.setData("character", c.id);
    e.onclick = () => openCharacter(c);
    $("characters").append(e);
  });

  state.scenes.forEach(s => {
    const e = document.createElement("div");
    e.className = "item scene " + (s.id === state.active ? "active" : "");
    e.textContent = "🎬 " + s.name;
    e.onclick = async () => { state.active = s.id; render(); await sync(); };
    $("scenes").append(e);
  });

  renderWorld();
}

function renderWorld() {
  const w = $("world");
  w.innerHTML = "";

  current().tokens.forEach(t => {
    const e = document.createElement("div");
    e.className = "token";
    e.style.cssText = `left:${t.x}px;top:${t.y}px;width:${t.w}px;height:${t.h}px`;
    e.innerHTML = `<img src="${t.src}" alt=""><span>${t.name}</span>`;

    let sx, sy, ox, oy, dirty = false;

    e.onpointerdown = ev => {
      sx = ev.clientX; sy = ev.clientY;
      ox = t.x; oy = t.y;
      e.setPointerCapture(ev.pointerId);

      e.onpointermove = q => {
        dirty = true;
        t.x = ox + q.clientX - sx;
        t.y = oy + q.clientY - sy;
        e.style.left = t.x + "px";
        e.style.top = t.y + "px";
      };

      e.onpointerup = async () => {
        e.onpointermove = null;
        if (dirty) await sync();
      };
    };

    w.append(e);
  });

  $("empty").style.display = current().tokens.length ? "none" : "block";
}

$("viewport").ondragover = e => e.preventDefault();

$("viewport").ondrop = async e => {
  e.preventDefault();
  const r = $("viewport").getBoundingClientRect();
  const x = e.clientX - r.left, y = e.clientY - r.top;

  const a = state.assets.find(z => z.id === e.dataTransfer.getData("asset"));
  const c = state.characters.find(z => z.id === e.dataTransfer.getData("character"));

  if (a) current().tokens.push({ id:uid(), name:a.name, src:a.src, type:"Objeto", x,y,w:150,h:150 });
  if (c) current().tokens.push({ id:uid(), name:c.name, src:c.portrait||"", type:"Personagem", characterId:c.id, x,y,w:170,h:170 });

  render();
  await sync();
};

// UPLOAD PARA FIREBASE STORAGE
$("import").onclick = () => {
  if (!room) {
    alert("Primeiro crie a sala online. Depois importe as imagens.");
    return;
  }
  $("images").click();
};

$("images").onchange = async e => {
  const files = [...e.target.files];
  if (!files.length) return;

  const oldText = $("import").textContent;
  $("import").disabled = true;

  try {
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;

      $("import").textContent = "☁️ Enviando " + file.name + "...";
      const url = await uploadImage(room, file);

      state.assets.push({
        id: uid(),
        name: file.name.replace(/\.[^.]+$/, ""),
        src: url
      });

      render();
      await sync();
    }

    alert("Imagem(ns) enviada(s) para o Firebase Storage!");
  } catch (err) {
    console.error(err);
    alert("Erro ao enviar imagem: " + err.message);
  } finally {
    $("import").disabled = false;
    $("import").textContent = oldText;
    $("images").value = "";
  }
};

$("newScene").onclick = async () => {
  const n = prompt("Nome da nova cena");
  if (!n) return;
  state.scenes.push({ id:uid(), name:n, tokens:[] });
  state.active = state.scenes.at(-1).id;
  render();
  await sync();
};

$("newCharacter").onclick = () => openCharacter();

function openCharacter(c=null) {
  editing = c;
  const d = c || {name:"",appearance:"",weapon:"",personality:"",life:100,fatigue:0,defenses:"",strength:0,speed:0,intelligence:0,build:"",proficiencies:"",powers:"",weaknesses:"",universeType:"",history:"",portrait:""};

  const map = {
    cName:d.name, appearance:d.appearance, weapon:d.weapon, personality:d.personality,
    life:d.life, fatigue:d.fatigue, defenses:d.defenses, strength:d.strength,
    speed:d.speed, intelligence:d.intelligence, build:d.build,
    proficiencies:d.proficiencies, powers:d.powers, weaknesses:d.weaknesses,
    universe:d.universeType, history:d.history
  };

  Object.entries(map).forEach(([k,v]) => $(k).value = v ?? "");
  $("modal").classList.remove("hidden");
}

$("cancel").onclick = () => $("modal").classList.add("hidden");

$("saveCharacter").onclick = async () => {
  const c = editing || {id:uid(), portrait:""};
  c.name = $("cName").value || "Personagem";
  c.universeType = $("universe").value;

  ["appearance","weapon","personality","defenses","build","proficiencies","powers","weaknesses","history"]
    .forEach(k => c[k] = $(k).value);

  ["life","fatigue","strength","speed","intelligence"]
    .forEach(k => c[k] = +$(k).value || 0);

  if (!editing) state.characters.push(c);

  $("modal").classList.add("hidden");
  render();
  await sync();
};

$("saveFile").onclick = () => {
  const blob = new Blob([JSON.stringify(state,null,2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "minha-campanha-rpg.json";
  a.click();
};

$("loadFile").onclick = () => $("file").click();

$("file").onchange = e => {
  const r = new FileReader();
  r.onload = async q => {
    try {
      state = JSON.parse(q.target.result);
      render();
      await sync();
    } catch { alert("Arquivo inválido."); }
  };
  r.readAsText(e.target.files[0]);
};

$("createRoom").onclick = async () => {
  try {
    await readyAuth();
    room = roomId();

    await setDoc(doc(db, "rpgRooms", room), {
      state,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    $("roomCode").textContent = room;
    $("roomLabel").textContent = "🌐 SALA " + room;
    $("roomLabel").classList.remove("hidden");
    $("roomPanel").classList.remove("hidden");

    $("createRoom").textContent = "🟢 Sala online";
    $("createRoom").disabled = true;

    const link = new URL("player.html", location.href);
    link.searchParams.set("room", room);

    $("copyRoom").onclick = async () => {
      await navigator.clipboard.writeText(link.href);
      $("copyRoom").textContent = "✓ Link copiado!";
    };

    alert("Sala criada! Agora você pode importar imagens.");
  } catch (err) {
    console.error(err);
    alert("Erro ao conectar ao Firebase: " + err.message);
  }
};

render();
