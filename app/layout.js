import './globals.css'

export const metadata = {
  title: 'TermoEnerji Fiyat Yönetim Sistemi',
  description: 'Profesyonel fiyat teklif yönetimi',
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className="bg-slate-950 text-white antialiased">
        {children}
      </body>
    </html>
  )
}
