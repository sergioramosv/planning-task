import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Planning Task',
  description: 'Aplicación profesional de gestión de tareas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.setAttribute('data-theme','dark')}}catch(e){}})()`,
          }}
        />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="icon" href="/remoduler-logo.svg" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
