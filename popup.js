document.addEventListener('DOMContentLoaded', async () => {
  const resultsDiv = document.getElementById("results");

  // Pega a aba ativa
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Executa o content.js dinamicamente e coleta o retorno
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const gameNameElement = document.querySelector('.apphub_AppName');
      return gameNameElement ? gameNameElement.textContent.trim() : null;
    }
  }, (injectionResults) => {
    const result = injectionResults[0].result;

    if (result) {
      buscarPrecos(result);
    } else {
      resultsDiv.textContent = "Não foi possível identificar o jogo.";
    }
  });
});

function buscarPrecos(nomeDoJogo) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.textContent = `Buscando preços para: ${nomeDoJogo}`;

  fetch(`https://www.cheapshark.com/api/1.0/deals?title=${encodeURIComponent(nomeDoJogo)}&exact=0`)
    .then(res => res.json())
    .then(deals => {
      if (deals.length === 0) {
        resultsDiv.textContent = "Jogo não encontrado em outras lojas.";
        return;
      }

      const ofertas = deals.slice(0, 5).map(deal => {
        return `
          <div>
            <strong>Loja #${deal.storeID}</strong>: $${deal.salePrice}
            <a href="https://www.cheapshark.com/redirect?dealID=${deal.dealID}" target="_blank">[Ver]</a>
          </div>
        `;
      });

      resultsDiv.innerHTML = ofertas.join('');
    })
    .catch(err => {
      console.error(err);
      resultsDiv.textContent = "Erro ao buscar os preços.";
    });
}
