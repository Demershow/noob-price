
const API_KEY = "ae0c88d2cc4a4abe683f2a32fa59566d926ec34f"

function abrirModalComPopup() {
  if (document.getElementById('noobprice-modal')) return;

  const container = document.createElement('div');
  container.id = 'noobprice-modal';
  Object.assign(container.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    width: '420px',
    height: '550px',
    background: 'linear-gradient(135deg, #1e1e2f, #2a2a3d)',
    border: '2px solid #4b5563',
    borderRadius: '12px',
    boxShadow: '0 0 18px rgba(0, 0, 0, 0.6)',
    zIndex: 999999,
    overflowY: 'auto',
    fontFamily: 'Segoe UI, Tahoma, sans-serif',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    color: '#e5e7eb'
  });


  const fechar = document.createElement('button');
  fechar.textContent = '×';
  Object.assign(fechar.style, {
    position: 'absolute',
    top: '10px',
    right: '14px',
    fontSize: '22px',
    background: 'transparent',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'color 0.2s'
  });
  fechar.onmouseover = () => fechar.style.color = '#f87171';
  fechar.onmouseout = () => fechar.style.color = '#9ca3af';
  fechar.onclick = () => container.remove();

  const header = document.createElement('div');
  header.id = 'modal-header';
  header.innerHTML = `
   <h2 style="margin: 5px; font-size: 20px; display: flex; align-items: center; gap: 12px; color: #93c5fd;">
  <img src="${chrome.runtime.getURL('icons/icon.png')}" style="width: 26px; height: 26px"> NoobPrice
  <span id="game-title" style="font-weight: normal; font-size: 15px; margin-left: auto; color: #facc15;"></span>
</h2>
<hr style="margin: 12px 0; border: none; border-top: 1px solid #4b5563">

  `;

  const resultsDiv = document.createElement('div');
  resultsDiv.id = 'results';
  resultsDiv.textContent = 'Buscando ofertas...';

  container.appendChild(fechar);
  container.appendChild(header);
  container.appendChild(resultsDiv);

  document.body.appendChild(container);

  buscarOfertasSteam();
}

function adicionarBotaoComparar() {
  const precos = document.querySelectorAll('.btn_addtocart');
  if (!precos || precos.length === 0) return;
  const precoElement = precos[0];
  if (precoElement.dataset.noobpriceAdded) return;

  const body = document.querySelector('body');
  const botao = document.createElement('button');
  botao.textContent = '🔍 Comparar com NoobPrice';
  Object.assign(botao.style, {
    marginLeft: '10px',
    padding: '6px 12px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  });
  botao.onclick = abrirModalComPopup;

  precoElement.parentElement.appendChild(botao);
  precoElement.dataset.noobpriceAdded = 'true';
}

window.addEventListener('load', () => {
  setTimeout(() => { abrirModalComPopup(), adicionarBotaoComparar() }, 1000);
});

async function buscarOfertasSteam() {
  const el = document.querySelector('.apphub_AppName');
  const nomeDoJogo = el ? el.textContent.trim() : null;

  const resultsDiv = document.getElementById("results");
  const titleSpan = document.getElementById("game-title");
  if (titleSpan && nomeDoJogo) titleSpan.textContent = nomeDoJogo;

  if (!nomeDoJogo) {
    resultsDiv.textContent = "Jogo não detectado.";
    return;
  }

  resultsDiv.textContent = `Buscando ofertas reais para: ${nomeDoJogo}...`;

  try {
    const plain = await buscarPlain(nomeDoJogo);

    if (!plain) {
      resultsDiv.textContent = "Jogo não encontrado na base da ITAD.";
      return;
    }

    const dados = await buscarOfertas(plain);

    if (!dados || !Array.isArray(dados) || dados.length === 0) {
      resultsDiv.textContent = "Nenhuma oferta encontrada no momento.";
      return;
    }

    const ofertas = dados[0].deals;

    if (!ofertas || ofertas.length === 0) {
      resultsDiv.textContent = "Nenhuma oferta encontrada no momento.";
      return;
    }

    const storeIconMap = {
      "Steam": "steam",
      "Epic Game Store": "epicgames",
      "GOG": "gog",
      "Ubisoft Store": "ubisoft",
      "Humble Store": "humblestore",
      "GreenManGaming": "greenmangaming",
      "GameBillet": "gamebillet",
      "GamersGate": "gamersgate",
      "Gamesload": "gamesload",
      "JoyBuggy": "joybuggy",
      "GamesPlanet US": "gamesplanet",
      "GamesPlanet UK": "gamesplanet",
      "GamesPlanet FR": "gamesplanet",
      "GamesPlanet DE": "gamesplanet",
      "IndieGala Store": "indiegala",
      "Fanatical": "fanatical",
      "Nuuvem": "nuuvem"
    };

    const html = ofertas
      .filter(oferta => oferta.cut > 0)
      .map(oferta => {
        const preco = oferta.price.amount.toFixed(2);
        const precoAntigo = oferta.regular.amount.toFixed(2);
        const desconto = oferta.cut;

        const icon = storeIconMap[oferta.shop.name] || 'unknown';
        const iconUrl = chrome.runtime.getURL(`icons/${icon}.png`);

        return `
      <div class="oferta" style="
        background: linear-gradient(135deg, #1e1e2f, #2c2c3f);
        border: 1px solid #3f3f5a;
        border-radius: 10px;
        padding: 12px 14px;
        margin-bottom: 14px;
        display: flex;
        align-items: center;
        gap: 14px;
        box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
        color: #fff;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      ">
        <img src="${iconUrl}" alt="${oferta.shop.name}" width="36" height="36" style="flex-shrink:0; border-radius:6px; background:#fff; padding:2px;">
        
        <div style="flex: 1">
          <div style="font-size: 14px; font-weight: 600; color: #93c5fd;">${oferta.shop.name}</div>
          <div style="margin-top: 4px; font-size: 13px;">
            <span style="color: #22c55e; font-weight: bold;">R$ ${preco}</span>
            <s style="color:#888; margin-left:6px;">R$ ${precoAntigo}</s>
            <span style="margin-left:8px; color:#facc15; font-weight:bold;">-${desconto}%</span>
          </div>
        </div>

        <a href="${oferta.url}" target="_blank" style="
          background: #9333ea;
          padding: 8px 12px;
          border-radius: 6px;
          color: white;
          text-decoration: none;
          font-size: 12px;
          font-weight: bold;
          transition: background 0.3s;
        " onmouseover="this.style.background='#7e22ce'" onmouseout="this.style.background='#9333ea'">
          Ver
        </a>
      </div>
    `;
      })
      .join('');


    resultsDiv.innerHTML = html || "Sem promoções ativas no momento.";

  } catch (err) {
    console.error(err);
    resultsDiv.textContent = "Erro ao buscar os dados.";
  }
}

async function buscarPlain(nome) {
  const url = new URL('https://api.isthereanydeal.com/games/search/v1');
  url.searchParams.append('key', API_KEY);
  url.searchParams.append('title', nome);
  url.searchParams.append('results', '1');

  const res = await fetch(url.toString());
  if (!res.ok) {
    console.error('Erro na busca:', res.status, res.statusText);
    return null;
  }

  const json = await res.json();
  const jogo = json[0];

  return jogo?.id || null;
}

async function buscarOfertas(plain) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        type: 'buscarOfertas',
        plain: plain
      },
      (response) => {
        if (response?.success) {
          resolve(response.data);
        } else {
          console.error('Erro ao buscar ofertas:', response?.error);
          reject(response?.error || 'Erro desconhecido');
        }
      }
    );
  });
}
