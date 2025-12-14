export function popupInit() {
  window.chrome = {        
    runtime: { lastError: null },
    storage: {
      session: {
        get: (_keys, cb) => { cb({}) },
        set: (_items, cb) => { cb() },
      },
      sync: {
        get: (_keys, cb) => { cb({}) },
        set: (_items, cb) => { cb() },
      },
      local: {
        get: (_keys, cb) => { cb({}) },
        set: (_items, cb) => { cb() },
      },
    },
    tabs: {
      query: async () => {
        return [{
          id: 1,
          url: 'https://ap-northeast-1.console.aws.amazon.com/console/home?region=ap-northeast-1#',
        }];
      },
      update: async () => {},
      sendMessage: async (tabId, { action, data }) => {
        if (action === 'loadInfo') {
          return {
            loginDisplayNameAccount: "login-account",
            loginDisplayNameUser: "login-user",
            roleDisplayNameAccount: "role-account",
            roleDisplayNameUser: "role-user",
          }
        } else if (action === 'switch') {
          return {
            url: 'https://console.aws.amazon.com/next',
          };
        }
      },
    }
  }
}
