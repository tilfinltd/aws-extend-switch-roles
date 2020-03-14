chrome = {
  extension: {
    getURL: function(){}
  },
  storage: {
    sync: {
      get: function(names, cb){
        cb(this.data)
      },
      set: function(data, cb){
        this.data = data;
        if (cb) cb();
      },
      remove: function(key, cb) {
        this.data[key] = null;
        if (cb) cb();
      },
      data: {}
    }
  }
};
browser = {
  runtime: {
    sendMessage: function(message) {
      return Promise.resolve(this.data[message.action]);
    },
    data: { 
      'get-current-tab-context': ''
    }
  },
}

function loadFixtures(html, json) {
  const args = [`${html}.html`];
  if (json) args.push(`${json}.json`);
  this.result = fixture.load(...args);

  document.body.className = (document.getElementById('AESR_Body') || {}).className || '';
  chrome.storage.sync.data = this.result.length === 2 ? this.result[1] : {};
}

fixture.setBase('test/fixtures');

afterEach(() => {
  fixture.cleanup()
});
