<template>
  <!-- 路由占位符：根据当前 URL 渲染对应的页面组件 -->
  <router-view />
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/store/settings'

const { locale } = useI18n()
const settings = useSettingsStore()

// 同步 Store 的语言到 i18n 实例
watch(() => settings.lang, (newLang) => {
  locale.value = newLang
}, { immediate: true })
</script>

<style>
/* 全局样式设置 */
#app {
  /* 设置默认字体族 */
  font-family: Avenir, Helvetica, Arial, sans-serif;
  /* 优化字体渲染，使文字在不同系统下更清晰 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
