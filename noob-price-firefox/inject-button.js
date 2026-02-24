// Detecção universal no início
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
const NOOBPRICE_ICONS_BASE = 'https://noob-price.vercel.app';

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
    background: 'linear-gradient(135deg, #1e1e2f 0%, #2a2a3d 100%)',
    border: '2px solid #4b5563',
    borderRadius: '12px',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
    zIndex: 999999,
    overflowY: 'auto',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    fontSize: '14px',
    lineHeight: '1.45',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    color: '#e5e7eb'
  });

  const fechar = document.createElement('button');
  fechar.setAttribute('aria-label', 'Fechar modal');
  fechar.textContent = '×';
  Object.assign(fechar.style, {
    position: 'absolute',
    top: '18px',
    right: '14px',
    fontSize: '22px',
    background: 'transparent',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'color 0.2s ease, transform 0.15s ease'
  });
  fechar.onmouseover = () => { fechar.style.color = '#f87171'; fechar.style.transform = 'scale(1.1)'; };
  fechar.onmouseout = () => { fechar.style.color = '#9ca3af'; fechar.style.transform = 'scale(1)'; };
  fechar.onclick = () => container.remove();

  const header = document.createElement('div');
  header.id = 'modal-header';
  header.style.paddingRight = '20px';
  const iconUrl = browserAPI.runtime.getURL('icon-48.png');
  header.innerHTML = `
    <h2 style="margin:0; font-size:20px; font-weight:600; display:flex; align-items:center; gap:12px; color:#93c5fd;">
      <img src="${iconUrl}" style="width:26px; height:26px; border-radius:6px"> NoobPrice
      <span id="game-title" style="font-weight:normal; font-size:14px; margin-left:auto; color:#facc15; max-width:60%; text-align:right; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"></span>
    </h2>
    <hr style="margin:14px 0 16px 0; border:none; border-top:1px solid #4b5563">
  `;

  const resultsDiv = document.createElement('div');
  resultsDiv.id = 'results';
  resultsDiv.setAttribute('aria-busy', 'true');
  resultsDiv.innerHTML = '<div class="noobprice-skeleton" style="display:flex;flex-direction:column;gap:12px;"><div style="display:flex;align-items:center;gap:14px;padding:14px 16px;margin-bottom:12px;background:linear-gradient(135deg,#1e1e2f,#2c2c3f);border:1px solid #3f3f5a;border-radius:12px;"><div style="width:40px;height:40px;border-radius:8px;background:#3f3f5a;"></div><div style="flex:1;"><div style="height:14px;width:60%;margin-bottom:8px;border-radius:4px;background:#3f3f5a;"></div><div style="height:12px;width:40%;border-radius:4px;background:#3f3f5a;"></div></div></div><div style="display:flex;align-items:center;gap:14px;padding:14px 16px;margin-bottom:12px;background:linear-gradient(135deg,#1e1e2f,#2c2c3f);border:1px solid #3f3f5a;border-radius:12px;"><div style="width:40px;height:40px;border-radius:8px;background:#3f3f5a;"></div><div style="flex:1;"><div style="height:14px;width:55%;margin-bottom:8px;border-radius:4px;background:#3f3f5a;"></div><div style="height:12px;width:35%;border-radius:4px;background:#3f3f5a;"></div></div></div><div style="display:flex;align-items:center;gap:14px;padding:14px 16px;margin-bottom:12px;background:linear-gradient(135deg,#1e1e2f,#2c2c3f);border:1px solid #3f3f5a;border-radius:12px;"><div style="width:40px;height:40px;border-radius:8px;background:#3f3f5a;"></div><div style="flex:1;"><div style="height:14px;width:50%;margin-bottom:8px;border-radius:4px;background:#3f3f5a;"></div><div style="height:12px;width:45%;border-radius:4px;background:#3f3f5a;"></div></div></div><div style="margin-top:16px;height:120px;border-radius:12px;background:#3f3f5a;"></div></div>';

  const chartWrap = document.createElement('div');
  chartWrap.id = 'noobprice-chart';
  chartWrap.style.cssText = 'margin-top:16px; min-height:120px;';

  const footer = document.createElement('div');
  footer.style.cssText = 'margin-top:28px; padding-top:16px; border-top:1px solid #4b5563; text-align:center;';
  const apoieLink = document.createElement('a');
  apoieLink.href = 'https://noob-price.vercel.app/apoie';
  apoieLink.target = '_blank';
  apoieLink.rel = 'noopener noreferrer';
  apoieLink.setAttribute('aria-label', 'Apoie o projeto NoobPrice');
  apoieLink.textContent = 'Apoie o projeto';
  apoieLink.style.cssText = 'font-size:12px; color:#93c5fd; text-decoration:none;';
  apoieLink.onmouseover = () => { apoieLink.style.color = '#facc15'; };
  apoieLink.onmouseout = () => { apoieLink.style.color = '#93c5fd'; };
  footer.appendChild(apoieLink);

  const styleEl = document.createElement('style');
  styleEl.textContent = '#noobprice-modal .noobprice-oferta:last-child{margin-bottom:0} #noobprice-modal .noobprice-ofertas-restante .noobprice-oferta:last-child{margin-bottom:0} #noobprice-modal .noobprice-oferta:hover{border-color:rgba(79,63,90,0.9);box-shadow:0 4px 16px rgba(0,0,0,0.3)}';
  container.appendChild(styleEl);
  container.appendChild(fechar);
  container.appendChild(header);
  container.appendChild(resultsDiv);
  container.appendChild(chartWrap);
  container.appendChild(footer);

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
  botao.setAttribute('aria-label', 'Comparar preços com NoobPrice');
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

