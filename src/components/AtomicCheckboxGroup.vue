<script lang="ts">
const AtomicCheckboxContext: InjectionKey<{
  modelValue: Ref<any>;
  props: AtomicCheckboxGroupProps;
}> = Symbol();

export function useCheckboxContext() {
  const context = inject(AtomicCheckboxContext, null);
  return context;
}
</script>

<script setup lang="ts">
import { computed, inject, provide, ref } from 'vue';

import type { InjectionKey, Ref } from 'vue';

import useControlled from '~/composables/useControlled';

export interface AtomicCheckboxGroupProps {
  modelValue?: any[];
  name?: string;
  labelPlacement?: 'top' | 'left' | 'right' | 'bottom';
  hideLabel?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  disabled?: boolean;
  message?: string;
  error?: boolean;
}

interface AtomicCheckboxGroupEmits {
  (type: 'update:modelValue', value: any): void;
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

const isControlled = useControlled(props, 'modelValue');

const modelValueLocal = ref(props.modelValue);
const modelValueWritable = computed({
  get() {
    return isControlled.value ? props.modelValue : modelValueLocal.value;
  },
  set(value) {
    emit('update:modelValue', value);
    modelValueLocal.value = value;
  },
});

provide(AtomicCheckboxContext, {
  modelValue: modelValueWritable,
  props,
});
</script>

<template>
  <slot name="default" />
</template>
