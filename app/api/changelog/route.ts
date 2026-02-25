import { readFile } from 'fs/promises'
import { join } from 'path'
import { parseChangelog } from '@/lib/utils/parseChangelog'

export async function GET() {
  try {
    const changelogPath = join(process.cwd(), 'CHANGELOG.md')

    let content = ''
    try {
      content = await readFile(changelogPath, 'utf-8')
    } catch (error) {
      // Archivo no existe aún, retornar estado inicial
      return Response.json({
        exists: false,
        content: '',
        versions: [],
        message: 'CHANGELOG.md not found. Will be generated on first release.',
      })
    }

    const versions = parseChangelog(content)

    return Response.json({
      exists: true,
      content,
      versions,
    })
  } catch (error) {
    console.error('Error reading changelog:', error)
    return Response.json(
      {
        error: 'Failed to read changelog',
        message: 'Error al obtener el changelog',
      },
      { status: 500 }
    )
  }
}
