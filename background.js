
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'buscarOfertas') {
    const plain = request.plain;


    fetch(`http://localhost:3000/api/deals?plain=${plain}`, {
      method: 'GET',
      headers: {
        'Content-type': "application/json"
      },
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
