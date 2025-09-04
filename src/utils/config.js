const config = {
  app: {
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 5000,
  },
  rabbitMq: {
    server: process.env.RABBITMQ_SERVER || 'amqp://localhost',
  },
  redis: {
    host: process.env.REDIS_SERVER || 'localhost',
  },
  jwt: {
    accessTokenKey: process.env.ACCESS_TOKEN_KEY || '',
    refreshTokenKey: process.env.REFRESH_TOKEN_KEY || '',
    accessTokenAge: process.env.ACCESS_TOKEN_AGE || 100,
  }
};

module.exports = config;