<script lang="ts">
interface AtomicTabsContext {
  modelValue: Ref<any>;
  lookup: ComputedRef<Record<any, { id: string; tabpanelId: string }>>;
}

export const TABS_INJECT_KEY: InjectionKey<AtomicTabsContext> = Symbol();

export function defineTabs<T>(
  tabs: () => AtomicTabsItem<T>[]
): Readonly<Ref<AtomicTabsItem<T>[]>>;
export function defineTabs<T>(
  tabs: AtomicTabsItem<T>[]
): Ref<AtomicTabsItem<T>[]>;
export function defineTabs<T>(tabs: MaybeRefOrGetter<AtomicTabsItem<T>[]>) {
  return toRef(tabs);
}
</script>

<script setup lang="ts" generic="T">
import { computed, provide, toRef } from 'vue';

import type { ComputedRef, InjectionKey, MaybeRefOrGetter, Ref } from 'vue';

import { moveFocus, nextItem, previousItem } from '~/utils/dom';
import isNullOrUndefined from '~/utils/isNullOrUndefined';
import noop from '~/utils/noop';

export interface AtomicTabsItem<Value> {
  /**
   * NOTICE: 確保這裡值唯一值
   */
  value: Value;

  /**
   * 顯示文字
   */
  label: string;

  /**
   * 是否禁用
   */
  disabled?: boolean;
}

type AtomicTabsProps = {
  modelValue?: T;

  /**
   * Tabs 列表
   */
  items: AtomicTabsItem<T>[];

  /**
   * 是否禁用
   */
  disabled?: boolean;

  /**
   * Tab 切換之前的 hook
   */
  onBeforeChange?(value: T, done: (valid?: boolean) => void): void;
};

type AtomicTabsEmits = {
  (event: 'update:modelValue', value: T): void;
};

const props = withDefaults(defineProps<AtomicTabsProps>(), {
  modelValue: undefined,
  onBeforeChange: undefined,
  prependIconActiveProps: undefined,
});

const emit = defineEmits<AtomicTabsEmits>();

const id = `tab-${Math.round(Math.random() * 1e5)}`;

const tabs = computed(() => {
  return props.items.map(item => {
    const disabled = props.disabled || item.disabled;
    const selected = item.value === props.modelValue;

    return {
      ...item,
      id: `tab-${id}-${item.value}`,
      tabpanelId: `tabpanel-${id}-${item.value}`,
      disabled,
      selected,
      class: {
        'atomic-tabs__tab--selected': selected,
      },
    };
  });
});

const lookup = computed(() => {
  return Object.fromEntries(tabs.value.map(item => [item.value, item]));
});

const onTabKeydown = (event: KeyboardEvent) => {
  const tablist = event.currentTarget as HTMLElement | null;
  const currentFocus = document.activeElement as HTMLElement;

  if (isNullOrUndefined(tablist)) return;

  switch (event.key) {
    case 'ArrowRight':
      event.preventDefault();
      moveFocus(tablist, currentFocus, nextItem);
      break;
    case 'ArrowLeft':
      event.preventDefault();
      moveFocus(tablist, currentFocus, previousItem);
      break;
    case 'Home':
      event.preventDefault();
      moveFocus(tablist, null, nextItem);
      break;
    case 'End':
      event.preventDefault();
      moveFocus(tablist, null, previousItem);
      break;
  }
};

const onTabClick = (value: T) => {
  if (props.modelValue === value) return;

  const { onBeforeChange } = props;

  if (!onBeforeChange || onBeforeChange.length <= 1) {
    onBeforeChange?.(value, noop);
    emit('update:modelValue', value);
    return;
  }

  onBeforeChange(value, valid => {
    if (valid === false) return;
    emit('update:modelValue', value);
  });
};

provide(TABS_INJECT_KEY, {
  modelValue: toRef(() => props.modelValue),
  lookup,
});
</script>

<template>
  <div class="atomic-tabs">
    <div
      class="atomic-tabs__tablist"
      role="tablist"
      @keydown="onTabKeydown"
    >
      <template
        v-for="tab in tabs"
        :key="tab.value"
      >
        <button
          :id="tab.id"
          :aria-controls="tab.tabpanelId"
          :aria-selected="`${tab.selected}`"
          class="atomic-tabs__tab"
          :class="tab.class"
          :disabled="tab.disabled"
          role="tab"
          :tabindex="tab.selected ? 0 : -1"
          type="button"
          @click="onTabClick(tab.value)"
        >
          <slot
            :item="tab"
            name="tab"
          >
            {{ tab.label }}
          </slot>
        </button>
      </template>
    </div>
    <slot name="default" />
  </div>
</template>

<style lang="scss">
@use 'sass:map';

.atomic-tabs {
  &__tablist {
    display: flex;
    align-items: center;
  }

  &__tab {
    padding: 0.75rem 0.5rem;
    min-width: 96px;
    font-size: 0.875rem;
    color: #616366;
    background-color: #e4e4e4;
    outline: none;
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;

    &:hover,
    &:focus {
      box-shadow: inset 0 -4px 20px rgba(black, 0.15);
    }
  }

  &__tab + &__tab {
    margin-left: 4px;
  }

  &__tab#{&}__tab--selected {
    font-weight: 700;
    color: white;
    background-color: map.get($color-map, 'primary');
  }
}
</style>
