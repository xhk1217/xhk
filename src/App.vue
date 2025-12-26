<template>
  <!-- 路由占位符：根据当前 URL 渲染对应的页面组件 -->
  <router-view />
</template>

<script setup lang="ts">
// 根组件逻辑，目前为空
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
