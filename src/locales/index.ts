import { createI18n } from 'vue-i18n'

// 自动导入所有语言文件
const loadLocales = (modules: Record<string, any>) => {
  const messages: Record<string, any> = {}
  Object.keys(modules).forEach((path) => {
    // 从路径中提取文件名作为模块名，例如 ./en/home.json -> home
    const matched = path.match(/([A-Za-z0-9-_]+)\.json$/i)
    if (matched && matched.length > 1) {
      const moduleName = matched[1]
      messages[moduleName] = modules[path].default
    }
  })
  return messages
}

const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: 'zh-CN', // 默认语言
  fallbackLocale: 'en', // 回退语言
  messages: {
    'zh-CN': loadLocales(import.meta.glob('./zh-CN/*.json', { eager: true })),
    'en': loadLocales(import.meta.glob('./en/*.json', { eager: true }))
  }
})

export default i18n
