export const environment = {
  production: false,
  useMock: true,                          // Toggle for using mock data
  apiBase: '/api',                        // gateway reverse-proxy path
  keycloak: {
    url: 'http://localhost:8081/',        // Keycloak container external URL (adjust if different)
    realm: 'finance',
    clientId: 'finance-web'
  }
};
