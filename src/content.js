if (document.body) {
  setTimeout(() => {
    const script = document.createElement('script');
    script.src = chrome.extension.getURL('/js/attach_target.js');
    document.body.appendChild(script);
  }, 150)
}
