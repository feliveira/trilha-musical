// Mede a "tinta" real de um glifo musical (a caixa do SVG <text> só mostra a altura da fonte),
// para centralizar pausas e outros símbolos com precisão.

interface GlyphMetrics {
  asc: number
  desc: number
  left: number
  right: number
}

const ready = ref(false)
let started = false
const cache = new Map<string, GlyphMetrics>()
let canvasCtx: CanvasRenderingContext2D | null = null

export function useGlyphMetrics() {
  if (import.meta.client && !started) {
    started = true
    document.fonts
      .load('48px "Noto Music"', '\u{1D13D}\u{1D11E}')
      .catch(() => {})
      .finally(() => {
        cache.clear()
        ready.value = true
      })
  }

  function measure(glyph: string, size = 48): GlyphMetrics {
    void ready.value // reavalia quando a fonte terminar de carregar
    const key = `${glyph}@${size}@${ready.value}`
    const hit = cache.get(key)
    if (hit) return hit
    if (!import.meta.client) return { asc: size * 0.5, desc: size * 0.5, left: 0, right: size * 0.5 }
    canvasCtx ??= document.createElement('canvas').getContext('2d')
    const c = canvasCtx!
    c.font = `${size}px "Noto Music"`
    const m = c.measureText(glyph)
    const res = {
      asc: m.actualBoundingBoxAscent,
      desc: m.actualBoundingBoxDescent,
      left: m.actualBoundingBoxLeft,
      right: m.actualBoundingBoxRight,
    }
    cache.set(key, res)
    return res
  }

  /** Posição (x, y da linha de base) para que o centro da tinta fique em (cx, cy) */
  function centerAt(glyph: string, cx: number, cy: number, size = 48) {
    const m = measure(glyph, size)
    return { x: cx - (m.right - m.left) / 2, y: cy + (m.asc - m.desc) / 2, height: m.asc + m.desc }
  }

  return { measure, centerAt, ready }
}
