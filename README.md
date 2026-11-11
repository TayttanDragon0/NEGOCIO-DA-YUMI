# 🎲 RPG Table Multiplayer

## O que funciona
- Mestre cria uma sala online
- Jogador entra por código/link
- Mesa sincroniza em tempo real
- Objetos e personagens podem ser arrastados
- Cenas sincronizadas
- Fichas de personagens
- Download/upload da campanha em JSON
- GitHub Pages para hospedar o site

## PASSO 1 — Criar Firebase
1. Vá em https://console.firebase.google.com/
2. Crie um projeto.
3. Adicione um **Web App**.
4. Copie as configurações.
5. Cole em `firebase-config.js`.

## PASSO 2 — Ativar Authentication
Firebase Console → Authentication → Sign-in method → ative **Anonymous**.

## PASSO 3 — Ativar Firestore
Firebase Console → Firestore Database → Create database.

Para TESTE, use regras temporárias:
```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rpgRooms/{roomId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## PASSO 4 — GitHub Pages
Envie TODOS os arquivos para a RAIZ do repositório:
- index.html
- master.html
- player.html
- style.css
- common.js
- master.js
- player.js
- firebase.js
- firebase-config.js

Depois:
Settings → Pages → Deploy from a branch → main → /(root)

## IMPORTANTE SOBRE IMAGENS
Nesta versão, imagens importadas são guardadas dentro do estado da campanha como Base64. Para imagens muito grandes, o Firestore pode atingir limites. Para uma versão maior/profissional, o ideal é adicionar Firebase Storage.
