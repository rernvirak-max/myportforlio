<script setup>
// MaxTune "Equalizer-M" logo mark (five bars, mint -> coral gradient).
// Inline SVG so it needs no extra request and scales crisply.
// Decorative: it always sits next to the visible name "Vireak Roeun".
import { useId } from 'vue';

defineProps({
  size: { type: [Number, String], default: 40 }
});

const gradientId = `brand-grad-${useId()}`;
</script>

<template>
  <svg
    class="brand-logo"
    :width="size"
    :height="size"
    viewBox="0 0 1024 1024"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <linearGradient :id="gradientId" gradientUnits="userSpaceOnUse" x1="176" y1="0" x2="848" y2="0">
        <stop offset="0" stop-color="#3dffb5" />
        <stop offset="1" stop-color="#ff7a45" />
      </linearGradient>
    </defs>
    <rect width="1024" height="1024" rx="224" fill="#0d0f15" />
    <rect x="2" y="2" width="1020" height="1020" rx="222" fill="none" stroke="#fff" stroke-opacity="0.1" stroke-width="4" />
    <g fill="none" :stroke="`url(#${gradientId})`" stroke-width="96" stroke-linecap="round">
      <path d="M224 280V744" />
      <path d="M368 280V424" />
      <path d="M512 280V554" />
      <path d="M656 280V424" />
      <path d="M800 280V744" />
    </g>
  </svg>
</template>
