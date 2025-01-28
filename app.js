const config = require('./config/index.config.js');
const Cortex = require('ion-cortex');
const ManagersLoader = require('./loaders/ManagersLoader.js');

// Initialize dependencies
const cache = require('./cache/cache.dbh')({
    prefix: config.dotEnv.CACHE_PREFIX,
    url: config.dotEnv.CACHE_REDIS
});

const cortex = new Cortex({
    prefix: config.dotEnv.CORTEX_PREFIX,
    url: config.dotEnv.CORTEX_REDIS,
    type: config.dotEnv.CORTEX_TYPE,
    state: () => ({}),
    activeDelay: "50ms",
    idlDelay: "200ms",
});

// Initialize MongoDB if configured
if (config.dotEnv.MONGO_URI) {
    require('./connect/mongo')({ uri: config.dotEnv.MONGO_URI });
}

// Load managers
const managersLoader = new ManagersLoader({ config, cache, cortex });
const managers = managersLoader.load();

// Export Express app for testing
const app = managers.userServer.getApp();

// Start server only when not in test environment
if (process.env.NODE_ENV !== 'test' && require.main === module) {
    managers.userServer.run();
}

module.exports = app;