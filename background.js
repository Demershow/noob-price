
const API_KEY = "ae0c88d2cc4a4abe683f2a32fa59566d926ec34f"

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'buscarOfertas') {
    const plain = request.plain;
    const reqBody = [plain]

    fetch(`https://api.isthereanydeal.com/games/prices/v3?key=${API_KEY}&country=BR`, {
      method: 'POST',
      headers: {
        'Content-type': "application/json"
      },
      body: JSON.stringify(reqBody)
    })
      .then(res => res.json())
      .then(data => {
        sendResponse({ success: true, data });
      })
      .catch(err => {
        console.error('Erro no fetch do background:', err);
        sendResponse({ success: false, error: err.toString() });
      });
    return true;
  }
});



chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.acao === 'abrirPopup') {
    chrome.action.setBadgeText({ text: '!' });
    chrome.action.setBadgeBackgroundColor({ color: '#f43f5e' });

    chrome.action.setIcon({
      path: {
        "16": "icons/epicgames.png",
        "32": "icons/epicgames.png",
        "48": "icons/epicgames.png",
        "128": "icons/epicgames.png"
      }
    });

    setTimeout(() => {
      chrome.action.setBadgeText({ text: '' });
      chrome.action.setIcon({
        path: {
          "16": "icons/icon.png",
          "32": "icons/icon.png",
          "48": "icons/icon.png",
          "128": "icons/icon.png"
        }
      });
    }, 5000);
  }
});
