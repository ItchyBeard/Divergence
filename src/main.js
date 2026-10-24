import { createApp } from 'vue'
import './data/weapons/index'
import App from './App.vue'
import store from './stores'
import router from './router'
import { i18n } from './i18n'
import { analytics } from './analytics'
import Notifications from '@kyvg/vue3-notification'
import Unicon from './icons/unicons'

// TODO: Extract these global imports to a different file
import IconComponent from './components/IconComponent.vue'

const app = createApp(App)

app.use(store)
app.use(Unicon)
app.use(Notifications)
app.use(router)
app.use(i18n)

app.component('IconComponent', IconComponent)

router.isReady().then(() => {
  analytics.start(router)
  app.mount('#app')
})
