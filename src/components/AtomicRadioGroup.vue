<script lang="ts">
interface AtomicRadioContext {
  modelValue: Ref<any>;
  props: AtomicRadioGroupProps;
};

export const RADIO_INJECT_KEY: InjectionKey<AtomicRadioContext> = Symbol();
</script>

<script setup lang="ts">
import { computed, provide, ref } from 'vue';

import type { InjectionKey, Ref } from 'vue';
import useControlled from '~/composables/useControlled';

export interface AtomicRadioGroupProps {
  modelValue?: any;
  name?: string;
  labelPlacement?: 'top' | 'left' | 'right' | 'bottom';
  hideLabel?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  disabled?: boolean;
  error?: boolean;
}

interface AtomicRadioGroupEmits {
  (event: 'update:modelValue', value: any): void;
}

const props = withDefaults(defineProps<AtomicRadioGroupProps>(), {
  modelValue: undefined,
  name: undefined,
  labelPlacement: undefined,
  color: undefined,
});

const emit = defineEmits<AtomicRadioGroupEmits>();

const isControlled = useControlled(props, 'modelValue');

const modelValueLocal = ref(props.modelValue ?? false);
const modelValueWritable = computed({
  get() {
    return isControlled.value
      ? props.modelValue!
      : modelValueLocal.value;
  },
  set(value) {
    emit('update:modelValue', value);
    modelValueLocal.value = value;
  },
});

provide(RADIO_INJECT_KEY, {
  modelValue: modelValueWritable,
  props,
});
</script>

<template>
  <slot name="default" />
</template>

