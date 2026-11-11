# RPG TABLE CORRIGIDO

## Bugs corrigidos
- `master.html` estava faltando.
- `firebase-config.js` não exportava `firebaseConfig`, quebrando todo o Firebase.
- `player.js` estava faltando.
- `player.html` não carregava o JavaScript.
- Upload agora usa Firebase Storage.
- Jogador recebe alterações em tempo real com Firestore.
- Cenário pode ser usado como fundo.
- Objetos podem ser arrastados.

## Firebase obrigatório
### Authentication
Ative Anonymous.

### Firestore Rules
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

### Storage Rules
```text
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /rpgRooms/{roomId}/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Depois envie TODOS os arquivos para a raiz do GitHub.
