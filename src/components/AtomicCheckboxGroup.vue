<script setup lang="ts">
import { cloneVNode, computed, Fragment, h } from 'vue';

import type { Slot } from 'vue';
import resolveSlotChildren from '~/helpers/resolveSlotChildren';

export interface AtomicCheckboxGroupProps {
  modelValue: any[];
  name?: string;
  labelPlacement?: 'top' | 'left' | 'right' | 'bottom';
  hideLabel?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  disabled?: boolean;
  message?: string;
  error?: boolean;
}

interface AtomicCheckboxGroupEmits {
  (event: 'update:modelValue', value: any): void;
}

interface AtomicCheckboxGroupSlots {
  default?: () => ReturnType<Slot>;
}

const props = withDefaults(defineProps<AtomicCheckboxGroupProps>(), {
  modelValue: () => [],
  name: undefined,
  labelPlacement: 'right',
  color: 'primary',
  message: undefined,
  disabled: false,
});

const emit = defineEmits<AtomicCheckboxGroupEmits>();

const slots = defineSlots<AtomicCheckboxGroupSlots>();

const modelValueWritable = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  },
});

const children = computed(() => resolveSlotChildren(slots.default?.()));

const DefaultVNode = computed(() => {
  const nodes = children.value;
  if (!nodes) return;

  const cloned = nodes.map(node =>
    cloneVNode(node, {
      ...props,
      ...node.props,
      modelValue: modelValueWritable.value,
      'onUpdate:modelValue': (value: any) => (modelValueWritable.value = value),
    }),
  );

  return h(Fragment, cloned);
});
</script>

<template>
  <component :is="DefaultVNode" />
</template>
