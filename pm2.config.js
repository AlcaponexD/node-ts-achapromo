module.exports = {
  apps: [
    {
      name: 'AchaPromoAPI',
      script: 'dist/shared/http/server.js',
      user: 'ubuntu',
      // Outras configurações do PM2, se houver
    },
  ],
};
