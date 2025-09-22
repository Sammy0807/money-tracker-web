export const environment = {
  production: true,
  useMock: false,                         // Disable mock in production
  apiBase: '/api',
  keycloak: {
    url: 'https://auth.yourdomain.com/',  // prod Keycloak URL
    realm: 'finance',
    clientId: 'finance-web'
  }
};
