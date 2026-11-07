import type { SoundDemo } from '#shared/types'

/**
 * Sons gerados com Web Audio — sem arquivos externos.
 * Notas/demonstrações sempre tocam (ação do usuário); efeitos podem ser silenciados.
 */

let ctx: AudioContext | null = null
let master: GainNode | null = null

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.9
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return { c: ctx, out: master! }
}

interface ToneOpts {
  start?: number
  dur?: number
  type?: OscillatorType
  vol?: number
  attack?: number
  filter?: number
}

function tone(freq: number, o: ToneOpts = {}) {
  const { c, out } = audio()
  const { start = 0, dur = 0.5, type = 'triangle', vol = 0.22, attack = 0.012, filter } = o
  const t = c.currentTime + start + 0.01
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  let node: AudioNode = osc
  if (filter) {
    const f = c.createBiquadFilter()
    f.type = 'lowpass'
    f.frequency.value = filter
    osc.connect(f)
    node = f
  }
  node.connect(g).connect(out)
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

/** Timbre suave tipo "piano de brinquedo" */
function pianoNote(midi: number, start = 0, dur = 0.7, vol = 0.22) {
  const f = midiToFreq(midi)
  tone(f, { start, dur, type: 'triangle', vol })
  tone(f * 2, { start, dur: dur * 0.6, type: 'sine', vol: vol * 0.25 })
}

const MUTE_KEY = 'trilha:muted'
const muted = ref(false)
let mutedLoaded = false

export function useAudio() {
  if (import.meta.client && !mutedLoaded) {
    mutedLoaded = true
    try {
      muted.value = localStorage.getItem(MUTE_KEY) === '1'
    } catch {}
  }

  function toggleMute() {
    muted.value = !muted.value
    try {
      localStorage.setItem(MUTE_KEY, muted.value ? '1' : '0')
    } catch {}
  }

  function playMidi(midi: number, dur = 0.7) {
    pianoNote(midi, 0, dur)
  }

  function playSequence(midis: number[], step = 0.32, dur = 0.5) {
    midis.forEach((m, i) => pianoNote(m, i * step, dur))
    return midis.length * step * 1000
  }

  /** Toca uma demonstração e retorna a duração em ms */
  function playDemo(kind: SoundDemo): number {
    const C4 = 60
    switch (kind) {
      case 'melody':
        return playSequence([C4, C4 + 4, C4 + 7, C4 + 12, C4 + 7], 0.34, 0.45)
      case 'harmony':
        ;[C4, C4 + 4, C4 + 7, C4 + 12].forEach((m) => pianoNote(m, 0, 1.6, 0.16))
        return 1600
      case 'rhythm': {
        // longo, curto, curto, (silêncio), longo
        const beats: [number, number][] = [
          [0, 0.55],
          [0.6, 0.18],
          [0.9, 0.18],
          [1.6, 0.6],
        ]
        beats.forEach(([s, d]) => pianoNote(C4 + 7, s, d, 0.24))
        return 2300
      }
      case 'timbre': {
        const f = midiToFreq(C4 + 9)
        tone(f, { start: 0, dur: 0.9, type: 'sine', vol: 0.3 })
        tone(f, { start: 1.0, dur: 0.9, type: 'sawtooth', vol: 0.14, filter: 2200 })
        tone(f, { start: 2.0, dur: 0.9, type: 'square', vol: 0.09, filter: 1600 })
        return 3000
      }
      case 'duration':
        pianoNote(C4 + 7, 0, 0.18)
        pianoNote(C4 + 7, 0.6, 1.8)
        return 2400
      case 'pitch':
        pianoNote(C4 - 12, 0, 0.7, 0.3)
        pianoNote(C4 + 4, 0.75, 0.7)
        pianoNote(C4 + 24, 1.5, 0.8, 0.18)
        return 2300
      case 'intensity':
        pianoNote(C4 + 7, 0, 0.9, 0.035)
        pianoNote(C4 + 7, 1.0, 0.9, 0.38)
        return 1900
    }
  }

  const sfx = {
    correct() {
      if (muted.value) return
      tone(midiToFreq(76), { dur: 0.16, type: 'triangle', vol: 0.18 })
      tone(midiToFreq(81), { start: 0.09, dur: 0.3, type: 'triangle', vol: 0.18 })
    },
    wrong() {
      if (muted.value) return
      tone(midiToFreq(50), { dur: 0.16, type: 'square', vol: 0.06, filter: 900 })
      tone(midiToFreq(46), { start: 0.13, dur: 0.3, type: 'square', vol: 0.06, filter: 900 })
    },
    complete() {
      if (muted.value) return
      ;[72, 76, 79, 84].forEach((m, i) => pianoNote(m, i * 0.11, 0.5, 0.18))
      ;[72, 76, 79, 84].forEach((m) => pianoNote(m, 0.5, 1.2, 0.08))
    },
    tap() {
      if (muted.value) return
      tone(1200, { dur: 0.04, type: 'sine', vol: 0.05, attack: 0.003 })
    },
    combo() {
      if (muted.value) return
      ;[79, 84, 88].forEach((m, i) => tone(midiToFreq(m), { start: i * 0.06, dur: 0.18, type: 'triangle', vol: 0.12 }))
    },
  }

  return { muted, toggleMute, playMidi, playSequence, playDemo, sfx }
}
