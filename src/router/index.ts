import { createRouter, createWebHistory } from 'vue-router' // 引入路由创建函数和历史记录模式
import Home from '../pages/Home.vue' // 引入首页组件

// 创建路由实例
const router = createRouter({
  // 使用 Web History 模式，并设置基础路径
  history: createWebHistory(import.meta.env.BASE_URL),
  // 定义路由映射表
  routes: [
    {
      path: '/', // 访问根路径
      name: 'home', // 路由名称
      component: Home, // 对应的组件
    },
    {
      path: '/FunctionTest', // 功能测试页面
      name: 'function-test',
      component: () => import('../pages/FunctionTest.vue'), // 路由懒加载
    },
  ],
})

// 添加全局路由守卫
router.beforeEach((to, from, next) => {
  // 定义允许访问的路径白名单
  const whiteList = ['/', '/FunctionTest']

  // 如果访问的路径不在白名单内，则强制跳转到首页
  if (!whiteList.includes(to.path)) {
    next('/')
  } else {
    next()
  }
})

export default router // 导出路由实例供 main.ts 使用
