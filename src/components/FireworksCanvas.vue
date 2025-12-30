<template>
  <canvas
    ref="canvasEl"
    class="fireworks-canvas"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useSettingsStore } from '@/store/settings'

type Props = {
  enabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  enabled: true,
})

const settings = useSettingsStore()
const canvasEl = ref<HTMLCanvasElement | null>(null)

let rafId: number | null = null
let resizeObserver: ResizeObserver | null = null
let lastFrameAt = 0
let lastLaunchAt = 0
let startAt = 0

type Rgb = { r: number, g: number, b: number }

type Rocket = {
  x: number
  y: number
  vx: number
  vy: number
  targetY: number
  lifeMs: number
  ageMs: number
  hue: number
  trail: Array<{ x: number, y: number }>
  isManual?: boolean
}

type Spark = {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  alpha: number
  lifeMs: number
  ageMs: number
  decay: number
  hue: number
  sat: number
  light: number
  flicker: number
  trail: Array<{ x: number, y: number }>
}

type Flash = {
  x: number
  y: number
  radius: number
  alpha: number
  lifeMs: number
  ageMs: number
  hue: number
}

type TextEffect = {
  x: number
  y: number
  text: string
  alpha: number
  lifeMs: number
  ageMs: number
  hue: number
}

const rockets: Rocket[] = []
const sparks: Spark[] = []
const flashes: Flash[] = []
const textEffects: TextEffect[] = []

const MAX_ROCKETS = 10
const MAX_SPARKS = 5000
const GRAVITY = 750 // 进一步降低重力，让条状更飘逸
const AIR_DRAG = 0.982

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

const rand = (a: number, b: number) => a + Math.random() * (b - a)
const hsla = (h: number, s: number, l: number, a: number) => `hsla(${h}, ${s}%, ${l}%, ${a})`

const parseCssColorToRgb = (input: string): Rgb | null => {
  const value = input.trim()

  if (!value) return null

  if (value.startsWith('#')) {
    const hex = value.slice(1)
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16)
      const g = parseInt(hex[1] + hex[1], 16)
      const b = parseInt(hex[2] + hex[2], 16)
      return { r, g, b }
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      return { r, g, b }
    }
    return null
  }

  const rgbMatch = value.match(/rgba?\(([^)]+)\)/i)
  if (rgbMatch) {
    const parts = rgbMatch[1]
      .split(',')
      .map(s => s.trim())
      .slice(0, 3)
      .map(n => Number.parseFloat(n))

    if (parts.length === 3 && parts.every(n => Number.isFinite(n))) {
      return { r: parts[0], g: parts[1], b: parts[2] }
    }
  }

  return null
}

const getBgRgb = (): Rgb => {
  const styles = getComputedStyle(document.documentElement)
  const bgRaw = styles.getPropertyValue('--bg-color')
  return parseCssColorToRgb(bgRaw) ?? { r: 6, g: 6, b: 18 }
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

const resizeCanvas = () => {
  const canvas = canvasEl.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  const width = Math.max(1, Math.floor(rect.width * dpr))
  const height = Math.max(1, Math.floor(rect.height * dpr))

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width
    canvas.height = height
  }
}

