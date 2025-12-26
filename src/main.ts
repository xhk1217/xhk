import { createApp } from 'vue' // 引入 Vue 的应用创建函数
import { createPinia } from 'pinia' // 引入 Pinia 状态管理
import App from './App.vue' // 引入根组件
import router from './router' // 引入路由配置
import i18n from './locales' // 引入国际化配置

// 引入 UnoCSS 的虚拟样式文件，使原子类生效
import 'virtual:uno.css'
// 引入全局 SCSS 样式文件
import './styles/main.scss'
// 引入 Element Plus 的全局样式
import 'element-plus/dist/index.css'

// 创建 Vue 应用实例
const app = createApp(App)

// 注册 Pinia 插件，用于全局状态管理
app.use(createPinia())
// 注册路由插件，用于页面跳转
app.use(router)
// 注册国际化插件
app.use(i18n)

// 将应用挂载到 index.html 中 id 为 app 的 DOM 元素上
app.mount('#app')
