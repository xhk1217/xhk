import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetWind3, // 使用最新的 presetWind3 代替已弃用的 presetUno
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss' // 引入 UnoCSS 的核心配置和预设

export default defineConfig({
  // 快捷方式：将多个原子类组合成一个自定义类名
  shortcuts: [
    ['flex-center', 'flex items-center justify-center'], // 水平垂直居中
    ['flex-col-center', 'flex flex-col items-center justify-center'], // 垂直列居中
  ],
  // 主题配置：定义颜色、字体等变量
  theme: {
    colors: {
      primary: 'var(--color-primary)', // 使用 CSS 变量定义主色调
    },
  },
  // 预设配置：UnoCSS 的功能扩展
  presets: [
    presetWind3(), // 使用最新的 Wind3 预设，兼容 Tailwind v3 语法
    presetAttributify(), // 属性化模式，支持 <div flex="~" items="center"> 这种写法
    presetIcons({
      // 图标预设：支持直接使用图标类名
      scale: 1.2, // 图标缩放比例
      warn: true, // 找不到图标时显示警告
    }),
    presetWebFonts({
      // 字体预设：自动引入 Google Fonts 等 Web 字体
      fonts: {
        sans: 'DM Sans',
        serif: 'DM Serif Display',
        mono: 'DM Mono',
      },
    }),
  ],
  // 转换器：增强 CSS 编写能力
  transformers: [
    transformerDirectives(), // 支持 @apply, @screen 等指令
    transformerVariantGroup(), // 支持 hover:(bg-gray-100 font-medium) 这种分组写法
  ],
})
