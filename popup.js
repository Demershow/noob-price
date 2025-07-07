
document.addEventListener('DOMContentLoaded', async () => {
  const resultsDiv = document.getElementById("results");

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const el = document.querySelector('.apphub_AppName');
      return el ? el.textContent.trim() : null;
    }
  }, async (injectionResults) => {
    const nomeDoJogo = injectionResults[0].result;

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

      const html = ofertas
        .filter(oferta => oferta.cut > 0)
        .map(oferta => {
          const preco = oferta.price.amount.toFixed(2);
          const precoAntigo = oferta.regular.amount.toFixed(2);
          const desconto = oferta.cut;

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
            "2game": "2game"
          };

          const icon = storeIconMap[oferta.shop.name] || 'unknown';
          const iconUrl = `icons/${icon}.png`;




          return `
        <div class="oferta">
          <img src="${iconUrl}" alt="${oferta.shop.name}" width="24" height="24">
          <div class="info">
            <strong>${oferta.shop.name}</strong><br>
            <span class="preco">R$ ${preco} <s>R$ ${precoAntigo}</s> (${desconto}% OFF)</span><br>
            <a href="${oferta.url}" target="_blank">Ver oferta</a>
          </div>
        </div>
      `;
        })
        .join('');

      resultsDiv.innerHTML = html || "Sem promoções ativas no momento.";

    } catch (err) {
      console.error(err);
      resultsDiv.textContent = "Erro ao buscar os dados.";
    }
  });
});

async function buscarPlain(nome) {
  const url = new URL('http://localhost:3000/api/search');
  url.searchParams.append('title', nome);

  const res = await fetch(url.toString());
  if (!res.ok) {
    console.error('Erro na busca:', res.status, res.statusText);
    return null;
  }

  const json = await res.json();

  const jogo = json[0]

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

