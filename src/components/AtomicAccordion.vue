<script lang="ts">
type MaybeArray<T = unknown> = T | T[];

export interface AtomicAccordionValue<T = any> {
  modelValue: Ref<T[]>;
  toggle: (value: T) => void;
}

export const AtomicAccordionContext: InjectionKey<AtomicAccordionValue> =
  Symbol();
</script>

<script setup lang="ts" generic="T extends string | number | symbol">
import { computed, provide, ref, watch } from 'vue';

import type { InjectionKey, Ref } from 'vue';

import toArray from '~/utils/toArray';

interface AtomicAccordionProps {
  /**
   * 選中的值
   */
  modelValue?: MaybeArray<T>;

  /**
   * 是否可以多選
   */
  multiple?: boolean;
}

interface AtomicAccordionEmits {
  (event: 'update:modelValue', value: MaybeArray<unknown>): void;
}

const props = withDefaults(defineProps<AtomicAccordionProps>(), {
  modelValue: undefined,
});

const emit = defineEmits<AtomicAccordionEmits>();

const active = ref(toArray(props.modelValue!)) as Ref<T[]>;
const modelValueWritable = computed({
  get() {
    return active.value;
  },
  set(value) {
    active.value = value;
    emit('update:modelValue', props.multiple ? value : value[0]);
  },
});

const toggle = (value: T) => {
  const index = active.value.findIndex(item => item === value);

  if (props.multiple) {
    if (index === -1) {
      modelValueWritable.value = [...active.value, value];
      return;
    }

    const filtered = [...active.value];
    filtered.splice(index, 1);
    modelValueWritable.value = filtered;
    return;
  }

  modelValueWritable.value = index === -1 ? [value] : [];
};

watch(
  () => props.modelValue,
  value => {
    active.value = toArray(value!);
  },
);

provide(AtomicAccordionContext, {
  modelValue: modelValueWritable,
  toggle,
});
</script>

<template>
  <div class="atomic-accordion">
    <slot name="default" />
  </div>
</template>
