const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Define o caminho para o diretório de logs
const logsDirectory = path.join(__dirname, 'logs');

// Cria o diretório de logs se não existir
if (!fs.existsSync(logsDirectory)) {
    fs.mkdirSync(logsDirectory);
}

// Configuração do logger
const logger = winston.createLogger({
    level: 'error',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(logsDirectory, 'error.log'),
            level: 'error',
            format: winston.format.json(),
        })
    ],
},);

module.exports = logger;