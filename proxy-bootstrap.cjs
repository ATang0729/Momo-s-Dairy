const { bootstrap } = require('global-agent');
process.env.GLOBAL_AGENT_HTTP_PROXY = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
process.env.GLOBAL_AGENT_NO_PROXY = 'localhost,127.0.0.1';
bootstrap();
console.error('[global-agent] bootstrapped with proxy:', process.env.GLOBAL_AGENT_HTTP_PROXY);
