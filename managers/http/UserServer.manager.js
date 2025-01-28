const http = require('http');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

module.exports = class UserServer {
    constructor({ config, managers }) {
        this.config = config;
        this.managers = managers;
        this.userApi = managers.userApi;
        this.app = express();  // Create Express app instance here
        
        // Configure middleware in constructor
        this.configureMiddleware();
    }

    configureMiddleware() {
        const apiLimiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 100,
            standardHeaders: true,
            legacyHeaders: false,
            message: {
                ok: false,
                errors: 'Too many requests, please try again later'
            }
        });

        this.app.use(cors({ origin: '*' }));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use('/static', express.static('public'));
        this.app.use('/api/', apiLimiter);
        this.app.all('/api/:moduleName/:fnName', this.userApi.mw);

        // Error handler middleware
        this.app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).send('Something broke!');
        });
    }

    getApp() {
        return this.app;
    }

    run() {
        const server = http.createServer(this.app);
        return server.listen(this.config.dotEnv.USER_PORT, () => {
            console.log(`${this.config.dotEnv.SERVICE_NAME.toUpperCase()} running on: ${this.config.dotEnv.USER_PORT}`);
        });
    }
}