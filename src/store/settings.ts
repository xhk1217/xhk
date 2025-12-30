import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  // 初始化主题：优先从本地存储读取，默认为浅色
  const isDark = ref(localStorage.getItem('theme') === 'dark')
  
  // 初始化语言：优先从本地存储读取，默认为中文
  const lang = ref(localStorage.getItem('lang') || 'zh-CN')

  // 监听主题变化并应用到 HTML 标签，同时持久化
  watch(isDark, (val) => {
    const theme = val ? 'dark' : 'light'
    if (val) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, { immediate: true })

  // 监听语言变化并持久化
  watch(lang, (newLang) => {
    document.documentElement.lang = newLang
    localStorage.setItem('lang', newLang)
  }, { immediate: true })

  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  const setLang = (newLang: string) => {
    lang.value = newLang
  }

  return {
    isDark,
    lang,
    toggleTheme,
    setLang
  }
})
