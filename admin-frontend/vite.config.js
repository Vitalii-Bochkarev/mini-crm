import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const configDirectory = fileURLToPath(new URL('.', import.meta.url))

function getApiBaseUrl(mode) {
  const value = loadEnv(mode, configDirectory, 'VITE_').VITE_API_BASE_URL?.trim()

  if (!value) {
    throw new Error('VITE_API_BASE_URL must be configured for this Vite mode.')
  }

  let url

  try {
    url = new URL(value)
  } catch {
    throw new Error('VITE_API_BASE_URL must be an absolute http or https URL.')
  }

  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      'VITE_API_BASE_URL must use http or https and must not contain credentials, query, or fragment.',
    )
  }

  return url.toString().replace(/\/+$/, '')
}

export default defineConfig(({ mode }) => {
  const apiBaseUrl = getApiBaseUrl(mode)

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(apiBaseUrl),
    },
  }
})
