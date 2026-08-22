export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'beresin_super_secret_jwt_key_2026',
    expiresIn: process.env.JWT_EXPIRATION || '7d',
  },
  database: {
    host: process.env.DATABASE_HOST || '116.212.73.22',
    port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || 'terserah',
    name: process.env.DATABASE_NAME || 'beresin_db',
  },
  redis: {
    enabled: process.env.REDIS_ENABLED === 'true',
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  clickhouse: {
    enabled: process.env.CLICKHOUSE_ENABLED === 'true',
    host: process.env.CLICKHOUSE_HOST || '127.0.0.1',
    port: parseInt(process.env.CLICKHOUSE_PORT || '8123', 10),
    database: process.env.CLICKHOUSE_DATABASE || 'beresin_analytics',
    user: process.env.CLICKHOUSE_USER || 'default',
    password: process.env.CLICKHOUSE_PASSWORD || '',
  },
});
