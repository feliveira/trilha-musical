// Libera o áudio no primeiro toque (necessário no iPhone/iPad)
export default defineNuxtPlugin(() => {
  installAudioUnlock()
})
