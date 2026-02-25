import * as fs from 'fs'
import * as path from 'path'

describe('Project Page - Toast Usage Verification', () => {
  const filePath = path.join(
    process.cwd(),
    'app',
    '(dashboard)',
    'projects',
    '[projectId]',
    'page.tsx'
  )

  let fileContent: string

  beforeAll(() => {
    fileContent = fs.readFileSync(filePath, 'utf-8')
  })

  it('should import toast from react-hot-toast', () => {
    expect(fileContent).toMatch(/import\s+toast.*from\s+['"]react-hot-toast['"]/)
  })

  it('should import Toaster from react-hot-toast', () => {
    expect(fileContent).toMatch(/Toaster/)
    expect(fileContent).toMatch(/import.*Toaster.*from\s+['"]react-hot-toast['"]/)
  })

  it('should render <Toaster /> in the JSX', () => {
    expect(fileContent).toMatch(/<Toaster\s/)
  })

  it('should call toast.success for task creation', () => {
    expect(fileContent).toContain("toast.success('Tarea creada correctamente')")
  })

  it('should call toast.success for task update', () => {
    expect(fileContent).toContain("toast.success('Tarea actualizada correctamente')")
  })

  it('should call toast.error for task save failure', () => {
    expect(fileContent).toContain("toast.error('Error al guardar la tarea')")
  })

  it('should call toast.success for sprint creation', () => {
    expect(fileContent).toContain("toast.success('Sprint creado correctamente')")
  })

  it('should call toast.error for sprint creation failure', () => {
    expect(fileContent).toContain("toast.error('Error al crear el sprint')")
  })

  it('should call toast.success for task deletion', () => {
    expect(fileContent).toContain("toast.success('Tarea eliminada correctamente')")
  })

  it('should call toast.error for task deletion failure', () => {
    expect(fileContent).toContain("toast.error('Error al eliminar la tarea')")
  })

  it('should call toast.success for task status change', () => {
    expect(fileContent).toMatch(/toast\.success\(`Estado cambiado a/)
  })

  it('should call toast.error for task status change failure', () => {
    expect(fileContent).toContain("toast.error('Error al cambiar el estado')")
  })

  it('should call toast.success for bug report', () => {
    expect(fileContent).toContain("toast.success('Bug reportado correctamente')")
  })

  it('should call toast.error for bug report failure', () => {
    expect(fileContent).toContain("toast.error('Error al reportar el bug')")
  })

  it('should call toast.success for bug deletion', () => {
    expect(fileContent).toContain("toast.success('Bug eliminado correctamente')")
  })

  it('should call toast.error for bug deletion failure', () => {
    expect(fileContent).toContain("toast.error('Error al eliminar el bug')")
  })

  it('should call toast.success for bug status update', () => {
    expect(fileContent).toContain("toast.success('Estado del bug actualizado')")
  })

  it('should call toast.error for bug status update failure', () => {
    expect(fileContent).toContain("toast.error('Error al actualizar el estado del bug')")
  })

  it('should call toast.success for proposal creation', () => {
    expect(fileContent).toContain("toast.success('Propuesta creada correctamente')")
  })

  it('should call toast.error for proposal creation failure', () => {
    expect(fileContent).toContain("toast.error('Error al crear la propuesta')")
  })

  it('should call toast.success for proposal acceptance', () => {
    expect(fileContent).toContain("toast.success('Propuesta aceptada y tarea creada')")
  })

  it('should call toast.error for proposal acceptance failure', () => {
    expect(fileContent).toContain("toast.error('Error al aceptar la propuesta')")
  })

  it('should call toast.success for proposal rejection', () => {
    expect(fileContent).toContain("toast.success('Propuesta rechazada')")
  })

  it('should call toast.error for proposal rejection failure', () => {
    expect(fileContent).toContain("toast.error('Error al rechazar la propuesta')")
  })

  it('should have multiple toast.success calls in the file', () => {
    const successMatches = fileContent.match(/toast\.success\(/g)
    expect(successMatches).not.toBeNull()
    expect(successMatches!.length).toBeGreaterThanOrEqual(10)
  })

  it('should have multiple toast.error calls in the file', () => {
    const errorMatches = fileContent.match(/toast\.error\(/g)
    expect(errorMatches).not.toBeNull()
    expect(errorMatches!.length).toBeGreaterThanOrEqual(10)
  })
})
