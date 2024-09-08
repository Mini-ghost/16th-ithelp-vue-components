<script lang="ts">
const toFixed = (value: number) => Number(value.toFixed(2));
</script>

<script setup lang="ts">
import { computed } from 'vue';

import usePercentage from '~/composables/usePercentage';

type Numberish = number | `${number}`;

interface AtomicProgressProps {
  /**
   * @default 'liner'
   */
  variants?: 'liner' | 'circular';

  /**
   * @default 'primary'
   */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

  /**
   * 持續動畫，在載入進度未知時使用。
   */
  indeterminate?: boolean;

  /**
   * The value of the progress.
   */
  value?: Numberish;

  /**
   * The maximum value of the progress.
   */
  max?: Numberish;

  /**
   * The thickness of the progress.
   * @default 8
   */
  thickness?: Numberish;

  /**
   * The size of the progress.
   * @default 64
   */
  size?: Numberish;

  /**
   * The indicator of the progress.
   *
   * @default false
   */
  indicator?: boolean | 'percentage' | 'value';
}

const props = withDefaults(defineProps<AtomicProgressProps>(), {
  variants: 'liner',
  color: 'primary',
  indeterminate: false,
  value: 0,
  max: 100,
  thickness: 8,
  size: 64,
  indicator: false,
});

const BASE_CLASS = 'atomic-progress';
const rootClass = computed(() => [
  `${BASE_CLASS}--${props.color}`,
  `${BASE_CLASS}--${props.variants}`,
  {
    [`${BASE_CLASS}--indeterminate`]: props.indeterminate,
  },
]);

const percentage = usePercentage(
  () => Number(props.value),
  () => Number(props.max),
);

const halfSize = computed(() => Number(props.size) / 2);

const radius = computed(() => {
  return toFixed((Number(props.size) - Number(props.thickness)) / 2);
});

const circumference = computed(() => toFixed(2 * Math.PI * radius.value));

const length = computed(() => {
  return !props.indeterminate
    ? toFixed(circumference.value * (percentage.value / 100))
    : toFixed(circumference.value * 0.33);
});
</script>

<template>
  <div
    :aria-valuemax="max"
    aria-valuemin="0"
    :aria-valuenow="!indeterminate ? value : undefined"
    class="atomic-progress"
    :class="rootClass"
    role="progressbar"
    :style="{
      '--progress-thickness': `${thickness}px`,
      '--progress-size': `${size}px`,
    }"
  >
    <template v-if="variants === 'liner'">
      <div class="atomic-progress__trail">
        <div
          class="atomic-progress__track"
          :style="!indeterminate
            ? {
              transform: `translateX(${percentage - 100}%)`,
              // width: `${percentage}%`
            }
            : undefined
          "
        />
      </div>
    </template>
    <template v-else>
      <svg
        aria-hidden="true"
        :height="size"
        :viewBox="`0 0 ${size} ${size}`"
        :width="size"
      >
        <circle
          class="atomic-progress__circular-trail"
          :cx="halfSize"
          :cy="halfSize"
          fill="none"
          :r="radius"
          stroke="#F1F1F1"
          stroke-linecap="round"
          :stroke-width="thickness"
        />
        <template v-if="length">
          <circle
            class="atomic-progress__circular-track"
            :cx="halfSize"
            :cy="halfSize"
            fill="none"
            :r="radius"
            stroke="#1976D2"
            :stroke-dasharray="`${length} ${circumference}`"
            stroke-linecap="round"
            :stroke-width="thickness"
          />
        </template>
      </svg>
    </template>
    <span
      v-if="!indeterminate && (indicator || $slots.default)"
      :class="variants === 'liner' ? 'atomic-progress__indicator' : 'atomic-progress__circular-indicator'"
    >
      <slot
        name="default"
        :percentage="percentage"
        :value="value"
      >
        {{ indicator === 'value' ? value : `${percentage}%` }}
      </slot>
    </span>
  </div>
</template>

<style lang="scss">
@keyframes indeterminate-liner {
  0% {
    transform: translateX(-100%);
  }

  60% {
    transform: translateX(0%);
  }

  100% {
    transform: translateX(100%);
  }
}

@keyframes indeterminate-circular {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.atomic-progress {
  @each $color, $value in $color-map {
    &--#{$color} {
      --progress-color: #{$value};
    }
  }

  &--liner {
    display: flex;
    align-items: center;
    column-gap: 12px;
  }

  &__trail {
    overflow: hidden;
    width: 100%;
    height: var(--progress-thickness);
    background-color: #f1f1f1;
    border-radius: 99999px;
  }

  &__track {
    height: 100%;
    background-color: var(--progress-color);
    border-radius: 99999px;
    transition: transform 0.3s;
  }

  &--liner#{&}--indeterminate &__track {
    animation: indeterminate-liner 2s ease infinite running;
  }

  &--circular {
    position: relative;
    display: inline-block;
    width: fit-content;
    height: fit-content;
  }

  &__circular-track {
    transform: rotate(-90deg);
    transform-origin: center;
    stroke: var(--progress-color);
  }

  &__circular-indicator {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 1.25rem;
  }

  &--circular#{&}--indeterminate &__circular-track {
    animation: indeterminate-circular 500ms linear infinite;
  }
}
</style>
