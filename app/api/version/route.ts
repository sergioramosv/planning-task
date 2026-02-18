import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET() {
  try {
    const packageJsonPath = join(process.cwd(), 'package.json')
    const content = await readFile(packageJsonPath, 'utf-8')
    const packageJson = JSON.parse(content)

    return Response.json({
      version: packageJson.version,
      name: packageJson.name,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error reading version:', error)
    return Response.json(
      {
        error: 'Failed to read version',
        message: error instanceof Error ? error.message : 'Unknown error',
        version: '0.0.0',
      },
      { status: 500 }
    )
  }
}
