chrome.runtime.onInstalled.addListener(() => {
  console.log("Malandres tá rodando!.");
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getDictionary") {
    fetch(chrome.runtime.getURL("dict/persona1.json"))
      .then(response => response.json())
      .then(data => {
        sendResponse(data);
      })
      .catch(error => console.error("deu ruim:", error));
    return true;
  }
});