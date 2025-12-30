<template>
	<div class="home-root">
		<FireworksCanvas class="home-fireworks" />

		<div class="home-shell">
			<main class="home-main">
				<section class="home-card" aria-label="2026 元旦快乐">
					<div class="home-actions">
						<button
							class="action-btn"
							@click="settings.toggleTheme"
							:title="settings.isDark ? '切换到浅色模式' : '切换到深色模式'"
						>
							<div :class="settings.isDark ? 'i-carbon-sun' : 'i-carbon-moon'" />
						</button>
						<button
							class="action-btn"
							@click="toggleLang"
							:title="settings.lang === 'zh-CN' ? 'Switch to English' : '切换到中文'"
						>
							<div class="i-carbon-language" />
						</button>
					</div>

					<div class="home-badge">
						<span class="home-badge-dot" aria-hidden="true" />
						<span class="home-badge-text">{{ t('home.badge') }}</span>
					</div>

					<h1 class="home-year">2026</h1>
					<h2 class="home-title">{{ t('home.title') }}</h2>
					<p class="home-subtitle" v-html="t('home.subtitle')" />

					<div class="home-divider" aria-hidden="true" />

					<p class="home-wish">{{ t('home.wish') }}</p>
				</section>
			</main>
		</div>
	</div>
</template>

<script setup lang="ts">
import FireworksCanvas from '@/components/FireworksCanvas.vue'
import { useSettingsStore } from '@/store/settings'
import { useI18n } from 'vue-i18n'

const settings = useSettingsStore()
const { t } = useI18n()

const toggleLang = () => {
	const newLang = settings.lang === 'zh-CN' ? 'en' : 'zh-CN'
	settings.setLang(newLang)
}
</script>

<style scoped>
.home-root {
	position: relative;
	height: 100vh;
	height: 100dvh;
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
	height: 100%;
	padding: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.home-main {
	width: min(920px, 100%);
}

.home-card {
	position: relative;
	border: 1px solid color-mix(in oklab, var(--border-color) 85%, transparent);
	background: color-mix(in oklab, var(--card-bg) 88%, transparent);
	border-radius: 24px;
	padding: clamp(20px, 4vw, 44px);
	backdrop-filter: blur(10px);
	-webkit-backdrop-filter: blur(10px);
	box-shadow: 0 10px 30px color-mix(in oklab, var(--text-main) 10%, transparent);
	max-height: calc(100vh - 48px);
}

.home-actions {
	position: absolute;
	top: 20px;
	right: 20px;
	display: flex;
	gap: 12px;
	z-index: 10;
}

.action-btn {
	width: 40px;
	height: 40px;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid color-mix(in oklab, var(--border-color) 50%, transparent);
	background: color-mix(in oklab, var(--card-bg) 50%, transparent);
	color: var(--text-main);
	cursor: pointer;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	backdrop-filter: blur(4px);
	-webkit-backdrop-filter: blur(4px);
}

.action-btn:hover {
	background: color-mix(in oklab, var(--color-primary) 15%, transparent);
	border-color: var(--color-primary);
	transform: translateY(-2px);
	color: var(--color-primary);
}

.action-btn:active {
	transform: translateY(0);
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
