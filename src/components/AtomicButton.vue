<script setup lang="ts">
import { computed } from 'vue';

import AtomicLink from './AtomicLink.vue';

import type { ButtonHTMLAttributes } from 'vue';
import type { RouteLocationRaw } from 'vue-router';

export interface AtomicButtonProps {
  type?: ButtonHTMLAttributes['type'];

  /**
   * 外觀
   */
  variant?: 'contained' | 'outlined' | 'text';

  /**
   * 顏色
   */
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';

  /**
   * 大小
   */
  size?: 'normal' | 'small';

  /**
   * 形狀
   * @default normal
   */
  shape?: 'rectangle' | 'circle' | 'square';

  /**
   * 按鈕是否禁用
   */
  disabled?: boolean;

  /**
   * 如果有傳則 `to`，內部會渲染 `<AtomicLink :to="to" />`
   */
  to?: RouteLocationRaw;
}

const props = withDefaults(defineProps<AtomicButtonProps>(), {
  type: 'button',
  variant: 'contained',
  color: 'primary',
  size: 'normal',
  shape: 'rectangle',
  to: undefined,
});

const rootComponent = computed(() => {
  return props.to == null ? 'button' : AtomicLink;
});

const rootClass = computed(() => {
  const BASIC_CLASS = 'atomic-button';
  return [
    `${BASIC_CLASS}--${props.size}`,
    `${BASIC_CLASS}--${props.color}`,
    `${BASIC_CLASS}--${props.variant}`,
    `${BASIC_CLASS}--${props.shape}`,
  ];
});
</script>

<template>
  <component
    :is="rootComponent"
    class="atomic-button"
    :class="rootClass"
    :disabled="rootComponent === 'button' ? disabled : undefined"
    :to="to"
    :type="rootComponent === 'button' ? type : undefined"
  >
    <span v-if="$slots.prepend">
      <slot name="prepend" />
    </span>
    <span>
      <slot name="default" />
    </span>
    <span v-if="$slots.append">
      <slot name="append" />
    </span>
  </component>
</template>

<style lang="scss">
$name: '.atomic-button';

#{$name} {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  height: var(--button-size);
  font-size: 0.875rem;
  text-align: center;
  border-style: solid;
  border-width: 1px;
  border-color: transparent;
  outline: none;
  line-height: 1.25rem;
  column-gap: 10px;
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 0.15s;

  // size
  &--normal {
    --button-size: 36px;
    --button-padding: 20px;
  }

  &--small {
    --button-size: 32px;
    --button-padding: 10px;
  }

  // shape
  &--rectangle {
    padding-right: var(--button-padding);
    padding-left: var(--button-padding);
    border-radius: 6px;
  }

  &--square {
    width: var(--button-size);
    border-radius: 6px;
  }

  &--circle {
    width: var(--button-size);
    border-radius: 9999px;
  }

  // variant
  &--contained {
    color: white;

    @each $color, $value in $color-map {
      &#{$name}--#{$color} {
        background-color: rgba($value, 1);

        &:not(:disabled):is(:hover, :focus) {
          background-color: rgba($value, 0.8);
        }

        &:not(:disabled):active {
          background-color: rgba($value, 0.6);
        }
      }
    }

    &:disabled {
      background: lightgray;
    }
  }

  &--outlined {
    @each $color, $value in $color-map {
      &#{$name}--#{$color} {
        color: rgba($value, 1);
        border-color: rgba($value, 0.5);

        &:not(:disabled):is(:hover, :focus) {
          background-color: rgba($value, 0.05);
          border-color: rgba($value, 1);
        }

        &:not(:disabled):active {
          background-color: rgba($value, 0.2);
        }
      }
    }

    &:disabled {
      color: lightgray;
      border-color: lightgray;
    }
  }

  &--text {
    @each $color, $value in $color-map {
      &#{$name}--#{$color} {
        color: rgba($value, 1);

        &:not(:disabled):is(:hover, :focus) {
          background-color: rgba($value, 0.05);
        }

        &:not(:disabled):active {
          background-color: rgba($value, 0.1);
        }
      }
    }

    &:disabled {
      color: lightgray;
    }
  }

  // status
  &:disabled {
    cursor: not-allowed;
  }
}
</style>