const launchRocket = (customX?: number, customY?: number, isManual = false) => {
  const canvas = canvasEl.value
  if (!canvas) return
  if (rockets.length >= MAX_ROCKETS) return

  const hue = Math.floor(rand(0, 360)) // 全色域，更多彩

  const w = canvas.width
  const h = canvas.height

  const x = customX ?? w * (0.15 + Math.random() * 0.7)
  const y = h + 10
  const targetY = customY ?? h * (0.15 + Math.random() * 0.4)

  let vx = customX ? 0 : (Math.random() - 0.5) * 80
  let vy = -(850 + Math.random() * 300)
  let lifeMs = 2500

  if (isManual && customY !== undefined) {
    // 手动点击：通过模拟确定所需初速度，确保可以到达目标高度，同时放慢上升速度更接近真实
    const gravity = GRAVITY * 0.12
    const frameDt = 1 / 60
    const dragPerFrame = Math.pow(AIR_DRAG, frameDt * 60)
    const startY = y
    const target = Math.min(customY, startY - 20)
    const maxTime = 8

    const simulate = (initialVy: number) => {
      let vySim = initialVy
      let ySim = startY
      let elapsed = 0
      let steps = 0

      while (elapsed < maxTime) {
        vySim *= dragPerFrame
        vySim += gravity * frameDt
        ySim += vySim * frameDt
        elapsed += frameDt
        steps += 1

        if (ySim <= target) {
          return { hit: true, time: elapsed, steps }
        }
      }

      return { hit: false, time: elapsed, steps }
    }

    let low = -2400
    let high = -150
    let bestVy = vy
    let bestTime = 1.5
    let bestSteps = Math.round(bestTime / frameDt)
    let found = false

    for (let i = 0; i < 36; i++) {
      const testVy = (low + high) / 2
      const result = simulate(testVy)

      if (result.hit) {
        found = true
        bestVy = testVy
        bestTime = result.time
        bestSteps = Math.max(1, result.steps)
        high = testVy
      } else {
        low = testVy
      }
    }

    if (found) {
      // 二次尝试进一步减小初速度以获得更长上升时间但仍能命中目标
      let adjustedVy = bestVy
      let adjustedTime = bestTime
      let adjustedSteps = bestSteps
      for (let j = 0; j < 12; j++) {
        const testVy = adjustedVy * 0.9
        const res = simulate(testVy)
        if (res.hit) {
          adjustedVy = testVy
          adjustedTime = res.time
          adjustedSteps = res.steps
        } else {
          break
        }
      }

      vy = adjustedVy
      bestSteps = adjustedSteps
      bestTime = adjustedTime

      const dx = (customX ?? x) - x
      if (Math.abs(dx) > 1) {
        const sumFactor = frameDt * (1 - Math.pow(dragPerFrame, bestSteps)) / (1 - dragPerFrame)
        vx = dx / Math.max(0.001, sumFactor)
      } else {
        vx = 0
      }

      lifeMs = Math.max(lifeMs, (bestTime + 1.2) * 1000)
    } else {
      const dy = Math.max(0, h - customY)
      const minVy = -Math.sqrt(2 * gravity * dy) * 1.3
      vy = Math.min(minVy, -750)
      lifeMs = Math.max(lifeMs, 5000)
    }
  }

  rockets.push({
    x,
    y,
    vx,
    vy,
    targetY,
    lifeMs,
    ageMs: 0,
    hue,
    trail: [],
    isManual,
  })
}

const handlePointerDown = (e: PointerEvent) => {
  const canvas = canvasEl.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  
  // 关键修复：使用 canvas 的实际像素尺寸与 CSS 尺寸的比例来映射坐标
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  const x = (e.clientX - rect.left) * scaleX
  const y = (e.clientY - rect.top) * scaleY
  
  // 点击直接在鼠标位置发射并爆炸
  // 为了确保能到达点击位置，我们给手动发射的火箭一个更强的初始速度
  launchRocket(x, y, true)

  // 添加文字效果
  textEffects.push({
    x,
    y,
    text: '2026',
    alpha: 1,
    lifeMs: 1500,
    ageMs: 0,
    hue: Math.random() * 360
  })

  console.debug('[fireworks] click', {
    clientX: e.clientX,
    clientY: e.clientY,
    canvasX: x,
    canvasY: y,
    scaleX,
    scaleY,
    canvasWidth: canvas.width,
    canvasHeight: canvas.height
  })
}

const explode = (rocket: Rocket) => {
  if (rocket.isManual) {
    console.debug('[fireworks] explode', { x: rocket.x, y: rocket.y, targetY: rocket.targetY })
  }
  const count = 120 + Math.floor(Math.random() * 80) // 增加粒子数量
  const isWillow = Math.random() > 0.5 // 50% 概率产生柳絮状长条烟花
  
  // 明亮模式下降低亮度以增加对比度
  const baseLight = settings.isDark ? rand(60, 80) : rand(40, 55)

  // 添加爆炸闪光
  flashes.push({
    x: rocket.x,
    y: rocket.y,
    radius: 60 + Math.random() * 60,
    alpha: 0.6,
    lifeMs: 200,
    ageMs: 0,
    hue: rocket.hue
  })

  for (let i = 0; i < count && sparks.length < MAX_SPARKS; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = isWillow 
      ? (100 + Math.random() * 300) 
      : (150 + Math.random() * 600)
    
    const vx = Math.cos(angle) * speed
    const vy = Math.sin(angle) * speed

    const hue = (rocket.hue + rand(-40, 40)) % 360

    sparks.push({
      x: rocket.x,
      y: rocket.y,
      vx,
      vy,
      radius: isWillow ? 1.2 : 1.8,
      alpha: 1,
      lifeMs: isWillow ? (2000 + Math.random() * 1500) : (1000 + Math.random() * 1000),
      ageMs: 0,
      decay: isWillow ? 0.96 : 0.98,
      hue,
      sat: rand(90, 100),
      light: baseLight,
      flicker: Math.random() > 0.3 ? rand(0.1, 0.4) : 0,
      trail: []
    })
  }
}

