import { defineConfig } from 'vite' // 引入 Vite 的配置函数
import vue from '@vitejs/plugin-vue' // 引入 Vue 插件，用于处理 .vue 文件
import UnoCSS from 'unocss/vite' // 引入 UnoCSS 插件，用于原子化 CSS
import Components from 'unplugin-vue-components/vite' // 引入自动按需引入组件插件
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers' // 引入 Element Plus 的解析器
import Icons from 'unplugin-icons/vite' // 引入图标插件
import IconsResolver from 'unplugin-icons/resolver' // 引入图标解析器，配合组件自动引入
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons' // 引入本地 SVG 图标管理插件
import { viteMockServe } from 'vite-plugin-mock' // 引入 Mock 服务插件
import path from 'path' // 引入 Node.js 的路径模块

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      // 设置路径别名，将 '@' 映射到 'src' 目录
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0', // 监听所有地址，包括局域网和本地
    port: 5173,      // 指定端口号
    open: true,      // 启动时自动在浏览器打开
  },
  plugins: [
    vue(), // 启用 Vue 支持
    UnoCSS(), // 启用 UnoCSS 支持
    Components({
      // 配置自动按需引入组件
      resolvers: [
        ElementPlusResolver(), // 自动解析 Element Plus 组件
        IconsResolver({
          prefix: 'i', // 图标组件前缀，例如 <i-mdi-home />
        }),
      ],
      dts: 'src/components.d.ts', // 生成类型声明文件，提供更好的 TS 支持
    }),
    Icons({
      autoInstall: true, // 自动安装缺失的图标库
    }),
    createSvgIconsPlugin({
      // 配置本地 SVG 图标目录
      iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
      // 指定 symbolId 格式
      symbolId: 'icon-[dir]-[name]',
    }),
    viteMockServe({
      mockPath: 'mock', // 指定 mock 数据的存放目录
      enable: true, // 是否启用 mock 服务
    }),
  ],
})
