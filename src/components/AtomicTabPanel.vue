<script setup lang="ts">
import { computed, inject } from 'vue';

import { TABS_INJECT_KEY } from './AtomicTabs.vue';

import isNullOrUndefined from '~/utils/isNullOrUndefined';

interface AtomicTabPanelProps {
  value: any;
}

const props = withDefaults(defineProps<AtomicTabPanelProps>(), {
  value: undefined,
});

const context = inject(TABS_INJECT_KEY, null);

const hidden = computed(() => {
  if (isNullOrUndefined(context)) return false;
  return props.value !== context.modelValue.value ? true : false;
});

const tab = computed(() => {
  if (isNullOrUndefined(context)) return null;
  return context.lookup.value[props.value];
});
</script>

<template>
  <div
    :id="tab?.tabpanelId"
    :aria-labelledby="tab?.id"
    :hidden="hidden"
    :role="context ? 'tabpanel' : undefined"
  >
    <slot name="default" />
  </div>
</template>
