// Detecção universal do navegador
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// Converte resposta do histórico ITAD (backend) em pontos para o gráfico [{ date, price }]
// Formato ITAD: [{ timestamp, shop, deal: { price: { amount } } }, ...]
function historicoITADParaChart(lista) {
  if (!Array.isArray(lista) || lista.length === 0) return [];
  const porData = {};
  for (const item of lista) {
    const date = (item.timestamp || '').toString().slice(0, 10);
    const price = item.deal?.price?.amount;
    if (!date || price == null) continue;
    if (porData[date] == null || price < porData[date]) porData[date] = price;
  }
  return Object.entries(porData)
    .map(([date, price]) => ({ date, price }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

const API_BASE = 'https://noob-price.vercel.app';

const STORE_ICON_MAP = {
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

function fetchIconAsDataUrl(slug) {
  const url = `${API_BASE}/icons/${slug}.png`;
  return fetch(url)
    .then(res => res.ok ? res.blob() : Promise.reject(new Error('Icon not found')))
    .then(blob => new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(blob);
    }))
    .catch(() => null);
}

// Listener para buscar ofertas e search (tudo pelo background para evitar CORS/localhost no popup)
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'buscarPlain') {
    const title = request.title;
    if (!title) {
      sendResponse({ success: false, plain: null });
      return false;
    }
    const url = `${API_BASE}/api/search?title=${encodeURIComponent(title)}`;
    fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } })
      .then(res => res.json())
      .then(data => {
        const jogo = Array.isArray(data) ? data[0] : null;
        sendResponse({ success: true, plain: jogo?.id ?? null });
      })
      .catch(err => {
        console.error('Erro ao buscar plain:', err);
        sendResponse({ success: false, plain: null });
      });
    return true;
  }

  if (request.type === 'buscarOfertas') {
    const plain = request.plain;

    fetch(`${API_BASE}/api/deals?plain=${plain}`, {
      method: 'GET',
      headers: {
        'Content-type': "application/json"
      },
    })
      .then(res => res.json())
      .then(data => {
        const deals = Array.isArray(data) && data[0] && data[0].deals ? data[0].deals : [];
        const slugs = [...new Set(deals.map(d => STORE_ICON_MAP[d.shop?.name] || 'unknown'))];
        Promise.all(slugs.map(slug => fetchIconAsDataUrl(slug)))
          .then(dataUrls => {
            const iconDataUrls = {};
            slugs.forEach((slug, i) => { if (dataUrls[i]) iconDataUrls[slug] = dataUrls[i]; });
            sendResponse({ success: true, data, iconDataUrls });
          })
          .catch(() => sendResponse({ success: true, data, iconDataUrls: {} }));
      })
      .catch(err => {
        console.error('Erro no fetch do background:', err);
        sendResponse({ success: false, error: err.toString() });
      });
    return true;
  }

  // Histórico de preço via API (backend chama ITAD History log)
  if (request.type === 'buscarHistorico') {
    const plain = request.plain;
    const country = request.country || 'BR';

    if (!plain) {
      sendResponse({ success: true, data: [] });
      return true;
    }

    const url = `${API_BASE}/api/history?plain=${encodeURIComponent(plain)}&country=${encodeURIComponent(country)}`;
    fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => res.ok ? res.json() : [])
      .then(raw => {
        const data = Array.isArray(raw) ? historicoITADParaChart(raw) : [];
        sendResponse({ success: true, data });
      })
      .catch(err => {
        console.error('Erro ao buscar histórico:', err);
        sendResponse({ success: true, data: [] });
      });
    return true;
  }
});

// Listener para badge/ícone (MV3: action; MV2: browserAction)
const actionAPI = browserAPI.action || browserAPI.browserAction;
browserAPI.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.acao === 'abrirPopup' && actionAPI) {

    if (actionAPI.setBadgeText) {
      actionAPI.setBadgeText({ text: '!' });
      actionAPI.setBadgeBackgroundColor({ color: '#f43f5e' });
      setTimeout(() => {
        actionAPI.setBadgeText({ text: '' });
        actionAPI.setIcon({
          path: {
            "16": "icons/icon.png",
            "32": "icons/icon.png",
            "48": "icons/icon.png",
            "128": "icons/icon.png"
          }
        });
      }, 5000);
    }
  }
});

if (browserAPI.runtime.onInstalled) {
  browserAPI.runtime.onInstalled.addListener(() => {
    console.log('NoobPrice instalado/atualizado');
  });
}