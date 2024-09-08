
<script setup lang="ts">
import { cloneVNode, computed, Fragment, h } from 'vue';

import type { Slot } from 'vue';

import resolveSlotChildren from '~/helpers/resolveSlotChildren';

interface AtomicRadioGroupProps {
  modelValue?: any;
  name?: string;
  label?: string;
  labelPlacement?: 'top' | 'left' | 'right' | 'bottom';
  hideLabel?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  disabled?: boolean;
}

interface AtomicRadioGroupEmits {
  (type: 'update:modelValue', event: any): void;
}

interface AtomicRadioGroupSlots {
  default?: () => ReturnType<Slot>;
}

const props = withDefaults(defineProps<AtomicRadioGroupProps>(), {
  modelValue: undefined,
  name: undefined,
  label: undefined,
  labelPlacement: 'left',
  color: 'primary',
  trueValue: undefined,
  falseValue: undefined,
});

const emit = defineEmits<AtomicRadioGroupEmits>();

const slots = defineSlots<AtomicRadioGroupSlots>();

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

