import { createConnection } from 'typeorm';

async function startApp() {
  try {
    const connection: Connection = await createConnection();
    console.log('Conexão com o banco de dados estabelecida com sucesso!');

    // Outras operações com o TypeORM aqui
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
  }
}

startApp();