// Aguarda o nome do jogo existir na página (Steam carrega dinamicamente)
function quandoPaginaPronta(callback, maxTentativas = 20) {
  const tentar = (n) => {
    const el = document.querySelector('.apphub_AppName');
    if (el && el.textContent.trim()) {
      callback();
      return;
    }
    if (n < maxTentativas) setTimeout(() => tentar(n + 1), 500);
  };
  if (document.readyState === 'complete') {
    setTimeout(() => tentar(0), 300);
  } else {
    window.addEventListener('load', () => setTimeout(() => tentar(0), 300));
  }
}

window.addEventListener('load', () => {
  quandoPaginaPronta(() => {
    abrirModalComPopup();
    adicionarBotaoComparar();
  });
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

const skeletonHtml = `<div class="noobprice-skeleton" aria-busy="true" aria-label="Carregando ofertas">
    <div style="display:flex;align-items:center;gap:14px;padding:14px 16px;margin-bottom:12px;background:linear-gradient(135deg,#1e1e2f,#2c2c3f);border:1px solid #3f3f5a;border-radius:12px;"><div style="width:40px;height:40px;border-radius:8px;background:linear-gradient(90deg,#3f3f5a 25%,#4b5563 50%,#3f3f5a 75%);background-size:200% 100%;animation:noobprice-shimmer 1.2s ease-in-out infinite;"></div><div style="flex:1;"><div style="height:14px;width:60%;margin-bottom:8px;border-radius:4px;background:linear-gradient(90deg,#3f3f5a 25%,#4b5563 50%,#3f3f5a 75%);background-size:200% 100%;animation:noobprice-shimmer 1.2s ease-in-out infinite;"></div><div style="height:12px;width:40%;border-radius:4px;background:linear-gradient(90deg,#3f3f5a 25%,#4b5563 50%,#3f3f5a 75%);background-size:200% 100%;animation:noobprice-shimmer 1.2s ease-in-out infinite;"></div></div><div style="width:70px;height:32px;border-radius:8px;background:#3f3f5a;"></div></div>
    <div style="display:flex;align-items:center;gap:14px;padding:14px 16px;margin-bottom:12px;background:linear-gradient(135deg,#1e1e2f,#2c2c3f);border:1px solid #3f3f5a;border-radius:12px;"><div style="width:40px;height:40px;border-radius:8px;background:linear-gradient(90deg,#3f3f5a 25%,#4b5563 50%,#3f3f5a 75%);background-size:200% 100%;animation:noobprice-shimmer 1.2s ease-in-out infinite;"></div><div style="flex:1;"><div style="height:14px;width:55%;margin-bottom:8px;border-radius:4px;background:linear-gradient(90deg,#3f3f5a 25%,#4b5563 50%,#3f3f5a 75%);background-size:200% 100%;animation:noobprice-shimmer 1.2s ease-in-out infinite;"></div><div style="height:12px;width:35%;border-radius:4px;background:linear-gradient(90deg,#3f3f5a 25%,#4b5563 50%,#3f3f5a 75%);background-size:200% 100%;animation:noobprice-shimmer 1.2s ease-in-out infinite;"></div></div></div><div style="display:flex;align-items:center;gap:14px;padding:14px 16px;margin-bottom:12px;background:linear-gradient(135deg,#1e1e2f,#2c2c3f);border:1px solid #3f3f5a;border-radius:12px;"><div style="width:40px;height:40px;border-radius:8px;background:linear-gradient(90deg,#3f3f5a 25%,#4b5563 50%,#3f3f5a 75%);background-size:200% 100%;animation:noobprice-shimmer 1.2s ease-in-out infinite;"></div><div style="flex:1;"><div style="height:14px;width:50%;margin-bottom:8px;border-radius:4px;background:linear-gradient(90deg,#3f3f5a 25%,#4b5563 50%,#3f3f5a 75%);background-size:200% 100%;animation:noobprice-shimmer 1.2s ease-in-out infinite;"></div><div style="height:12px;width:45%;border-radius:4px;background:linear-gradient(90deg,#3f3f5a 25%,#4b5563 50%,#3f3f5a 75%);background-size:200% 100%;animation:noobprice-shimmer 1.2s ease-in-out infinite;"></div></div></div>
    <div style="margin-top:16px;height:120px;border-radius:12px;background:linear-gradient(90deg,#3f3f5a 25%,#4b5563 50%,#3f3f5a 75%);background-size:200% 100%;animation:noobprice-shimmer 1.2s ease-in-out infinite;"></div>
  </div><style>@keyframes noobprice-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}</style>`;
  resultsDiv.innerHTML = skeletonHtml;

    try {
    const plain = await buscarPlainViaBackground(nomeDoJogo);

    if (!plain) {
      resultsDiv.textContent = "Jogo não encontrado na base da ITAD.";
      return;
    }

    const response = await buscarOfertas(plain);
    const dados = response?.data ?? response;
    const iconDataUrls = response?.iconDataUrls || {};

    const emptyStateHtml = `<div class="noobprice-empty" style="text-align:center; padding:28px 20px; background:linear-gradient(135deg, #1e1e2f, #2a2a3d); border:1px solid #3f3f5a; border-radius:12px; color:#9ca3af;">
      <div style="font-size:32px; margin-bottom:12px;">🔍</div>
      <div style="font-weight:600; color:#e5e7eb; margin-bottom:8px; font-size:15px;">Nenhuma promoção no momento</div>
      <div style="font-size:13px; line-height:1.5;">Este jogo não tem ofertas com desconto agora. Vale conferir de novo mais tarde.</div>
    </div>`;

    if (!dados || !Array.isArray(dados) || dados.length === 0) {
      resultsDiv.innerHTML = emptyStateHtml;
      const chartEl = document.getElementById('noobprice-chart');
      if (chartEl) chartEl.style.display = 'none';
      return;
    }

    const ofertas = dados[0].deals;

    if (!ofertas || ofertas.length === 0) {
      resultsDiv.innerHTML = emptyStateHtml;
      const chartEl = document.getElementById('noobprice-chart');
      if (chartEl) chartEl.style.display = 'none';
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
      "Nuuvem": "nuuvem",
      "WinGameStore": "wingamestore",
      "2game": "twogame",
      "PlanetPlay": "planetplay"
    };

    const ofertasFiltradas = ofertas.filter(o => o.cut > 0);
    const LIMITE = 3;
    const visiveis = ofertasFiltradas.slice(0, LIMITE);
    const restante = ofertasFiltradas.slice(LIMITE);

    function cardHtml(oferta) {
      const preco = oferta.price.amount.toFixed(2);
      const precoAntigo = oferta.regular.amount.toFixed(2);
      const desconto = oferta.cut;
      const icon = storeIconMap[oferta.shop.name] || 'unknown';
      const iconUrl = iconDataUrls[icon] || (NOOBPRICE_ICONS_BASE + '/icons/' + icon + '.png');
      return `
        <div class="noobprice-oferta" style="
          background:linear-gradient(135deg, #1e1e2f, #2c2c3f);
          border:1px solid #3f3f5a;
          border-radius:12px;
          padding:14px 16px;
          margin-bottom:12px;
          display:flex;
          align-items:center;
          gap:14px;
          box-shadow:0 2px 12px rgba(0,0,0,0.25);
          color:#fff;
          font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;
        ">
          <img src="${iconUrl}" alt="${oferta.shop.name}" width="40" height="40" style="flex-shrink:0; border-radius:8px; background:#fff; padding:3px; object-fit:contain;">
          <div style="flex:1; min-width:0">
            <div style="font-size:14px; font-weight:600; color:#93c5fd; margin-bottom:2px;">${oferta.shop.name}</div>
            <div style="margin-top:2px; font-size:13px; line-height:1.4;">
              <span style="color:#22c55e; font-weight:bold;">R$ ${preco}</span>
              <s style="color:#888; margin-left:6px; font-weight:normal;">R$ ${precoAntigo}</s>
              <span style="margin-left:8px; color:#facc15; font-weight:bold;">-${desconto}%</span>
            </div>
          </div>
          <a href="${oferta.url}" target="_blank" class="noobprice-btn-ver" style="
            background:#9333ea;
            padding:9px 14px;
            border-radius:8px;
            color:white;
            text-decoration:none;
            font-size:12px;
            font-weight:bold;
            flex-shrink:0;
            transition:background 0.2s ease, transform 0.15s ease;
          " onmouseover="this.style.background='#7e22ce'; this.style.transform='translateY(-1px)'" onmouseout="this.style.background='#9333ea'; this.style.transform='translateY(0)'">
            Ver
          </a>
        </div>
      `;
    }

    let html = visiveis.map(cardHtml).join('');
    if (restante.length > 0) {
      html += '<div class="noobprice-ofertas-restante" style="display:none">' + restante.map(cardHtml).join('') + '</div>';
      html += '<button type="button" class="noobprice-btn-mostrar-mais" style="width:100%; margin-top:8px; padding:10px; background:#3f3f5a; border:1px solid #4b5563; border-radius:8px; color:#93c5fd; font-size:13px; font-weight:600; cursor:pointer; transition:background 0.2s">Mostrar mais (' + restante.length + ')</button>';
    }
    if (visiveis.length === 0) {
      const emptyStateHtml2 = `<div class="noobprice-empty" style="text-align:center; padding:28px 20px; background:linear-gradient(135deg, #1e1e2f, #2a2a3d); border:1px solid #3f3f5a; border-radius:12px; color:#9ca3af;">
        <div style="font-size:32px; margin-bottom:12px;">🔍</div>
        <div style="font-weight:600; color:#e5e7eb; margin-bottom:8px; font-size:15px;">Nenhuma promoção no momento</div>
        <div style="font-size:13px; line-height:1.5;">Este jogo não tem ofertas com desconto agora. Vale conferir de novo mais tarde.</div>
      </div>`;
      resultsDiv.innerHTML = emptyStateHtml2;
      const chartEl = document.getElementById('noobprice-chart');
      if (chartEl) chartEl.style.display = 'none';
      return;
    }
    resultsDiv.innerHTML = html;

    const btnMais = resultsDiv.querySelector('.noobprice-btn-mostrar-mais');
    const divRestante = resultsDiv.querySelector('.noobprice-ofertas-restante');
    if (btnMais && divRestante) {
      btnMais.addEventListener('click', () => {
        divRestante.style.display = 'block';
        btnMais.remove();
      });
    }

    const historico = await buscarHistorico(plain);
    const chartEl = document.getElementById('noobprice-chart');
    if (chartEl) {
      chartEl.style.display = '';
      if (typeof renderPriceChart === 'function') renderPriceChart(chartEl, historico, { height: 120 });
    }

  } catch (err) {
    console.error(err);
    resultsDiv.textContent = "Erro ao buscar os dados.";
  }
}

function buscarPlainViaBackground(nome) {
  return new Promise((resolve) => {
    browserAPI.runtime.sendMessage({ type: 'buscarPlain', title: nome }, (response) => {
      if (browserAPI.runtime?.lastError) {
        console.error('Erro buscarPlain:', browserAPI.runtime.lastError);
        resolve(null);
        return;
      }
      resolve(response?.plain ?? null);
    });
  });
}

async function buscarOfertas(plain) {
  return new Promise((resolve, reject) => {
    browserAPI.runtime.sendMessage(
      { type: 'buscarOfertas', plain },
      (response) => {
        if (response?.success) resolve(response);
        else reject(response?.error || 'Erro desconhecido');
      }
    );
  });
}

function buscarHistorico(plain) {
  return new Promise((resolve) => {
    browserAPI.runtime.sendMessage({ type: 'buscarHistorico', plain, country: 'BR' }, (response) => {
      resolve(response?.data ?? []);
    });
  });
}