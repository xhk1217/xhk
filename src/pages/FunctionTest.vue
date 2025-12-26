<template>
  <div class="min-h-screen p-4 md:p-8 transition-colors duration-300" :class="{ 'bg-gray-900 text-white': isDark, 'bg-gray-50 text-gray-900': !isDark }">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <header class="flex justify-between items-center mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h1 class="text-3xl font-bold flex items-center gap-2">
          <i class="i-mdi-test-tube text-primary"></i>
          {{ t('test.title') }}
        </h1>
        <div class="flex gap-4">
          <el-button @click="toggleLang" circle>
            <i class="i-mdi-translate"></i>
          </el-button>
          <el-button @click="toggleTheme" circle>
            <i :class="isDark ? 'i-mdi-weather-sunny' : 'i-mdi-weather-night'"></i>
          </el-button>
        </div>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Pinia Test -->
        <section class="p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
            <i class="i-mdi-database"></i> {{ t('test.piniaTest') }}
          </h2>
          <div class="flex items-center gap-4">
            <span class="text-lg">{{ t('test.count') }} <b class="text-primary">{{ counter.count }}</b></span>
            <el-button-group>
              <el-button type="primary" @click="counter.increment">{{ t('test.increment') }}</el-button>
              <el-button type="danger" @click="counter.decrement">{{ t('test.decrement') }}</el-button>
            </el-button-group>
          </div>
          <p class="mt-4 text-sm text-gray-500">{{ t('test.piniaTip') }}</p>
        </section>

        <!-- Axios + Mock Test -->
        <section class="p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
            <i class="i-mdi-api"></i> {{ t('test.axiosTest') }}
          </h2>
          <el-button type="success" :loading="loading" @click="fetchMockData">
            {{ t('test.fetchData') }}
          </el-button>
          <div v-if="mockResult" class="mt-4 p-3 rounded bg-gray-100 dark:bg-gray-700 font-mono text-sm">
            {{ mockResult }}
          </div>
        </section>

        <!-- Icon Test -->
        <section class="p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
            <i class="i-mdi-emoticon-outline"></i> {{ t('test.iconTest') }}
          </h2>
          <div class="flex flex-wrap gap-6 text-2xl">
            <div class="flex flex-col items-center gap-1">
              <i class="i-mdi-home text-blue-500"></i>
              <span class="text-xs">MDI</span>
            </div>
            <div class="flex flex-col items-center gap-1">
              <i class="i-logos-vue"></i>
              <span class="text-xs">Logos</span>
            </div>
            <div class="flex flex-col items-center gap-1">
              <i class="i-carbon-settings text-orange-500"></i>
              <span class="text-xs">Carbon</span>
            </div>
            <div class="flex flex-col items-center gap-1">
              <i class="i-ep-plus text-green-500"></i>
              <span class="text-xs">Element</span>
            </div>
          </div>
          <p class="mt-4 text-sm text-gray-500">{{ t('test.iconTip') }}</p>
        </section>

        <!-- Responsive Test -->
        <section class="p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
            <i class="i-mdi-responsive"></i> {{ t('test.responsiveTest') }}
          </h2>
          <div class="hidden md:block p-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded text-center">
            🖥 {{ t('test.desktopView') }} (width > 768px)
          </div>
          <div class="block md:hidden p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded text-center">
            📱 {{ t('test.mobileView') }} (width < 768px)
          </div>
          <p class="mt-4 text-sm text-gray-500">{{ t('test.responsiveTip') }}</p>
        </section>
      </div>

      <!-- Dev Guide -->
      <footer class="mt-12 p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-500/10 border border-primary/20">
        <h2 class="text-2xl font-bold mb-4">{{ t('test.devGuideTitle') }}</h2>
        <ul class="space-y-3 text-sm md:text-base">
          <li class="flex items-start gap-2">
            <i class="i-mdi-check-circle text-green-500 mt-1"></i>
            <span><b>{{ t('test.guideStyle').split(':')[0] }}</b>: {{ t('test.guideStyle').split(':')[1] }}</span>
          </li>
          <li class="flex items-start gap-2">
            <i class="i-mdi-check-circle text-green-500 mt-1"></i>
            <span><b>{{ t('test.guideIcon').split(':')[0] }}</b>: {{ t('test.guideIcon').split(':')[1] }}</span>
          </li>
          <li class="flex items-start gap-2">
            <i class="i-mdi-check-circle text-green-500 mt-1"></i>
            <span><b>{{ t('test.guideStore').split(':')[0] }}</b>: {{ t('test.guideStore').split(':')[1] }}</span>
          </li>
          <li class="flex items-start gap-2">
            <i class="i-mdi-check-circle text-green-500 mt-1"></i>
            <span><b>{{ t('test.guideNetwork').split(':')[0] }}</b>: {{ t('test.guideNetwork').split(':')[1] }}</span>
          </li>
        </ul>
        <div class="mt-6">
          <el-button type="primary" plain @click="router.push('/')">{{ t('test.backHome') }}</el-button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCounterStore } from '@/store/counter'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const { t, locale } = useI18n()
const counter = useCounterStore()
const router = useRouter()

// 主题切换
const isDark = ref(false)
const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// 语言切换
const toggleLang = () => {
  locale.value = locale.value === 'zh-CN' ? 'en' : 'zh-CN'
  ElMessage.success(t('test.success'))
}

// Mock 测试
const loading = ref(false)
const mockResult = ref('')
const fetchMockData = async () => {
  loading.value = true
  try {
    const res = await axios.get('/api/getGreeting')
    mockResult.value = JSON.stringify(res.data, null, 2)
    ElMessage.success(t('test.success'))
  } catch (err) {
    ElMessage.error(t('common.error'))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.text-primary {
  color: var(--color-primary);
}
</style>
