<script setup lang="ts">
import { computed } from 'vue';

import isNullOrUndefined from '~/utils/isNullOrUndefined';

type Numberish = number | `${number}`;

interface AtomicBadgeProps {
  content?: string | number | null;

  /**
   * badge 重疊的設定
   * @default 'circular'
   */
  overlap?: 'circular' | 'rectangular';

  /**
   * 顯示的最大數字
   * @default 99
   */
  max?: Numberish;

  /**
   * badge 的定位
   * @default 'top-right'
   */
  placement?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

  /**
   * badge 的大小
   * @default 'medium'
   */
  size?: 'dot' | 'medium' | 'large';

  /**
   * badge 的背景顏色
   * @default 'danger'
   */
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';

  /**
   * 是否顯示 0
   * @default false
   */
  showZero?: boolean;
}

const props = withDefaults(defineProps<AtomicBadgeProps>(), {
  content: undefined,
  overlap: 'circular',
  max: 99,
  placement: 'top-right',
  size: 'medium',
  color: 'danger',
  showZero: false,
});

const invisible = computed(() => {
  const { content, showZero } = props;
  return !showZero && Number(content) === 0;
});

const CONTENT_CLASS = 'atomic-badge__content';
const contentClass = computed(() =>
  [
    `${CONTENT_CLASS}--${props.placement}`,
    `${CONTENT_CLASS}--${props.overlap}`,
    `${CONTENT_CLASS}--${props.size}`,
    `${CONTENT_CLASS}--${props.color}`,
    invisible.value ? `${CONTENT_CLASS}--invisible` : '',
  ].join(' '),
);
</script>

<template>
  <span class="atomic-badge">
    <slot name="default" />
    <span
      class="atomic-badge__content"
      :class="contentClass"
    >
      <template v-if="(!isNullOrUndefined(content) || $slots.content) && size !== 'dot'">
        <slot name="content">
          {{ Number(content) > Number(max) ? `${max}+` : content }}
        </slot>
      </template>
    </span>
  </span>
</template>

<style lang="scss">
.atomic-badge {
  position: relative;

  &__content {
    --badge-scale: 1;

    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-right: 6px;
    padding-left: 6px;
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
    word-break: keep-all;
    line-height: 1;
    color: white;
    user-select: none;
    background-color: var(--badge-color);
    transition-property: transform;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;

    @extend %transform;

    &--rectangular {
      --badge-offset: 0;
    }

    &--circular {
      --badge-offset: 14.65%;
    }

    &--invisible {
      --badge-scale: 0;
    }

    @each $color, $value in $color-map {
      &--#{$color} {
        --badge-color: #{$value};
      }
    }

    &--dot {
      padding: 0;
      min-width: 9px;
      height: 9px;
      border-radius: 9999px;
    }

    &--medium {
      min-width: 20px;
      height: 20px;
      border-radius: 10px;
    }

    &--large {
      min-width: 30px;
      height: 30px;
      border-radius: 15px;
    }

    &--top-right {
      @extend %top;
      @extend %right;
    }

    &--top-left {
      @extend %top;
      @extend %left;
    }

    &--bottom-right {
      @extend %bottom;
      @extend %right;
    }

    &--bottom-left {
      @extend %bottom;
      @extend %left;
    }
  }
}

%transform {
  transform: translateX(var(--badge-translate-x))
    translateY(var(--badge-translate-y)) scale(var(--badge-scale));
}

%top {
  --badge-translate-y: -50%;

  top: var(--badge-offset);
}

%bottom {
  --badge-translate-y: 50%;

  bottom: var(--badge-offset);
}

%left {
  --badge-translate-x: -50%;

  left: var(--badge-offset);
}

%right {
  --badge-translate-x: 50%;

  right: var(--badge-offset);
}
</style>
