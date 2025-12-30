<template>
  <div class="fireworks-wrap" aria-hidden="true">
    <!-- 底层：只画爆炸粒子 + 残影淡出 -->
    <canvas ref="sparkEl" class="fireworks-canvas" />
    <!-- 顶层：画火箭、闪光、文字，每帧全清，保证清晰 -->
    <canvas ref="uiEl" class="fireworks-canvas" />
  </div>
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
const sparkEl = ref<HTMLCanvasElement | null>(null)
const uiEl = ref<HTMLCanvasElement | null>(null)

let rafId: number | null = null
let resizeObserver: ResizeObserver | null = null
let lastFrameAt = 0
let lastLaunchAt = 0
let startAt = 0

// 统一 DPR 记录
let dpr = 1
const computeDpr = () => {
  const raw = window.devicePixelRatio || 1
  const isMobile = matchMedia('(pointer: coarse)').matches
  dpr = Math.min(isMobile ? 1.5 : 2, raw)
}

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
  const s = sparkEl.value
  const u = uiEl.value
  if (!s || !u) return

  computeDpr()

  const rect = u.getBoundingClientRect()
  const width = Math.max(1, Math.floor(rect.width * dpr))
  const height = Math.max(1, Math.floor(rect.height * dpr))

  if (s.width !== width || s.height !== height) {
    s.width = width
    s.height = height
  }
  if (u.width !== width || u.height !== height) {
    u.width = width
    u.height = height
  }
}

const launchRocket = (customX?: number, customY?: number, isManual = false) => {
  const canvas = uiEl.value
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
    isManual,
  })
}

