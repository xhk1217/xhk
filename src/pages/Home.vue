<template>
  <!-- 使用 UnoCSS 的快捷类 flex-col-center 实现垂直居中，h-screen 占满全屏，bg-red-600 设置新年红背景 -->
  <div class="flex-col-center h-screen bg-red-600 text-white">
    <!-- text-6xl 设置超大字体，font-bold 加粗，animate-bounce 增加跳动动画 -->
    <h1 class="text-6xl font-bold mb-4 animate-bounce">
      🧧 2026 新年快乐 🧧
    </h1>
    <!-- text-2xl 设置副标题字体大小 -->
    <p class="text-2xl">
      蛇年大吉，万事如意！
    </p>
    <!-- mt-8 设置顶部外边距 -->
    <div class="mt-8">
      <!-- 使用 Element Plus 的按钮组件，type="warning" 显示黄色，round 为圆角 -->
      <el-button type="warning" size="large" round @click="celebrate">
        点我送祝福
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 引入 Element Plus 的消息提示组件
import { ElMessage } from 'element-plus'

/**
 * 庆祝点击事件处理函数
 */
const celebrate = () => {
  // 弹出成功提示消息
  ElMessage({
    message: '祝你在 2026 年：身体健康，事业有成，阖家幸福！',
    type: 'success', // 消息类型为成功
    duration: 5000, // 消息显示时长为 5 秒
  })
}
</script>

<style scoped>
/* scoped 表示样式仅在当前组件生效 */
/* 可以在这里写一些特定页面的样式 */
</style>
