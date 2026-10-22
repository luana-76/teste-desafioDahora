# Desafio da Hora — versão HTML, CSS e JavaScript puros

Modo demonstração, sem backend e sem banco de dados. Os dados e as alterações ficam apenas no navegador (localStorage).

## Como abrir
- Dê dois cliques em `index.html` (funciona direto no navegador), ou
- publique a pasta inteira em qualquer hospedagem estática (Vercel, Netlify, GitHub Pages). Não há instalação nem build.
  Na Vercel: Framework Preset "Other", sem Build Command e sem Output Directory.

## Estrutura
- `index.html` — página única
- `css/estilos.css` — estilos
- `js/dados.js` — dados de exemplo e regras (equipes, desafios, ranking, quadro, cartas)
- `js/paginas.js` — telas (painel, equipes, desafios, quadro, cartas, ranking, avaliações, perfil, login)
- `js/app.js` — menu, topo, rodapé e rotas
- `img/` — mascote e ícone

## Acesso de demonstração
Abre direto como Pedro Lima (Equipe Nebulosa). Para trocar de participante: "Sair" e entrar com `ana@demo.com` (Fênix), `caio@demo.com` (Pixel) etc. A senha é só ilustrativa.

## Resetar os dados
Apague a chave `desafio-dahora:demo-vanilla-v1` no Local Storage do navegador e recarregue.
