<template>
	<div class="home-root">
		<FireworksCanvas class="home-fireworks" />

		<div class="home-shell">
			<main class="home-main">
				<section class="home-card" aria-label="2026 元旦快乐">
					<div class="home-badge">
						<span class="home-badge-dot" aria-hidden="true" />
						<span class="home-badge-text">HAPPY NEW YEAR</span>
					</div>

					<h1 class="home-year">2026</h1>
					<h2 class="home-title">元旦快乐</h2>
					<p class="home-subtitle">
						愿你在新的一年里，心怀热爱，步履不停。<br />
						愿希望如烟花，照亮前路。
					</p>

					<div class="home-divider" aria-hidden="true" />

					<p class="home-wish">平安喜乐 · 万事顺遂 · 所愿皆可期</p>
				</section>
			</main>
		</div>
	</div>
</template>

<script setup lang="ts">
import FireworksCanvas from '@/components/FireworksCanvas.vue'
</script>

<style scoped>
.home-root {
	position: relative;
	min-height: 100vh;
	overflow: hidden;
	background: var(--bg-color);
	color: var(--text-main);
}

.home-root::before,
.home-root::after {
	content: '';
	position: absolute;
	inset: -30vmax;
	pointer-events: none;
	background:
		radial-gradient(circle at 20% 20%, color-mix(in oklab, var(--color-primary) 35%, transparent), transparent 55%),
		radial-gradient(circle at 78% 28%, color-mix(in oklab, var(--color-primary) 22%, transparent), transparent 60%),
		radial-gradient(circle at 50% 80%, color-mix(in oklab, var(--color-primary) 16%, transparent), transparent 60%);
	filter: blur(10px);
	opacity: 0.9;
	transform: translateZ(0);
	z-index: 0; /* 确保在根背景之上，但在内容之下 */
}

.home-root::after {
	inset: -40vmax;
	opacity: 0.55;
	filter: blur(18px);
	z-index: 0;
}

.home-fireworks {
	z-index: 1;
}

.home-shell {
	position: relative;
	z-index: 2;
	min-height: 100vh;
	padding: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.home-main {
	width: min(920px, 100%);
}

.home-card {
	border: 1px solid color-mix(in oklab, var(--border-color) 85%, transparent);
	background: color-mix(in oklab, var(--card-bg) 88%, transparent);
	border-radius: 24px;
	padding: clamp(20px, 4vw, 44px);
	backdrop-filter: blur(10px);
	-webkit-backdrop-filter: blur(10px);
	box-shadow: 0 10px 30px color-mix(in oklab, var(--text-main) 10%, transparent);
}

.home-badge {
	display: inline-flex;
	align-items: center;
	gap: 10px;
	padding: 10px 14px;
	border-radius: 999px;
	border: 1px solid color-mix(in oklab, var(--color-primary) 30%, transparent);
	background: color-mix(in oklab, var(--color-primary) 10%, transparent);
	margin-bottom: 18px;
}

.home-badge-dot {
	width: 10px;
	height: 10px;
	border-radius: 999px;
	background: var(--color-primary);
	box-shadow: 0 0 0 4px color-mix(in oklab, var(--color-primary) 25%, transparent);
}

.home-badge-text {
	letter-spacing: 0.22em;
	font-weight: 700;
	font-size: 12px;
	color: color-mix(in oklab, var(--text-main) 78%, var(--color-primary));
}

.home-year {
	margin: 0;
	font-size: clamp(56px, 10vw, 96px);
	line-height: 1;
	letter-spacing: 0.02em;
	font-weight: 800;
	color: transparent;
	background: linear-gradient(
		90deg,
		color-mix(in oklab, var(--color-primary) 92%, #fff),
		color-mix(in oklab, var(--color-primary) 68%, var(--text-main)),
		color-mix(in oklab, var(--color-primary) 90%, #fff)
	);
	-webkit-background-clip: text;
	background-clip: text;
}

.home-title {
	margin: 10px 0 0;
	font-size: clamp(28px, 5.2vw, 44px);
	line-height: 1.15;
	font-weight: 800;
}

.home-subtitle {
	margin: 14px 0 0;
	font-size: clamp(14px, 2.5vw, 18px);
	line-height: 1.8;
	color: var(--text-secondary);
}

.home-divider {
	height: 1px;
	margin: 18px 0 14px;
	background: linear-gradient(
		90deg,
		transparent,
		color-mix(in oklab, var(--color-primary) 45%, var(--border-color)),
		transparent
	);
}

.home-wish {
	margin: 0;
	font-size: 14px;
	letter-spacing: 0.14em;
	color: color-mix(in oklab, var(--text-main) 86%, var(--color-primary));
}

@media (prefers-reduced-motion: reduce) {
	.home-root::before,
	.home-root::after {
		filter: none;
	}
}
</style>
