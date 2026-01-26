export function getTemplate(id: string): HTMLTemplateElement {
  const template = document.getElementById(id) as HTMLTemplateElement | null
  if (!template) throw new Error(`Template ${id} not found`)
  return template
}
