// Detecção universal (Chrome: chrome, Firefox: browser)
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
const NOOBPRICE_ICONS_BASE = 'https://noob-price.vercel.app';

// Helpers para APIs assíncronas funcionarem em Chrome (callbacks) e Firefox (Promises)
function queryTabs(options) {
  return new Promise((resolve, reject) => {
    const cb = (tabs) => {
      if (browserAPI.runtime?.lastError) reject(browserAPI.runtime.lastError);
      else resolve(tabs);
    };
    const ret = browserAPI.tabs.query(options, cb);
    if (ret && typeof ret.then === 'function') ret.then(resolve, reject);
  });
}

function executeScript(tabId, options) {
  return new Promise((resolve, reject) => {
    const cb = (results) => {
      if (browserAPI.runtime?.lastError) reject(browserAPI.runtime.lastError);
      else resolve(results);
    };
    const ret = browserAPI.tabs.executeScript(tabId, options, cb);
    if (ret && typeof ret.then === 'function') ret.then(resolve, reject);
  });
}

function sendMessage(msg) {
  return new Promise((resolve, reject) => {
    browserAPI.runtime.sendMessage(msg, (response) => {
      if (browserAPI.runtime?.lastError) reject(browserAPI.runtime.lastError);
      else resolve(response);
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const resultsDiv = document.getElementById('results');
  const gameTitleEl = document.getElementById('game-title');
  const popupIcon = document.getElementById('popup-icon');
  if (popupIcon) popupIcon.src = browserAPI.runtime.getURL('icon-48.png');

  try {
    const tabs = await queryTabs({ active: true, currentWindow: true });
    const tab = tabs[0];
    if (!tab) {
      resultsDiv.textContent = 'Nenhuma aba ativa.';
      return;
    }

    const injectionResults = await executeScript(tab.id, {
      code: `
        (function() {
          const el = document.querySelector('.apphub_AppName');
          return el ? el.textContent.trim() : null;
        })()
      `
    });
    const nomeDoJogo = injectionResults && injectionResults[0];

    if (!nomeDoJogo) {
      resultsDiv.textContent = 'Jogo não detectado.';
      return;
    }

    if (gameTitleEl) gameTitleEl.textContent = nomeDoJogo;
    const skeletonHtml = '<div class="noobprice-skeleton" aria-busy="true" style="display:flex;flex-direction:column;gap:12px;"><div style="display:flex;align-items:center;gap:12px;padding:12px;background:linear-gradient(135deg,#1e1e2f,#2c2c3f);border-radius:12px;"><div style="width:36px;height:36px;border-radius:8px;background:#3f3f5a;"></div><div style="flex:1;"><div style="height:12px;width:70%;margin-bottom:6px;border-radius:4px;background:#3f3f5a;"></div><div style="height:10px;width:50%;border-radius:4px;background:#3f3f5a;"></div></div></div><div style="display:flex;align-items:center;gap:12px;padding:12px;background:linear-gradient(135deg,#1e1e2f,#2c2c3f);border-radius:12px;"><div style="width:36px;height:36px;border-radius:8px;background:#3f3f5a;"></div><div style="flex:1;"><div style="height:12px;width:60%;margin-bottom:6px;border-radius:4px;background:#3f3f5a;"></div><div style="height:10px;width:45%;border-radius:4px;background:#3f3f5a;"></div></div></div><div style="height:100px;border-radius:8px;background:#3f3f5a;"></div></div>';
    resultsDiv.innerHTML = skeletonHtml;

    const plain = await buscarPlainViaBackground(nomeDoJogo);
    if (!plain) {
      resultsDiv.textContent = 'Jogo não encontrado na base da ITAD.';
      return;
    }

    const response = await sendMessage({ type: 'buscarOfertas', plain });
    if (!response?.success) {
      resultsDiv.textContent = response?.error || 'Erro ao buscar ofertas.';
      return;
    }

    const dados = response.data;
    const iconDataUrls = response.iconDataUrls || {};
    const emptyStateHtml = '<div class="noobprice-empty" style="text-align:center; padding:24px 16px; background:linear-gradient(135deg, #1e1e2f, #2a2a3d); border:1px solid #3f3f5a; border-radius:12px; color:#9ca3af;"><div style="font-size:28px; margin-bottom:10px;">🔍</div><div style="font-weight:600; color:#e5e7eb; margin-bottom:6px; font-size:14px;">Nenhuma promoção no momento</div><div style="font-size:12px; line-height:1.5;">Este jogo não tem ofertas com desconto agora.</div></div>';
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
      'Steam': 'steam',
      'Epic Game Store': 'epicgames',
      'GOG': 'gog',
      'Ubisoft Store': 'ubisoft',
      'Humble Store': 'humblestore',
      'GreenManGaming': 'greenmangaming',
      'GameBillet': 'gamebillet',
      'GamersGate': 'gamersgate',
      'Gamesload': 'gamesload',
      'JoyBuggy': 'joybuggy',
      'GamesPlanet US': 'gamesplanet',
      'GamesPlanet UK': 'gamesplanet',
      'GamesPlanet FR': 'gamesplanet',
      'GamesPlanet DE': 'gamesplanet',
      'IndieGala Store': 'indiegala',
      'Fanatical': 'fanatical',
      'Nuuvem': 'nuuvem',
      'WinGameStore': 'wingamestore',
      '2game': 'twogame'
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
        <div class="oferta">
          <img src="${iconUrl}" alt="${oferta.shop.name}" width="36" height="36">
          <div class="info">
            <div class="store-name">${oferta.shop.name}</div>
            <div class="preco">
              R$ ${preco}
              <s>R$ ${precoAntigo}</s>
              <span class="desconto">-${desconto}%</span>
            </div>
          </div>
          <a href="${oferta.url}" target="_blank" class="btn-ver">Ver</a>
        </div>
      `;
    }

    let html = visiveis.map(cardHtml).join('');
    if (restante.length > 0) {
      html += '<div class="ofertas-restante" style="display:none">' + restante.map(cardHtml).join('') + '</div>';
      html += '<button type="button" class="btn-mostrar-mais">Mostrar mais (' + restante.length + ')</button>';
    }
    if (visiveis.length === 0) {
      resultsDiv.innerHTML = emptyStateHtml;
      const chartEl = document.getElementById('noobprice-chart');
      if (chartEl) chartEl.style.display = 'none';
      return;
    }
    resultsDiv.innerHTML = html;

    const btnMais = resultsDiv.querySelector('.btn-mostrar-mais');
    const divRestante = resultsDiv.querySelector('.ofertas-restante');
    if (btnMais && divRestante) {
      btnMais.addEventListener('click', () => {
        divRestante.style.display = 'block';
        btnMais.remove();
      });
    }

    const histRes = await sendMessage({ type: 'buscarHistorico', plain, country: 'BR' });
    const historico = histRes?.data ?? [];
    const chartEl = document.getElementById('noobprice-chart');
    if (chartEl) {
      chartEl.style.display = '';
      if (typeof renderPriceChart === 'function') renderPriceChart(chartEl, historico, { height: 120 });
    }
  } catch (err) {
    console.error(err);
    resultsDiv.textContent = 'Erro ao buscar os dados.';
  }
});

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
