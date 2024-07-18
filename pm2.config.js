module.exports = {
  apps: [
    {
      name: 'AchaPromoAPI',
      script: 'dist/shared/http/server.js',
      user: 'root',
      exec_mode: 'cluster',
      watch: true,
      max_memory_restart: '24G',
      //Agora vai
    },
  ],
};
