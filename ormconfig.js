module.exports = {
  type: process.env.DB_TYPE,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  logging: process.env.DB_LOGGING,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [process.env.ORM_ENTITIES],
  migrations: [process.env.ORM_MIGRATIONS],
  cli: {
    migrationsDir: process.env.ORM_MIGRATIONS_DIR,
  },
};