const handlePointerDown = (e: PointerEvent) => {
  const canvas = uiEl.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  
  const x = (e.clientX - rect.left) * dpr
  const y = (e.clientY - rect.top) * dpr
  
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
    dpr,
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

  const sEl = sparkEl.value
  const uEl = uiEl.value
  if (!sEl || !uEl) return
  const sCtx = sEl.getContext('2d')
  const uCtx = uEl.getContext('2d')
  if (!sCtx || !uCtx) return

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

  // --- 1. 处理 UI 层 (Rockets, Text, Flashes) ---
  // UI 层每帧完全擦除，确保文字和火箭头绝对清晰，无残留
  uCtx.clearRect(0, 0, uEl.width, uEl.height)
  uCtx.setTransform(1, 0, 0, 1, 0, 0)
  uCtx.globalAlpha = 1
  uCtx.globalCompositeOperation = 'source-over'

  // 绘制文字效果 (UI层)
  for (let i = textEffects.length - 1; i >= 0; i--) {
    const t = textEffects[i]
    t.ageMs += dt * 1000
    const progress = t.ageMs / t.lifeMs
    if (progress >= 1) {
      textEffects.splice(i, 1)
      continue
    }
    
    uCtx.save()
    const alpha = (1 - progress)
    uCtx.globalAlpha = alpha
    const hue = (t.hue + progress * 360) % 360
    const textLight = settings.isDark ? 70 : 50
    const shadowLight = settings.isDark ? 50 : 40
    
    uCtx.fillStyle = hsla(hue, 100, textLight, 1)
    uCtx.shadowBlur = 8
    uCtx.shadowColor = hsla(hue, 100, shadowLight, 0.6)
    
    const fontSize = Math.floor(24 + progress * 20)
    const fontStack = settings.lang === 'en' 
      ? '"Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
      : '"Inter", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", sans-serif'
    
    uCtx.font = `bold ${fontSize}px ${fontStack}`
    uCtx.textAlign = 'center'
    uCtx.textBaseline = 'middle'
    uCtx.fillText(t.text, t.x, t.y - progress * 80)
    uCtx.restore()
  }

  // 绘制闪光 (UI层)
  for (let i = flashes.length - 1; i >= 0; i--) {
    const f = flashes[i]
    f.ageMs += dt * 1000
    const t = f.ageMs / f.lifeMs
    if (t >= 1) {
      flashes.splice(i, 1)
      continue
    }
    uCtx.save()
    uCtx.globalAlpha = f.alpha * (1 - t)
    const grad = uCtx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius)
    const flashInnerLight = settings.isDark ? 90 : 60
    const flashOuterLight = settings.isDark ? 50 : 30
    grad.addColorStop(0, hsla(f.hue, 100, flashInnerLight, 1))
    grad.addColorStop(1, hsla(f.hue, 100, flashOuterLight, 0))
    uCtx.fillStyle = grad
    uCtx.beginPath()
    uCtx.arc(f.x, f.y, f.radius, 0, Math.PI * 2)
    uCtx.fill()
    uCtx.restore()
  }

  // 更新/绘制火箭 (UI层)
  for (let i = rockets.length - 1; i >= 0; i--) {
    const rocket = rockets[i]
    rocket.ageMs += dt * 1000
    const drag = Math.pow(AIR_DRAG, dt * 60)
    rocket.vx *= drag
    rocket.vy *= drag
    rocket.vy += GRAVITY * dt * 0.15
    rocket.x += rocket.vx * dt
    rocket.y += rocket.vy * dt

    const t = rocket.ageMs / rocket.lifeMs
    const a = clamp(1 - t, 0, 1)

    // 火箭尾迹 (UI层，短线)
    uCtx.save()
    uCtx.globalAlpha = 0.35 * a
    uCtx.lineCap = 'round'
    uCtx.lineWidth = 2.2 * dpr
    uCtx.strokeStyle = hsla(rocket.hue, 95, 75, 1)
    uCtx.beginPath()
    uCtx.moveTo(rocket.x, rocket.y)
    uCtx.lineTo(rocket.x - rocket.vx * 6 * dt, rocket.y - rocket.vy * 6 * dt)
    uCtx.stroke()

    // 火箭头 (UI层)
    uCtx.globalAlpha = 0.95 * a
    uCtx.fillStyle = hsla(rocket.hue, 95, 78, 1)
    uCtx.beginPath()
    uCtx.arc(rocket.x, rocket.y, 2.2 * dpr, 0, Math.PI * 2)
    uCtx.fill()
    uCtx.restore()

    const reachedTarget = rocket.y <= rocket.targetY
    const reachedPeak = rocket.vy >= 0
    const timeout = rocket.ageMs >= rocket.lifeMs
    const shouldExplode = rocket.isManual ? (reachedTarget || timeout) : (reachedTarget || reachedPeak || timeout)

    if (shouldExplode) {
      explode(rocket)
      rockets.splice(i, 1)
    }
  }

  // --- 2. 处理 Spark 层 (Particle Trails) ---
  // Spark 层使用 destination-out 实现渐隐拖尾
  sCtx.setTransform(1, 0, 0, 1, 0, 0)
  sCtx.save()
  sCtx.globalCompositeOperation = 'destination-out'
  sCtx.fillStyle = 'rgba(0, 0, 0, 0.22)'
  sCtx.fillRect(0, 0, sEl.width, sEl.height)
  sCtx.restore()

  sCtx.save()
  sCtx.globalCompositeOperation = settings.isDark ? 'screen' : 'source-over'

  // 更新/绘制火花 (Spark层)
  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i]
    s.ageMs += dt * 1000
    const lifeT = clamp(s.ageMs / s.lifeMs, 0, 1)

    s.vx *= Math.pow(s.decay, dt * 60)
    s.vy *= Math.pow(s.decay, dt * 60)
    s.vy += GRAVITY * dt * 0.3

    s.x += s.vx * dt
    s.y += s.vy * dt

    let alpha = (1 - lifeT) * s.alpha
    if (s.flicker > 0 && lifeT > 0.3) {
      alpha *= (Math.random() < 0.6 ? 0.55 : 1.0)
    }
    alpha = Math.max(0, alpha)

    // 1) 尾巴短线
    sCtx.globalAlpha = alpha * 0.22
    sCtx.lineCap = 'round'
    sCtx.lineWidth = 2.0 * dpr
    sCtx.strokeStyle = hsla(s.hue, s.sat, s.light, 1)
    sCtx.beginPath()
    sCtx.moveTo(s.x, s.y)
    sCtx.lineTo(s.x - s.vx * 1.8 * dt, s.y - s.vy * 1.8 * dt)
    sCtx.stroke()

    // 2) 粒子点
    sCtx.globalAlpha = alpha
    sCtx.beginPath()
    sCtx.fillStyle = hsla(s.hue, s.sat, s.light, 1)
    sCtx.arc(s.x, s.y, (2.0 + 0.9 * (1 - alpha)) * dpr, 0, Math.PI * 2)
    sCtx.fill()

    if (lifeT >= 1 || s.y > sEl.height + 50) {
      sparks.splice(i, 1)
    }
  }
  sCtx.restore()
}

const start = () => {
  if (!sparkEl.value || !uiEl.value) return

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
  // 观察 UI 层即可，两者同步
  resizeObserver.observe(uiEl.value)

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

  const sCtx = sparkEl.value?.getContext('2d')
  const uCtx = uiEl.value?.getContext('2d')
  if (sCtx) sCtx.clearRect(0, 0, sparkEl.value!.width, sparkEl.value!.height)
  if (uCtx) uCtx.clearRect(0, 0, uiEl.value!.width, uiEl.value!.height)
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
.fireworks-wrap {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}
.fireworks-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  display: block;
}
</style>

