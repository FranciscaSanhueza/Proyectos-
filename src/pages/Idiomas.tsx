import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Hand, Languages, Phone } from 'lucide-react'
import { ReadAloud } from '../components/ReadAloud'
import { LevelFace } from '../components/LevelFace'
import type { Level } from '../types'

interface Content {
  name: string
  lang: string
  title: string
  intro: string
  listen: string
  stop: string
  levelsTitle: string
  levels: Record<Level, string>
  alarmTitle: string
  alarms: string[]
  caresTitle: string
  cares: string[]
  emergency: string
}

// Información esencial (semáforo, signos de alarma y cuidados) para pacientes
// que no hablan español. Traducciones referenciales: deben revisarlas
// intérpretes o facilitadores interculturales antes de usarse con pacientes.
const LANGS: Record<'en' | 'ht', Content> = {
  en: {
    name: 'English',
    lang: 'en-US',
    title: 'Essential information in English',
    intro: 'The most important information for your recovery after the procedure.',
    listen: 'Listen',
    stop: 'Stop',
    levelsTitle: 'Symptom traffic light',
    levels: {
      verde: 'Green: expected symptoms. Keep following your plan.',
      amarillo: 'Yellow: watch closely. Write to your care team in the chat.',
      rojo: 'Red: go to the emergency room now or call SAMU 131.',
    },
    alarmTitle: 'When to seek urgent care',
    alarms: [
      'Severe pain that does not improve with painkillers',
      'Fever over 38 °C (100.4 °F)',
      'Heavy bleeding (more than a period)',
      'Foul-smelling discharge',
    ],
    caresTitle: 'Daily care',
    cares: [
      'Relative rest',
      'Avoid intense effort and lifting heavy objects',
      'No tampons or sexual intercourse for 4 weeks',
      'Shower daily; avoid bathtubs and swimming pools',
      'Watch for bleeding or discharge',
      'Record your symptoms in the weekly survey',
    ],
    emergency: 'Emergency: call 131 (SAMU)',
  },
  ht: {
    name: 'Kreyòl ayisyen',
    lang: 'ht-HT',
    title: 'Enfòmasyon esansyèl an kreyòl',
    intro: 'Enfòmasyon ki pi enpòtan pou rekiperasyon ou apre pwosedi a.',
    listen: 'Koute',
    stop: 'Kanpe',
    levelsTitle: 'Semafò sentòm yo',
    levels: {
      verde: 'Vèt: sentòm nòmal. Kontinye swiv plan ou.',
      amarillo: 'Jòn: fè atansyon. Ekri ekip medikal ou nan chat la.',
      rojo: 'Wouj: ale nan ijans kounye a oswa rele SAMU 131.',
    },
    alarmTitle: 'Lè pou w ale nan ijans',
    alarms: [
      'Gwo doulè ki pa kalme ak medikaman pou doulè',
      'Lafyèv plis pase 38 °C',
      'Anpil san (plis pase règ)',
      'Pèt (ekoulman) ki gen move odè',
    ],
    caresTitle: 'Swen chak jou',
    cares: [
      'Repoze w',
      'Pa fè gwo efò ni leve bagay ki lou',
      'Pa itilize tanpon ni fè sèks pandan 4 semèn',
      'Benyen chak jou anba douch; evite basen ak pisin',
      'Obsève si gen san oswa pèt',
      'Ekri sentòm ou yo nan sondaj chak semèn nan',
    ],
    emergency: 'Ijans: rele 131 (SAMU)',
  },
}

const LEVELS: Level[] = ['verde', 'amarillo', 'rojo']

/** Idiomas y accesibilidad: información clave en inglés y criollo haitiano. */
export function Idiomas() {
  const navigate = useNavigate()
  const [code, setCode] = useState<'en' | 'ht'>('ht')
  const c = LANGS[code]
  const all = `${c.title}. ${c.intro} ${c.levelsTitle}. ${LEVELS.map((l) => c.levels[l]).join(' ')} ${c.alarmTitle}. ${c.alarms.join('. ')}. ${c.caresTitle}. ${c.cares.join('. ')}. ${c.emergency}.`

  return (
    <div className="page languages" lang={c.lang}>
      <header className="page-header">
        <button className="icon-btn" onClick={() => navigate(-1)} aria-label="Volver">
          <ChevronLeft size={22} />
        </button>
        <div className="page-header__text" lang="es">
          <h1>Idiomas</h1>
          <p>Información esencial en otros idiomas</p>
        </div>
      </header>

      <div className="segmented" role="radiogroup" aria-label="Idioma">
        {(Object.keys(LANGS) as ('en' | 'ht')[]).map((k) => (
          <button
            key={k}
            role="radio"
            aria-checked={code === k}
            className={`segmented__opt${code === k ? ' is-active' : ''}`}
            onClick={() => setCode(k)}
          >
            <Languages size={16} /> {LANGS[k].name}
          </button>
        ))}
      </div>

      <div className="card languages__intro" key={code}>
        <h2>{c.title}</h2>
        <p>{c.intro}</p>
        <ReadAloud text={all} lang={c.lang} label={c.listen} stopLabel={c.stop} />
      </div>

      <div className="card">
        <h3>{c.levelsTitle}</h3>
        <div className="stack">
          {LEVELS.map((l) => (
            <div key={l} className={`languages__level level-bg--${l}`}>
              <LevelFace level={l} size={34} />
              <span>{c.levels[l]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>{c.alarmTitle}</h3>
        <ul className="languages__list languages__list--alarm">{c.alarms.map((a) => <li key={a}>{a}</li>)}</ul>
        <a className="btn btn--danger btn--block small-gap" href="tel:131"><Phone size={18} /> {c.emergency}</a>
      </div>

      <div className="card">
        <h3>{c.caresTitle}</h3>
        <ul className="languages__list">{c.cares.map((a) => <li key={a}>{a}</li>)}</ul>
      </div>

      <div className="card languages__sign" lang="es">
        <Hand size={26} className="accent" />
        <div>
          <strong>Lengua de Señas Chilena (LSCh)</strong>
          <p>Estamos preparando videos con intérpretes certificadas para explicar el semáforo y los cuidados.</p>
        </div>
      </div>

      <p className="muted languages__note" lang="es">
        Traducciones referenciales: serán revisadas por facilitadores interculturales antes de usarse con pacientes.
      </p>
    </div>
  )
}
