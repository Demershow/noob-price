# 🎮 NoobPrice

> *Ser noob em preço é coisa do passado.*

Compare preços de jogos da Steam com outras lojas **sem sair da página**. Um clique na loja da Steam e você vê ofertas em outros sites e o histórico de preço em um gráfico.

---

## 💡 O que é

**NoobPrice** é uma extensão de navegador que:

- **Aparece na Steam** — na página de cada jogo (`store.steampowered.com/app/...`) um botão **"Comparar com NoobPrice"** abre um painel com ofertas em outras lojas.
- **Mostra o menor preço** — as ofertas vêm do backend (API), que consolida dados de preço para você escolher onde comprar.
- **Gráfico de histórico** — exibe a evolução do preço no tempo (menor preço por dia), com zoom por scroll e botão para resetar a visualização.
- **Popup** — ao clicar no ícone da extensão, você também pode consultar ofertas e histórico do jogo da aba atual.

Tudo isso com **poucas permissões**: só o necessário para a aba ativa, abas e as URLs da API (localhost e noob-price.vercel.app).

---

## 🧩 Por que dois projetos?

Chrome e Firefox usam formatos diferentes de extensão:

| Build | Pasta | Navegador | Manifest |
|-------|--------|-----------|----------|
| **Chrome** | `noob-price-chrome/` | Chrome, Edge, Opera | V3 (service worker) |
| **Firefox** | `noob-price-firefox/` | Firefox 91+ | V2 (event page) |

Cada pasta tem seu próprio `manifest.json` e instruções de instalação. O restante do código (popup, content scripts, gráfico, ícones) é compartilhado na prática entre os dois.

---

## 🚀 Instalação rápida

### Chrome (e Edge, Opera)

1. Abra `chrome://extensions`.
2. Ative **Modo do desenvolvedor**.
3. **Carregar sem compactação** → selecione a pasta **`noob-price-chrome`**.

### Firefox

1. Abra `about:debugging` → **Este Firefox**.
2. **Carregar extensão temporária...** → selecione o **`manifest.json`** dentro da pasta **`noob-price-firefox`**.

Para publicar na loja do Firefox, use **web-ext** e defina um `id` único em `browser_specific_settings.gecko.id` no manifest.

---

## ⚙️ Como funciona

- **Na Steam:** o content script injeta o botão e o modal. Toda requisição à API (busca, ofertas, histórico) é feita pelo **background**; popup e content script só enviam mensagens para ele. Assim evitamos problemas de CORS e de acesso a localhost.
- **Backend:** a extensão chama uma API (por padrão `http://localhost:3000` ou `https://noob-price.vercel.app`). Essa API expõe endpoints como `/api/search`, `/api/deals` e `/api/history`. O histórico usa a API do IsThereAnyDeal (History log); o backend repassa os dados e a extensão transforma em pontos do gráfico (menor preço por dia).

A URL da API é configurada em **`background.js`** (`API_BASE`) em cada build.

---

## 📁 Estrutura do repositório

```
noob-price/
├── README.md                 ← você está aqui
├── noob-price-chrome/        ← build Chrome (Manifest V3)
│   ├── manifest.json
│   ├── background.js
│   ├── popup.html, popup.js, style.css
│   ├── content.js, chart.js, inject-button.js
│   ├── icons/
│   └── README.md
└── noob-price-firefox/       ← build Firefox (Manifest V2)
    ├── manifest.json
    ├── background.js
    ├── popup.html, popup.js, style.css
    ├── content.js, chart.js, inject-button.js
    ├── icons/
    └── README.md
```

Cada build tem seu próprio README com detalhes de permissões, instalação e desenvolvimento.

---

## 📜 API do backend (histórico)

O gráfico de preço usa o endpoint **GET /api/history** do backend. O backend deve chamar a API do IsThereAnyDeal:

- **ITAD:** [History log](https://docs.isthereanydeal.com/) — `GET /games/history/v2`
- **Parâmetros:** `id` (Game ID / plain), `country` (ex.: BR), opcional `since`.

A extensão espera um array no formato ITAD; ela converte em pontos do gráfico (menor preço por dia).

---

*Feito para quem não quer pagar mais do que precisa.* 🛒
