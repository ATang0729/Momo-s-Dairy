try {
  const { HttpsProxyAgent } = require('https-proxy-agent');
  const { HttpProxyAgent } = require('http-proxy-agent');
  const https = require('https');
  const http = require('http');
  const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy;
  if (proxyUrl) {
    const httpsAgent = new HttpsProxyAgent(proxyUrl);
    const httpAgent = new HttpProxyAgent(proxyUrl);
    const origHttps = https.request;
    https.request = function(opts, cb) {
      if (typeof opts === 'string') opts = require('url').parse(opts);
      if (!opts.agent) opts.agent = httpsAgent;
      return origHttps.call(https, opts, cb);
    };
    const origHttp = http.request;
    http.request = function(opts, cb) {
      if (typeof opts === 'string') opts = require('url').parse(opts);
      if (!opts.agent) opts.agent = httpAgent;
      return origHttp.call(http, opts, cb);
    };
    console.error('[proxy-patch] injected proxy agent:', proxyUrl);
  }
} catch (e) {
  console.error('[proxy-patch] failed:', e.message);
}
