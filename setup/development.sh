export NODE_ENV=development
yarn install
pm2 start pm2.config.js && pm2 logs