const drawGlowDot = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  hue: number,
  alpha: number,
  sat = 98,
  light = 62,
) => {
  // 明亮模式下降低亮度
  const adjustedLight = settings.isDark ? light : light * 0.7
  const adjustedHaloLight = settings.isDark ? Math.min(90, light + 15) : light * 0.8

  ctx.globalAlpha = alpha
  ctx.fillStyle = hsla(hue, sat, adjustedLight, 1)
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()

  ctx.globalAlpha = alpha * 0.4
  ctx.fillStyle = hsla(hue, sat, adjustedHaloLight, 1)
  ctx.beginPath()
  ctx.arc(x, y, r * 3, 0, Math.PI * 2)
  ctx.fill()
}

const step = (now: number) => {
  rafId = requestAnimationFrame(step)

  if (!props.enabled) return
  if (prefersReducedMotion()) return
  if (document.hidden) return

  const canvas = canvasEl.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  if (!lastFrameAt) lastFrameAt = now
  const dt = clamp((now - lastFrameAt) / 1000, 0, 0.033)
  lastFrameAt = now

  const elapsed = now - startAt
  const intensePhase = elapsed < 15_000
  const launchIntervalMs = intensePhase ? 250 : 450

  if (!lastLaunchAt) lastLaunchAt = now
  if (now - lastLaunchAt >= launchIntervalMs) {
    lastLaunchAt = now
    launchRocket()
  }

  // 透明背景下使用 clearRect，不再使用 fillRect 覆盖
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  ctx.save()
  ctx.globalCompositeOperation = 'screen'

  // 绘制文字效果
  for (let i = textEffects.length - 1; i >= 0; i--) {
    const t = textEffects[i]
    t.ageMs += dt * 1000
    const progress = t.ageMs / t.lifeMs
    if (progress >= 1) {
      textEffects.splice(i, 1)
      continue
    }
    
    ctx.save()
    const alpha = (1 - progress)
    ctx.globalAlpha = alpha
    // 炫彩效果：随时间改变色相
    const hue = (t.hue + progress * 360) % 360
    // 明亮模式下文字颜色稍深
    const textLight = settings.isDark ? 70 : 50
    const shadowLight = settings.isDark ? 50 : 40
    
    ctx.fillStyle = hsla(hue, 100, textLight, 1)
    ctx.shadowBlur = 15
    ctx.shadowColor = hsla(hue, 100, shadowLight, 0.8)
    
    const fontSize = Math.floor(24 + progress * 20)
    // 优化字体栈：英文状态下使用更具现代感的无衬线字体，中文状态下兼顾系统默认
    const fontStack = settings.lang === 'en' 
      ? '"Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
      : '"Inter", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", sans-serif'
    
    ctx.font = `bold ${fontSize}px ${fontStack}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    // 向上漂浮并带有轻微放大效果
    ctx.fillText(t.text, t.x, t.y - progress * 80)
    ctx.restore()
  }

  // 绘制闪光
  for (let i = flashes.length - 1; i >= 0; i--) {
    const f = flashes[i]
    f.ageMs += dt * 1000
    const t = f.ageMs / f.lifeMs
    if (t >= 1) {
      flashes.splice(i, 1)
      continue
    }
    ctx.globalAlpha = f.alpha * (1 - t)
    const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius)
    
    const flashInnerLight = settings.isDark ? 90 : 60
    const flashOuterLight = settings.isDark ? 50 : 30
    
    grad.addColorStop(0, hsla(f.hue, 100, flashInnerLight, 1))
    grad.addColorStop(1, hsla(f.hue, 100, flashOuterLight, 0))
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2)
    ctx.fill()
  }

  // 更新/绘制火箭
  for (let i = rockets.length - 1; i >= 0; i--) {
    const rocket = rockets[i]
    rocket.ageMs += dt * 1000
    
    // 物理更新：使用 dt 缩放阻力和重力
    const drag = Math.pow(AIR_DRAG, dt * 60)
    rocket.vx *= drag
    rocket.vy *= drag
    rocket.vy += GRAVITY * dt * 0.15
    
    rocket.x += rocket.vx * dt
    rocket.y += rocket.vy * dt

    rocket.trail.unshift({ x: rocket.x + rand(-1, 1), y: rocket.y + rand(-1, 1) })
    if (rocket.trail.length > 12) rocket.trail.length = 12

    for (let t = 0; t < rocket.trail.length; t++) {
      const p = rocket.trail[t]
      const a = (1 - t / rocket.trail.length) * 0.8
      drawGlowDot(ctx, p.x, p.y, 1.2, rocket.hue, a, 90, 70)
    }

    // 爆炸条件：到达目标高度、速度反向（到达顶点）或寿命耗尽
    const reachedTarget = rocket.y <= rocket.targetY
    const reachedPeak = rocket.vy >= 0
    const timeout = rocket.ageMs >= rocket.lifeMs
    
    // 手动发射的火箭必须到达目标高度才爆炸，除非超时
    const shouldExplode = rocket.isManual 
      ? (reachedTarget || timeout)
      : (reachedTarget || reachedPeak || timeout)

    if (shouldExplode) {
      explode(rocket)
      rockets.splice(i, 1)
    }
  }

  // 更新/绘制火花
  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i]
    s.ageMs += dt * 1000
    const lifeT = clamp(s.ageMs / s.lifeMs, 0, 1)

    s.vx *= Math.pow(s.decay, dt * 60)
    s.vy *= Math.pow(s.decay, dt * 60)
    s.vy += GRAVITY * dt * 0.3 // 降低火花重力，让条状更持久

    const px = s.x
    const py = s.y
    s.x += s.vx * dt
    s.y += s.vy * dt

    // 记录轨迹实现长条效果
    s.trail.unshift({ x: s.x, y: s.y })
    if (s.trail.length > 25) s.trail.pop() // 增加轨迹长度

    let alpha = (1 - lifeT) * s.alpha
    if (s.flicker > 0 && lifeT > 0.3) {
      alpha *= (0.6 + Math.sin(now * 0.03) * 0.4)
    }

    ctx.globalAlpha = Math.max(0, alpha)
    
    // 绘制长条轨迹
    if (s.trail.length > 1) {
      ctx.beginPath()
      ctx.lineWidth = s.radius * (1 - lifeT * 0.6)
      ctx.lineCap = 'round'
      ctx.strokeStyle = hsla(s.hue, s.sat, s.light, 1)
      ctx.moveTo(s.trail[0].x, s.trail[0].y)
      for (let j = 1; j < s.trail.length; j++) {
        const p = s.trail[j]
        // 轨迹末端逐渐变细变透明
        ctx.globalAlpha = alpha * (1 - j / s.trail.length)
        ctx.lineTo(p.x, p.y)
      }
      ctx.stroke()
    }

    // 头部发光点
    if (lifeT < 0.9) {
      drawGlowDot(ctx, s.x, s.y, s.radius * 1.1, s.hue, alpha, s.sat, s.light + 10)
    }

    if (lifeT >= 1 || s.y > canvas.height + 50) {
      sparks.splice(i, 1)
    }
  }

  ctx.restore()
}

const start = () => {
  const canvas = canvasEl.value
  if (!canvas) return

  resizeCanvas()
  startAt = performance.now()
  lastFrameAt = 0
  lastLaunchAt = 0

  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }

  resizeObserver = new ResizeObserver(() => {
    resizeCanvas()
  })
  resizeObserver.observe(canvas)

  window.addEventListener('pointerdown', handlePointerDown)

  rafId = requestAnimationFrame(step)
}

const stop = () => {
  window.removeEventListener('pointerdown', handlePointerDown)
  if (rafId != null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  rockets.length = 0
  sparks.length = 0
  flashes.length = 0
  textEffects.length = 0

  const canvas = canvasEl.value
  const ctx = canvas?.getContext('2d')
  if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
}

onMounted(() => {
  start()
})

watch(() => props.enabled, (enabled) => {
  if (enabled) {
    if (rafId == null) start()
    return
  }

  stop()
})

onBeforeUnmount(() => {
  stop()
})
</script>

<style scoped>
.fireworks-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* 解决穿透交互 */
}
</style>

