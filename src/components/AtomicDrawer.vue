<script lang="ts">
const ANCHOR_TO_TRANSITION_DIRECTION = {
  top: 'down',
  right: 'left',
  bottom: 'up',
  left: 'right',
} as const;
</script>

<script setup lang="ts">
import { computed } from 'vue';

import AtomicModal from '~/components/AtomicModal.vue';
import toUnit from '~/utils/toUnit';

interface AtomicDrawerProps {
  /**
   * Drawer 是否打開
   */
  modelValue: boolean;

  /**
   * Drawer 標題
   */
  title?: string;

  /**
   * Drawer 位置
   */
  anchor?: 'top' | 'bottom' | 'right' | 'left';

  /**
   * Drawer 的寬或是高
   */
  size?: number | string;
}

interface AtomicDrawerEmits {
  (event: 'update:modelValue', value: boolean): void;
}

const props = withDefaults(defineProps<AtomicDrawerProps>(), {
  title: undefined,
  anchor: 'right',
  size: 420,
  fullscreen: false,
});

const emit = defineEmits<AtomicDrawerEmits>();

const modelValueWritable = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  },
});
</script>

<template>
  <AtomicModal
    v-model="modelValueWritable"
    #="{ open }"
    class="atomic-drawer"
    :class="{
      [`atomic-drawer--${anchor}`]: !!anchor,
    }"
    :style="{
      '--drawer-size': toUnit(size),
    }"
  >
    <Transition
      appear
      :name="`transition-slide-${ANCHOR_TO_TRANSITION_DIRECTION[anchor]}`"
    >
      <div
        v-if="open"
        aria-modal="true"
        class="atomic-drawer__container"
        role="dialog"
        tabindex="-1"
      >
        <div
          v-if="title"
          class="atomic-drawer__header"
        >
          <slot name="header">
            <h2 class="atomic-drawer__title">
              <slot name="title">
                {{ title }}
              </slot>
            </h2>
          </slot>
        </div>
        <div class="atomic-drawer__content">
          <slot name="default" />
        </div>
      </div>
    </Transition>
  </AtomicModal>
</template>

<style lang="scss">
.atomic-drawer {
  &__container {
    position: fixed;
    overflow: auto;
    background-color: white;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }

  &--top &__container {
    top: 0;
    left: 0;
    width: 100%;
    height: var(--drawer-size);
    border-bottom-left-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
  }

  &--right &__container {
    top: 0;
    right: 0;
    width: var(--drawer-size);
    height: 100%;
    border-top-left-radius: 0.5rem;
    border-bottom-left-radius: 0.5rem;
  }

  &--bottom &__container {
    bottom: 0;
    left: 0;
    width: 100%;
    height: var(--drawer-size);
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
  }

  &--left &__container {
    top: 0;
    left: 0;
    width: var(--drawer-size);
    height: 100%;
    border-top-right-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
  }

  &__header {
    padding: 16px 24px;
  }

  &__title {
    font-size: 1.25rem;
    font-weight: bold;
  }

  &__content {
    padding: 16px 24px;
  }

  &__header + &__content {
    padding-top: 0;
  }
}
</style>
