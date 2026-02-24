# NoobPrice (Chrome)

Compare preços de jogos da Steam automaticamente!

**Build:** Manifest V3 — para Google Chrome, Microsoft Edge e outros Chromium.

## Permissões

- `activeTab` / `tabs` — abrir popup e interagir com a aba da Steam.
- Acesso apenas às origens da API: `localhost:3000`, `127.0.0.1:3000`, `noob-price.vercel.app`.

## Instalação

1. Abra o Chrome e acesse `chrome://extensions`.
2. Ative **Modo do desenvolvedor**.
3. Clique em **Carregar sem compactação**.
4. Selecione a pasta **noob-price-chrome**.

## Desenvolvimento

O backend (API) pode rodar em `http://localhost:3000` ou usar `https://noob-price.vercel.app`. A URL é definida em `background.js` (`API_BASE`).

## Estrutura

- `manifest.json` — Manifest V3 (Chrome).
- `background.js` — service worker; faz todas as requisições à API.
- `popup.html` / `popup.js` / `style.css` — popup da extensão.
- `content.js`, `chart.js`, `inject-button.js` — scripts na página da Steam (modal, ofertas, gráfico).
