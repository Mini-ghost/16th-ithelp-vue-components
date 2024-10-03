<script setup lang="ts" generic="Value extends string | number | symbol, Context">
import { computed, defineComponent, ref, withDirectives } from 'vue';

import AtomicPopover from '~/components/AtomicPopover.vue';
import { moveFocus, nextItem, previousItem } from '~/utils/dom';
import isFunction from '~/utils/isFunction';
import noop from '~/utils/noop';

import type { Slot } from 'vue';
import type { ComponentProps } from 'vue-component-type-helpers';
import findFirstLegitChild from '~/helpers/findFirstLegitChild';

type AtomicPopoverProps = ComponentProps<typeof AtomicPopover>;

interface AtomicDropdownItem {
  label: string;
  value: Value;
  onClick?(value: Value, close: () => void): void;
  disabled?: boolean;
  context?: Context;
}

interface AtomicDropdownProps {
  items: AtomicDropdownItem[];
  trigger?: 'click' | 'hover'
  placement?: AtomicPopoverProps['placement'];
  offset?: AtomicPopoverProps['offset'];
  disabled?: boolean
}

interface AtomicPopoverSlots {
  default?: () => ReturnType<Slot>;
  menuitem?: (props: Omit<AtomicDropdownItem, 'onClick'>) => ReturnType<Slot>;
}

const props = withDefaults(defineProps<AtomicDropdownProps>(), {
  items: () => [],
  trigger: 'click',
  placement: 'bottom-start',
  offset: 8,
});

const slots = defineSlots<AtomicPopoverSlots>();

const active = ref(false);
const close = () => (active.value = false);

const referenceRef = ref<HTMLElement>();
const menuRef = ref<HTMLElement>();

const ReferenceComponent = defineComponent({
  name: 'ReferenceComponent',
  setup() {
    return () => {
      const child = findFirstLegitChild(slots.default?.());
      if (!child) return;

      return withDirectives(child, [
        [
          {
            mounted(el: HTMLElement) {
              referenceRef.value = el;
            },
            updated(el: HTMLElement) {
              referenceRef.value = el;
            },
            unmounted() {
              referenceRef.value = undefined;
            },
          },
        ],
      ]);
    };
  },
});

const itemsCompose = computed(() => {
  return props.items.map((item, index) => {
    const onClick = () => {
      if (item.disabled) return;
      if (!isFunction(item.onClick)) {
        close();
        return;
      }

      if (item.onClick.length <= 1) {
        item.onClick(item.value, noop);
        close();
        return;
      }

      return item.onClick(item.value, close);
    };

    const onKeydown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();

      onClick();
    };

    return {
      ...item,
      disabled: props.disabled || item.disabled,
      tabindex: index === 0 ? 0 : -1,
      onClick,
      onKeydown,
    };
  });
});

const onMenuKeydown = (event: KeyboardEvent) => {
  const container = menuRef.value as HTMLElement;
  const currentFocus = document.activeElement as HTMLElement;

  if (!container) return;

  switch (event.key) {
    case 'Tab':
      event.preventDefault();
      active.value = false;
      break;
    case 'ArrowDown':
      event.preventDefault();
      moveFocus(container, currentFocus, nextItem);
      break;
    case 'ArrowUp':
      event.preventDefault();
      moveFocus(container, currentFocus, previousItem);
      break;
    case 'Home':
      event.preventDefault();
      moveFocus(container, null, nextItem);
      break;
    case 'End':
      event.preventDefault();
      moveFocus(container, null, previousItem);
      break;
  }
};
</script>

<template>
  <AtomicPopover
    v-model="active"
    :disabled="disabled"
    :offset="offset"
    :placement="placement"
    :trigger="trigger"
  >
    <template #reference>
      <ReferenceComponent aria-haspopup="true" />
    </template>

    <ul
      ref="menuRef"
      class="atomic-dropdown"
      role="menu"
      tabindex="-1"
      @keydown="onMenuKeydown"
    >
      <li
        v-for="item in itemsCompose"
        :key="item.value"
        class="atomic-dropdown__menuitem"
        role="menuitem"
        :tabindex="item.tabindex"
        @click="item.onClick"
        @keydown="item.onKeydown"
      >
        <slot
          :context="item.context"
          :disabled="item.disabled"
          :label="item.label"
          name="menuitem"
          :value="item.value"
        >
          {{ item.label }}
        </slot>
      </li>
    </ul>
  </AtomicPopover>
</template>

<style lang="scss">
@use 'sass:map';

.atomic-dropdown {
  background-color: white;
  overflow-y: auto;
  padding: 4px;
  max-height: 180px;
  border-radius: 4px;
  box-shadow: 0 2px 4px 1px rgba(0, 0, 0, 0.1);

  &__menuitem {
    padding: 8px;
    cursor: pointer;
    user-select: none;
    border-radius: 4px;

    &:hover,
    &:focus {
      background-color: rgba(map.get($color-map, 'primary'), 0.05);
    }

    &:focus {
      outline: 1px solid rgba(map.get($color-map, 'primary'), 0.2);
    }

    & + & {
      margin-top: 4px;
    }
  }
}
</style>
