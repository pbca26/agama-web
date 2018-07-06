// web app config
let Config = {
  version: '0.1.7',
  debug: true,
  defaultLang: 'EN',
  roundValues: false,
  // single coin option
  whitelabel: false,
};

export const devlog = (msg, data) => {
  if (Config.dev ||
      Config.debug) {
    if (data) {
      console.warn(msg, data);
    } else {
      console.warn(msg);
    }
  }
};

Config.log = devlog;

export default Config;