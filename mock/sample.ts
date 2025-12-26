import { MockMethod } from 'vite-plugin-mock' // 引入 Mock 方法的类型定义

// 导出 Mock 接口配置数组
export default [
  {
    url: '/api/getGreeting', // 模拟的接口地址
    method: 'get', // 请求方法
    // 接口返回的数据
    response: () => {
      return {
        code: 0, // 业务状态码
        data: {
          message: '2026 新年快乐！', // 返回的消息内容
        },
      }
    },
  },
] as MockMethod[] // 强制类型转换为 MockMethod 数组，提供 TS 校验
