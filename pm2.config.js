module.exports = {
    /**
     * Application configuration section
     * http://pm2.keymetrics.io/docs/usage/application-declaration/
     */
    apps: [{
        name: 'nodle-app',
        watch: true,
        instances: 'max',
        exec_mode: 'cluster',
        script: './server.js',
        max_memory_restart: '1500M',
        listen_timeout: 40000
    }]
};
