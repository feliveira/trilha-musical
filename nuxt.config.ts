// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  devtools: { enabled: false },

  // Login fica no localStorage, então renderizamos só no cliente (SPA).
  // As rotas /api continuam rodando como funções serverless na Vercel.
  ssr: false,

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Defina via variáveis de ambiente: NUXT_MONGODB_URI e NUXT_MONGODB_DB
    mongodbUri: '',
    mongodbDb: 'trilha-musical',
  },

  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      title: 'Trilha Musical',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'Aprenda teoria musical de forma divertida, um módulo por vez.' },
        { name: 'theme-color', content: '#f4f6f9' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Nunito:wght@500;600;700;800;900&family=Noto+Music&display=swap',
        },
      ],
    },
  },
})
