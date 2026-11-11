# RPG Table

## Publicar no GitHub Pages
1. Crie um repositório no GitHub.
2. Envie todos os arquivos desta pasta.
3. Abra **Settings > Pages**.
4. Em **Source**, escolha **Deploy from a branch**.
5. Escolha `main` e `/root`.
6. Salve.

## IMPORTANTE: multiplayer
GitHub Pages hospeda apenas arquivos estáticos. Para Mestre e jogadores em computadores diferentes verem a mesma mesa em tempo real, o próximo passo é conectar um banco/servidor em tempo real, como Firebase.

A estrutura já está separada em:
- index.html — entrada
- master.html — painel do Mestre
- player.html — painel dos Jogadores
- app.js — lógica da mesa
- style.css — visual

## Salvamento
O Mestre pode baixar a campanha em `minha-campanha-rpg.json` e depois abrir esse arquivo novamente. Assim os dados não dependem do navegador.
