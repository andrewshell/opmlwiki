require('dotenv').config()

const config = {};

config.port = process.env.PORT || 3000;
config.baseHref = process.env.BASE_HREF || `http://localhost:${config.port}/`;

module.exports = config;
