<script lang="ts">
export function useFormLabelFieldProps(
  props: MaybeRefOrGetter<AtomicFormLabelFieldProps>,
) {
  return computed<AtomicFormLabelFieldProps>(() =>
    pick(toValue(props), [
      'label',
      'labelPlacement',
      'hideLabel',
      'message',
      'error',
    ]),
  );
}
</script>

<script setup lang="ts">
import { computed, toValue } from 'vue';

import type { MaybeRefOrGetter } from 'vue';

import pick from '~/utils/pick';

export interface AtomicFormLabelFieldProps {
  label?: string;
  labelPlacement?: 'top' | 'left' | 'right' | 'bottom';
  hideLabel?: boolean;
  message?: string;
  error?: boolean;
}

withDefaults(defineProps<AtomicFormLabelFieldProps>(), {
  label: undefined,
  labelPlacement: 'right',
  message: undefined,
});

const id = `field-${Math.round(Math.random() * 1e5)}`;
</script>

<template>
  <div
    class="atomic-form-label-field"
    :class="{
      'atomic-form-label-field--error': error,
      'atomic-form-label-field--label-hide': hideLabel,
      [`atomic-form-label-field--label-${labelPlacement}`]: !!labelPlacement,
    }"
  >
    <label class="atomic-form-label-field__container">
      <span
        v-if="label || $slots.label"
        class="atomic-form-label-field__label"
      >
        <slot name="label">
          {{ label }}
        </slot>
      </span>

      <span class="atomic-form-label-field__control">
        <slot name="default" />
      </span>
    </label>
    <div
      v-show="message || $slots.message"
      :id="`${id}-message`"
      class="atomic-form-label-field__message"
    >
      <slot
        :error="error"
        :message="message"
        name="message"
      >
        {{ message }}
      </slot>
    </div>
  </div>
</template>

<style lang="scss">
@use 'sass:map';

.atomic-form-label-field {
  display: inline-flex;
  flex-direction: column;

  &__container {
    display: inline-flex;
    align-items: center;
    column-gap: 6px;
    font-size: 0.875rem;
    user-select: none;
    cursor: pointer;
  }

  &--label-top &__container {
    flex-direction: column;
  }

  &--label-left &__container {
    flex-direction: row;
  }

  &--label-right &__container {
    flex-direction: row-reverse;
  }

  &--label-bottom &__container {
    flex-direction: column-reverse;
  }

  &--label-hide &__label {
    @include sr-only;
  }

  &__control {
    display: inline-flex;
  }

  &__message {
    display: flex;
    margin-top: 4px;
    font-size: 0.75rem;
    color: #6b7280;
  }

  &--error &__message {
    color: map.get($color-map, 'danger');
  }
}
</style>
