import { Share2 } from 'lucide-react'
import { canNativeShare, shareText, whatsappUrl } from '../share'

/** Botones para enviar un texto por WhatsApp o con el menú «Compartir» del celular. */
export function ShareButtons({ title, text, light = false }: { title: string; text: string; light?: boolean }) {
  return (
    <div className={`share-btns${light ? ' share-btns--light' : ''}`}>
      <a className="share-btn share-btn--wa" href={whatsappUrl(text)} target="_blank" rel="noreferrer">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.8-1.4a.5.5 0 0 0 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.2c0-.1-.2-.2-.5-.3Z"
          />
        </svg>
        WhatsApp
      </a>
      {canNativeShare() && (
        <button className="share-btn" onClick={() => shareText(title, text)}>
          <Share2 size={17} /> Compartir
        </button>
      )}
    </div>
  )
}
