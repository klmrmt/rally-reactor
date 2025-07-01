module.exports = {
    migrationsTable: 'pgmigrations',
    dir: 'migrations',
    direction: 'up',
    count: Infinity,
    databaseUrl: {
      host: 'localhost',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: 'kyle' // match docker-compose POSTGRES_PASSWORD
    }
  }