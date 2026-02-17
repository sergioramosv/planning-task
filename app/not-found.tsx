import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>404 - Página No Encontrada</h1>
      <p>Lo sentimos, la página que buscas no existe.</p>
      <Link href="/projects" style={{ color: '#2e8b57', textDecoration: 'underline' }}>
        Volver a Proyectos
      </Link>
    </div>
  )
}
