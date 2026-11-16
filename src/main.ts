import FloatingVue from 'floating-vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { createPinia } from 'pinia'
import { createHead } from '@unhead/vue'
import { createApp } from 'vue'
import App from './App.vue'
import { installDirectives } from '~/plugins/directives'
import { router } from '~/router'

import 'tailwindcss/lib/css/preflight.css'
import '~/assets/css/tailwind.css'
import '~/assets/scss/index.scss'
import 'floating-vue/dist/style.css'
import 'virtual:svg-icons-register'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(createHead())
app.use(ElementPlus, { locale: zhCn })
app.use(FloatingVue)
installDirectives(app)

app.mount('#app')
