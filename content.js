(function() {
  if (window.hasReadAloudListener) return;
  window.hasReadAloudListener = true;

  let highlightElements = [];
  let overlayElement = null;
  let chunksData = []; 
  let activeNodesMap = null;

  function clearHighlights() {
    if (overlayElement) {
      overlayElement.remove();
      overlayElement = null;
    }
    document.querySelectorAll('.read-aloud-highlight').forEach(el => {
      el.classList.remove('read-aloud-highlight');
    });
    document.body.classList.remove('reading-active');
    
    if (CSS.highlights) {
        CSS.highlights.delete('read-aloud-word');
    }
  }

  function applyHighlight(index) {
    clearHighlights();
    
    if (index >= 0 && index < highlightElements.length) {
      const el = highlightElements[index];
      if (el) {
          el.classList.add('read-aloud-highlight');
          
          overlayElement = document.createElement('div');
          overlayElement.className = 'read-aloud-overlay';
          document.body.appendChild(overlayElement);
          document.body.classList.add('reading-active');

          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      if (chunksData[index]) {
          activeNodesMap = chunksData[index].nodesMap;
      }
    }
  }

  function highlightWord(charIndex, length) {
    if (!activeNodesMap || !CSS.highlights) return;

    let startNode = null;
    let startOffset = 0;
    let endNode = null;
    let endOffset = 0;

    for (const map of activeNodesMap) {
      if (!startNode && charIndex >= map.start && charIndex < map.start + map.length) {
        startNode = map.node;
        startOffset = map.nodeStartOffset + (charIndex - map.start);
      }
      
      if (startNode) {
        if ((charIndex + length) <= map.start + map.length) {
          endNode = map.node;
          endOffset = map.nodeStartOffset + ((charIndex + length) - map.start);
          break;
        } else {
          endNode = map.node;
          endOffset = map.nodeStartOffset + map.length;
        }
      }
    }

    if (startNode && endNode) {
      try {
        const range = new Range();
        range.setStart(startNode, startOffset);
        range.setEnd(endNode, endOffset);
        
        const highlight = new Highlight(range);
        CSS.highlights.set('read-aloud-word', highlight);
      } catch (e) {
        console.error("Failed to highlight word", e);
      }
    }
  }

  function extractTextNodesAndString(element) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node) {
        const parent = node.parentElement;
        if (parent && ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodesMap = [];
    let fullText = '';
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const text = node.nodeValue;
      if (text.length > 0) {
        nodesMap.push({ node: node, nodeStartOffset: 0, start: fullText.length, length: text.length });
        fullText += text;
      }
    }
    return { nodesMap, text: fullText };
  }

  function extractParagraphs() {
    highlightElements = [];
    chunksData = [];
    const textElements = Array.from(document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote'));
    const filtered = [];
    for (const el of textElements) {
      if (el.innerText.trim().length > 0 && el.offsetParent !== null) {
        filtered.push(el);
      }
    }
    
    const finalElements = filtered.filter(el => {
      return !filtered.some(other => other !== el && el.contains(other));
    });

    const chunks = [];
    finalElements.forEach((el, index) => {
      highlightElements.push(el);
      const extracted = extractTextNodesAndString(el);
      chunksData.push({ nodesMap: extracted.nodesMap });
      chunks.push({ text: extracted.text, index: index });
    });
    
    return chunks;
  }

  function handleSelectionRead() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    let container = range.commonAncestorContainer;
    if (container.nodeType === Node.TEXT_NODE) {
      container = container.parentElement;
    }

    const blockEl = container.closest('p, h1, h2, h3, h4, h5, h6, li, blockquote, div') || container;
    
    highlightElements = [blockEl];
    
    // For selection, we extract text nodes but bound them to the range
    const walker = document.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node) {
        if (range.intersectsNode(node)) {
            const parent = node.parentElement;
            if (parent && ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_REJECT;
      }
    });

    const nodesMap = [];
    let fullText = '';
    while (walker.nextNode()) {
      const node = walker.currentNode;
      let text = node.nodeValue;
      let startOffset = 0;
      let endOffset = text.length;

      if (node === range.startContainer) {
        startOffset = range.startOffset;
      }
      if (node === range.endContainer) {
        endOffset = range.endOffset;
      }

      text = text.substring(startOffset, endOffset);
      if (text.length > 0) {
          nodesMap.push({ node: node, nodeStartOffset: startOffset, start: fullText.length, length: text.length });
          fullText += text;
      }
    }

    chunksData = [{ nodesMap: nodesMap }];
    
    if (fullText.trim().length > 0) {
      chrome.runtime.sendMessage({ command: 'play-chunks', chunks: [{ text: fullText, index: 0 }] });
    }
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.command === 'request-page-read') {
      const selection = window.getSelection().toString().trim();
      if (selection.length > 0) {
         handleSelectionRead();
      } else {
         const chunks = extractParagraphs();
         if (chunks.length > 0) {
           chrome.runtime.sendMessage({ command: 'play-chunks', chunks: chunks });
         } else {
           const extracted = extractTextNodesAndString(document.body);
           highlightElements = [document.body];
           chunksData = [{ nodesMap: extracted.nodesMap }];
           chrome.runtime.sendMessage({ command: 'play-chunks', chunks: [{ text: extracted.text, index: 0 }] });
         }
      }
    } else if (request.command === 'highlight') {
      applyHighlight(request.index);
    } else if (request.command === 'highlight-word') {
      highlightWord(request.charIndex, request.length);
    } else if (request.command === 'stop-highlight') {
      clearHighlights();
    }
  });

  let autoReadEnabled = false;
  chrome.storage.local.get(['autoRead'], (result) => {
    autoReadEnabled = result.autoRead || false;
  });
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.autoRead) {
      autoReadEnabled = changes.autoRead.newValue;
    }
  });

  document.addEventListener('mouseup', () => {
    if (!autoReadEnabled) return;
    setTimeout(() => {
      const selectedText = window.getSelection().toString().trim();
      if (selectedText.length > 0) {
        handleSelectionRead();
      }
    }, 150);
  });
})();