export NODE_ENV=staging
yarn install
pm2 start pm2.config.js && pm2 logs