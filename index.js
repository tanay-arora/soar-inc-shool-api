const config          = require('./config/index.config.js');
const mongoose        = require('mongoose');
const Cortex          = require('ion-cortex');
const ManagersLoader  = require('./loaders/ManagersLoader.js');
const Aeon            = require('aeon-machine');

// Handle uncaught exceptions/rejections
process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err, err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at', promise, 'reason:', reason);
  process.exit(1);
});

// Initialize Redis cache
const cache = require('./cache/cache.dbh')({
  prefix: config.dotEnv.CACHE_PREFIX,
  url: config.dotEnv.CACHE_REDIS
});

// Initialize Oyster DB
const Oyster = require('oyster-db');
const oyster = new Oyster({
  url: config.dotEnv.OYSTER_REDIS,
  prefix: config.dotEnv.OYSTER_PREFIX
});

// Initialize Cortex
const cortex = new Cortex({
  prefix: config.dotEnv.CORTEX_PREFIX,
  url: config.dotEnv.CORTEX_REDIS,
  type: config.dotEnv.CORTEX_TYPE,
  state: () => ({}),
  activeDelay: '50',
  idlDelay: '200'
});

const aeon = new Aeon({ cortex, timestampFrom: Date.now(), segmantDuration: 500 });

const mongoUri = config.dotEnv.MONGO_URI;
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log(`Connected to MongoDB`);
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});

const managersLoader = new ManagersLoader({ config, cache, cortex, oyster, aeon });
const managers = managersLoader.load();

managers.userServer.run();
