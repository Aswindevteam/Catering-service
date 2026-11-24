export const environment = {
  production: true,
  apiUrl:
    typeof window !== 'undefined' && window.location.hostname.includes('pages.dev')
      ? 'https://wedding-feast-backend.aswinsamidurai.workers.dev/api'
      : '/api',
};
