import { fileURLToPath, URL } from 'node:url'

export const createBlueprintAliases = (currentDir: string) => ({
  '@': fileURLToPath(new URL('./src', currentDir)),
  'blueprint/stores': fileURLToPath(new URL('../blueprint/ts/stores', currentDir)),
  'blueprint/scss': fileURLToPath(new URL('../blueprint/scss', currentDir)),
  'blueprint/components': fileURLToPath(new URL('../blueprint/ts/components', currentDir)),
  'blueprint/assets': fileURLToPath(new URL('../blueprint/assets', currentDir)),
})

export const createBlueprintResolve = (currentDir: string) => ({
  alias: createBlueprintAliases(currentDir),
})
