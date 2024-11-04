module.exports = {
  apps: [
    {
      name: 'AchaPromoAPI',
      script: 'dist/shared/http/server.js',
      user: 'ubuntu',
      watch: false,
      max_memory_restart: '24G',
      env_file: '.env',  // Especifica o arquivo .env existente
    },
  ],
};
