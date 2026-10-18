// Compartir texto con la pareja o la familia: menú del celular si existe, si no WhatsApp.

export const canNativeShare = () => typeof navigator !== 'undefined' && typeof navigator.share === 'function'

export const whatsappUrl = (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`

export async function shareText(title: string, text: string): Promise<'shared' | 'whatsapp' | 'cancel'> {
  if (canNativeShare()) {
    try {
      await navigator.share({ title, text })
      return 'shared'
    } catch {
      return 'cancel'
    }
  }
  window.open(whatsappUrl(text), '_blank', 'noopener')
  return 'whatsapp'
}
