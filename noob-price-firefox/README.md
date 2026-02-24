# NoobPrice (Firefox)

Compare preços de jogos da Steam automaticamente!

**Build:** Manifest V2 — para Mozilla Firefox (91+).

## Permissões

- `activeTab` / `tabs` — abrir popup e interagir com a aba da Steam.
- Acesso apenas às origens da API: `localhost:3000`, `127.0.0.1:3000`, `noob-price.vercel.app`.

## Instalação

1. Abra o Firefox e acesse `about:debugging`.
2. Clique em **Este Firefox**.
3. Clique em **Carregar extensão temporária...**.
4. Selecione o arquivo **manifest.json** da pasta **noob-price-firefox**.

Para publicar em [addons.mozilla.org](https://addons.mozilla.org), use [web-ext](https://extensionworkshop.com/documentation/develop/web-ext-command-reference/) e altere `browser_specific_settings.gecko.id` no `manifest.json` para um ID único (ex.: `noobprice@seudominio.com`).

## Desenvolvimento

O backend (API) pode rodar em `http://localhost:3000` ou usar `https://noob-price.vercel.app`. A URL é definida em `background.js` (`API_BASE`).

## Estrutura

- `manifest.json` — Manifest V2 (Firefox), com `browser_specific_settings.gecko`.
- `background.js` — event page; faz todas as requisições à API.
- `popup.html` / `popup.js` / `style.css` — popup da extensão.
- `content.js`, `chart.js`, `inject-button.js` — scripts na página da Steam (modal, ofertas, gráfico).
