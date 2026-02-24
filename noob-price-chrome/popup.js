// Detecção universal (Chrome: chrome, Firefox: browser)
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

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
  if (popupIcon) popupIcon.src = browserAPI.runtime.getURL('icons/icon.png');

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
    resultsDiv.textContent = `Buscando ofertas reais para: ${nomeDoJogo}...`;

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
    if (!dados || !Array.isArray(dados) || dados.length === 0) {
      resultsDiv.textContent = 'Nenhuma oferta encontrada no momento.';
      return;
    }

    const ofertas = dados[0].deals;
    if (!ofertas || ofertas.length === 0) {
      resultsDiv.textContent = 'Nenhuma oferta encontrada no momento.';
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
      '2game': '2game'
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
      const iconUrl = browserAPI.runtime.getURL(`icons/${icon}.png`);
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
    resultsDiv.innerHTML = html || 'Sem promoções ativas no momento.';

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
    if (chartEl && typeof renderPriceChart === 'function') renderPriceChart(chartEl, historico, { height: 120 });
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
