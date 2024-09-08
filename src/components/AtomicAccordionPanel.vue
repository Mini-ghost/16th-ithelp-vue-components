<script setup lang="ts" generic="T extends string | number | symbol">
import { computed, inject, ref, watch } from 'vue';

import { AtomicAccordionContext } from './AtomicAccordion.vue';

import type { AtomicAccordionValue } from './AtomicAccordion.vue';

import ArrowSvg from '~/assets/svg/arrow.svg?component';
// import TransitionCollapse from './TransitionCollapse';

import isNullOrUndefined from '~/utils/isNullOrUndefined';

interface AtomicAccordionPanelProps {
  modelValue?: boolean;
  summary?: string;
  value?: T;
  disabled?: boolean;
}

interface AtomicAccordionPanelEmits {
  (event: 'update:modelValue', value: boolean): void;
}

const props = withDefaults(defineProps<AtomicAccordionPanelProps>(), {
  modelValue: undefined,
  summary: undefined,
  value: undefined,
});

const emit = defineEmits<AtomicAccordionPanelEmits>();

const context = inject<AtomicAccordionValue<T> | undefined>(
  AtomicAccordionContext,
  undefined,
);

const id = `accordion-${Math.round(Math.random() * 1e5)}`;

const internal = ref(!!props.modelValue);
const isActive = computed({
  get() {
    if (!context || isNullOrUndefined(props.value)) return internal.value;
    return context.modelValue.value.includes(props.value);
  },
  set(value) {
    if (props.disabled) return;
    if (!context || isNullOrUndefined(props.value)) {
      internal.value = value;
      emit('update:modelValue', value);
      return;
    }

    context.toggle(props.value);
  },
});

const onSummaryClick = () => (isActive.value = !isActive.value);

const contentRef = ref<HTMLElement>();

const unWatch = watch(contentRef, content => {
  if (!content) return;
  content.style.display = !isActive.value ? 'none' : '';
  unWatch();
});

const TRANSITION = 'all 300ms ease-in-out';
watch(isActive, (value, _, onCleanup) => {
  const content = contentRef.value;
  if (!content) return;

  if (value) {
    // 開
    content.style.display = '';
    content.style.overflow = 'hidden';

    const height = content.scrollHeight;

    content.style.height = '0';
    content.style.paddingTop = '0';
    content.style.paddingBottom = '0';

    void content.offsetHeight; // force reflow

    content.style.transition = TRANSITION;

    requestAnimationFrame(() => {
      content.style.height = `${height}px`;
    });
  } else {
    // 閉
    content.style.transition = TRANSITION;
    content.style.height = `${content.scrollHeight}px`;
    content.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      content.style.height = '0';
      content.style.paddingTop = '0';
      content.style.paddingBottom = '0';
    });
  }

  const callback = () => {
    content.style.height = '';
    content.style.paddingTop = '';
    content.style.paddingBottom = '';
    content.style.overflow = '';
    content.style.transition = '';

    if (!value) content.style.display = 'none';

    content.removeEventListener('transitionend', callback);
  };

  content.addEventListener('transitionend', callback);

  onCleanup(() => {
    content.removeEventListener('transitionend', callback);
  });
});
</script>

<template>
  <div
    class="atomic-accordion__details"
    :class="{ 'atomic-accordion__details--open': isActive }"
  >
    <button
      :id="`${id}-summary`"
      :aria-controls="`${id}-content`"
      :aria-expanded="isActive"
      class="atomic-accordion__summary"
      :disabled="disabled"
      type="button"
      @click="onSummaryClick"
    >
      <span class="atomic-accordion__title">
        <slot
          :active="isActive"
          name="summary"
        >
          {{ summary }}
        </slot>
      </span>

      <span class="atomic-accordion__marker">
        <ArrowSvg
          height="20"
          width="20"
        />
      </span>
    </button>

    <div
      :id="`${id}-content`"
      ref="contentRef"
      :aria-labelledby="`${id}-summary`"
      class="atomic-accordion__content"
      role="region"
    >
      <slot name="default" />
    </div>
  </div>
</template>

<style lang="scss">
.atomic-accordion {
  &__details {
    border-bottom: 1px solid #e5e7eb;
  }

  &__details:first-child {
    border-top: 1px solid #e5e7eb;
  }

  &__summary {
    display: flex;
    align-items: center;
    padding: 16px 18px;
    width: 100%;
    font-size: 1.125rem;
  }

  &__title {
    flex-grow: 1;
    text-align: start;
  }

  &__content {
    padding-right: 18px;
    padding-bottom: 16px;
    padding-left: 18px;
  }

  &__marker {
    transition: transform 300ms;
  }

  &__details--open &__marker {
    transform: rotate(180deg);
  }
}
</style>
