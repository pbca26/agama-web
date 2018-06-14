# agama-web

### How to run
npm install
npm run

### How to build production version
npm run build

Compiled files are going to be placed in build dir.

### Backend
Agama web relies on Electrum proxy nodes to communicate with Electrum servers. You can either run your own proxies or use what's already hardcoded in the web wallet.

In order to use your own proxy modify the following file src/util/proxyServers.js

Electrum proxy source code is available here https://github.com/pbca26/electrum-proxy