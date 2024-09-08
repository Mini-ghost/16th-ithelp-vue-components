<script setup lang="ts" generic="Value extends string | number | symbol, Context">
import { ref } from 'vue';

import type { Slot } from 'vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import AtomicPopover from '~/components/AtomicPopover.vue';

type AtomicPopoverProps = ComponentProps<typeof AtomicPopover>;

interface AtomicDropdownProps {
  content?: string;
  trigger?: AtomicPopoverProps['trigger'];
  placement?: AtomicPopoverProps['placement'];
  offset?: AtomicPopoverProps['offset'];
  disabled?: boolean;
}

interface AtomicPopoverSlots {
  default?: () => ReturnType<Slot>;
  content?: () => ReturnType<Slot>;
}

withDefaults(defineProps<AtomicDropdownProps>(), {
  content: undefined,
  trigger: () => ['hover', 'focus'],
  placement: 'bottom-start',
  offset: 8,
});

const slots = defineSlots<AtomicPopoverSlots>();

const arrowRef = ref<HTMLElement>();
</script>

<template>
  <AtomicPopover
    :arrow="arrowRef && {
      element: arrowRef,
      padding: 4,
    }"
    :disabled="disabled"
    :offset="offset"
    :placement="placement"
    role="tooltip"
    :trigger="trigger"
  >
    <template #reference>
      <slot name="default" />
    </template>

    <template
      v-if="content || slots.content"
      #default="{ arrowStyle }"
    >
      <div class="atomic-tooltip">
        <slot name="content">
          {{ content }}
        </slot>
        <span
          ref="arrowRef"
          aria-hidden="true"
          class="atomic-tooltip__arrow"
          :style="arrowStyle"
        />
      </div>
    </template>
  </AtomicPopover>
</template>

<style lang="scss">
.atomic-tooltip {
  padding: 6px 10px;
  font-size: 0.875rem;
  color: white;
  background-color: #232323;
  border-radius: 4px;

  &__arrow {
    overflow: hidden;
    width: 14px;
    height: 14px;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 10px;
      height: 10px;
      transform: rotate(-45deg);
      transform-origin: top left;
      background-color: #232323;
    }
  }
}
</style>
