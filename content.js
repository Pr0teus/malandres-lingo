function replaceWordsInTextNode(node, dictionary) {
    let originalText = node.nodeValue;
    let newText = originalText;
    let replaced = false;
  
    for (let key in dictionary) {
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      const replacements = dictionary[key];
      if (Array.isArray(replacements)) {
        newText = newText.replace(regex, () => replacements[Math.floor(Math.random() * replacements.length)]);
      } else {
        newText = newText.replace(regex, replacements);
      }
  
      if (newText !== originalText) {
        replaced = true;
      }
    }
  
    if (replaced) {
      node.nodeValue = newText;
    }
  }
  
  function replaceWordsInElement(element, dictionary) {
    let originalText = element.textContent;
    let newText = originalText;
    let replaced = false;
  
    for (let key in dictionary) {
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      const replacements = dictionary[key];
      if (Array.isArray(replacements)) {
        newText = newText.replace(regex, () => replacements[Math.floor(Math.random() * replacements.length)]);
      } else {
        newText = newText.replace(regex, replacements);
      }
  
      if (newText !== originalText) {
        replaced = true;
      }
    }
  
    if (replaced) {
      element.textContent = newText;
    }
  }
  
  function replaceWordsInInputElement(element, dictionary) {
    const cursorPosition = element.selectionStart;
    let originalText = element.value;
    let newText = originalText;
    let replaced = false;
  
    for (let key in dictionary) {
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      const replacements = dictionary[key];
      if (Array.isArray(replacements)) {
        newText = newText.replace(regex, () => replacements[Math.floor(Math.random() * replacements.length)]);
      } else {
        newText = newText.replace(regex, replacements);
      }
  
      if (newText !== originalText) {
        replaced = true;
      }
    }
  
    if (replaced) {
      element.value = newText;
      // Restore cursor position after the replaced text
      element.selectionStart = element.selectionEnd = cursorPosition;
    }
  }
  
  function walkAndReplace(node, dictionary) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.parentElement && node.parentElement.hasAttribute('data-lexical-text')) {
        replaceWordsInTextNode(node, dictionary);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') {
        replaceWordsInInputElement(node, dictionary);
      } else if (node.hasAttribute('data-lexical-text')) {
        const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
        let currentNode;
        while ((currentNode = walker.nextNode())) {
          replaceWordsInTextNode(currentNode, dictionary);
        }
      }
    }
  }
  
  function observeDOM(dictionary) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => walkAndReplace(node, dictionary));
        } else if (mutation.type === 'characterData') {
          if (mutation.target.parentElement && mutation.target.parentElement.hasAttribute('data-lexical-text')) {
            replaceWordsInTextNode(mutation.target, dictionary);
          }
        } else if (mutation.type === 'attributes' && mutation.attributeName === 'data-lexical-text') {
          walkAndReplace(mutation.target, dictionary);
        }
      });
    });
  
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true });
  
    document.addEventListener('input', (event) => {
      const target = event.target;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        replaceWordsInInputElement(target, dictionary);
      }
    });
  }
  
  chrome.runtime.sendMessage({ action: "getDictionary" }, (dictionary) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message);
      return;
    }
    
    walkAndReplace(document.body, dictionary);
    observeDOM(dictionary);
  });
  