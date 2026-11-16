import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { URL, fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import Pages from 'vite-plugin-pages'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import Layouts from 'vite-plugin-vue-layouts'

function git(args: string): string | undefined {
  try {
    return execSync(`git ${args}`, {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  }
  catch {
    return undefined
  }
}

function resolveBuildInfo() {
  const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as { version: string }
  const branch = process.env.BRANCH || git('symbolic-ref --short HEAD') || 'unknown'
  const commit = git('rev-parse HEAD') || 'unknown'
  const shortCommit = git('rev-parse --short=7 HEAD') || 'unknown'
  const isPR = process.env.PULL_REQUEST === 'true'
  const isPreview = isPR || process.env.CONTEXT === 'deploy-preview' || process.env.CONTEXT === 'dev'
  const env = process.env.NODE_ENV === 'development'
    ? 'dev'
    : isPreview
      ? 'preview'
      : branch === 'main'
        ? 'canary'
        : 'release'

  return {
    version: pkg.version,
    time: Date.now(),
    commit,
    shortCommit,
    branch,
    env,
  }
}

function elementPlusIconResolver() {
  return {
    type: 'component' as const,
    resolve: (name: string) => {
      if (!name.startsWith('ElIcon'))
        return
      return {
        name: name.slice('ElIcon'.length),
        from: '@element-plus/icons-vue',
      }
    },
  }
}

const buildInfo = resolveBuildInfo()
const apiProxyTarget = process.env.API_PROXY_TARGET

export default defineConfig({
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    __BUILD_INFO__: JSON.stringify(buildInfo),
  },
  server: {
    host: true,
    port: 3000,
    proxy: apiProxyTarget
      ? {
          '/api': {
            target: apiProxyTarget,
            changeOrigin: true,
          },
        }
      : undefined,
  },
  build: {
    target: 'esnext',
  },
  optimizeDeps: {
    include: [
      '@vueuse/integrations/useFocusTrap',
    ],
  },
  plugins: [
    vue(),
    Pages({
      dirs: 'src/pages',
      extensions: ['vue'],
      routeBlockLang: 'yaml',
    }),
    Layouts({
      layoutsDirs: 'src/layouts',
      defaultLayout: 'default',
    }),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
      dirs: [
        'src/composables',
        'src/composables/**',
        'src/utils',
        'src/utils/**',
        'src/lib',
      ],
      resolvers: [ElementPlusResolver()],
      dts: 'src/auto-imports.d.ts',
      vueTemplate: true,
    }),
    Components({
      dirs: ['src/components'],
      extensions: ['vue'],
      resolvers: [
        ElementPlusResolver({ importStyle: 'sass' }),
        elementPlusIconResolver(),
      ],
      dts: 'src/components.d.ts',
    }),
    createSvgIconsPlugin({
      iconDirs: [fileURLToPath(new URL('./src/assets/sprite/svg', import.meta.url))],
      symbolId: 'icon-[name]',
    }),
  ],
})
