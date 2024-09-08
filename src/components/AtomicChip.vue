<script setup lang="ts">
import { computed } from 'vue';

import CloseSvg from '~/assets/svg/close.svg?component';

type LiteralUnion<T> = T | (string & {});

type AtomicChipProps = {
  as?: any;
  variant?: 'contained' | 'outlined' | 'text';
  color?: LiteralUnion<'primary' | 'success' | 'warning' | 'danger' | 'info'>;
  size?: 'medium' | 'small';
  label?: string;
  deletable?: boolean;
};

type AtomicChipEmits = {
  (event: 'delete', value: Event): void;
};

const props = withDefaults(defineProps<AtomicChipProps>(), {
  as: 'span',
  variant: 'contained',
  color: 'primary',
  size: 'medium',
  label: undefined,
  onDelete: undefined,
});

const emit = defineEmits<AtomicChipEmits>();

const BASIC_CLASS = 'atomic-chip';
const rootClass = computed(() => [
  `${BASIC_CLASS}--${props.size}`,
  `${BASIC_CLASS}--${props.color}`,
  `${BASIC_CLASS}--${props.variant}`,
]);
</script>

<template>
  <component
    :is="as"
    class="atomic-chip"
    :class="rootClass"
  >
    <span v-if="$slots.prepend">
      <slot name="prepend" />
    </span>
    <span>
      <slot name="default">
        {{ label }}
      </slot>
    </span>
    <span v-if="$slots.append">
      <slot name="append" />
    </span>
    <template v-if="deletable">
      <button
        aria-label="Delete"
        type="button"
        @click="emit('delete', $event)"
      >
        <CloseSvg
          fill="currentColor"
          height="16"
          width="16"
        />
      </button>
    </template>
  </component>
</template>

<style lang="scss">
.atomic-chip {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  font-size: 0.875rem;
  text-align: center;
  border-style: solid;
  border-width: 1px;
  border-color: transparent;
  border-radius: 5px;
  line-height: 1.25;
  column-gap: 4px;
  user-select: none;

  // size
  &--medium {
    padding: 4px 7.5px;
  }

  &--small {
    padding: 2px 8px;
  }

  @each $color, $value in $color-map {
    &--#{$color} {
      $second: rgba($value, 0.1);

      --chip-color: #{$value};
      --chip-color-second: #{$second};
    }
  }

  // variant
  &--contained {
    color: var(--chip-color);
    background-color: var(--chip-color-second);
  }

  &--outlined {
    color: var(--chip-color);
    border-color: var(--chip-color);
  }

  &--text {
    color: var(--chip-color);
  }
}
</style>
