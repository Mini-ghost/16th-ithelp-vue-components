<script lang="ts">
export function useFormFieldProps(
  props: MaybeRefOrGetter<AtomicFormFieldProps>,
) {
  return computed<AtomicFormFieldProps>(() =>
    pick(toValue(props), [
      'label',
      'labelPlacement',
      'labelWidth',
      'hideLabel',
      'message',
      'error',
      'required',
      'disabled',
      'readonly',
    ]),
  );
}
</script>

<script setup lang="ts">
import { computed, toValue } from 'vue';

import type { MaybeRefOrGetter } from 'vue';

import pick from '~/utils/pick';
import toUnit from '~/utils/toUnit';

export interface AtomicFormFieldProps {
  id?: string
  label?: string;
  labelPlacement?: 'top' | 'left';
  labelWidth?: string | number;
  hideLabel?: boolean;
  message?: string;
  error?: boolean;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
}

const props = withDefaults(defineProps<AtomicFormFieldProps>(), {
  id: undefined,
  label: undefined,
  labelPlacement: 'left',
  labelWidth: 'fit-content',
  message: undefined,
});

const id = computed(() =>  props.id || `field-${Math.round(Math.random() * 1e5)}`);

const rootStyle = computed(() => {
  const { labelWidth, hideLabel } = props;
  if (hideLabel) return;
  return {
    '--field-label-width': toUnit(labelWidth),
  };
});
</script>

<template>
  <div
    class="atomic-form-field"
    :class="{
      'atomic-form-field--error': error,
      'atomic-form-field--readonly': readonly,
      'atomic-form-field--disabled': disabled,
      'atomic-form-field--required': !hideLabel && required,
      'atomic-form-field--hide-label': hideLabel,
      [`atomic-form-field--label-${labelPlacement}`]: !!labelPlacement,
    }"
    :style="rootStyle"
  >
    <div class="atomic-form-field__container">
      <div
        v-if="label || $slots.label"
        class="atomic-form-field__label"
      >
        <label
          class="atomic-form-field__label-content"
          :for="id"
        >
          <slot
            :label="label"
            name="label"
          >
            <span>
              {{ label }}
            </span>
          </slot>
        </label>
      </div>

      <div class="atomic-form-field__content">
        <div class="atomic-form-field__control">
          <slot
            :id="id"
            :describedby="(message || $slots.message) ? `${id}-message` : undefined"
            name="default"
          />
        </div>
        <div
          v-show="message || $slots.message"
          :id="`${id}-message`"
          class="atomic-form-field__message"
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
    </div>
  </div>
</template>

<style lang="scss">
@use 'sass:map';

.atomic-form-field {
  --field-background: transparent;
  --field-color: #d1d5db;
  --field-active-color: #{map.get($color-map, 'primary')};
  --field-height: 38px;

  &--disabled {
    --field-background: rgba(239, 239, 239, 0.3);
    --field-color: #d1d5db;
    --field-active-color: #d1d5db;
  }

  &--error {
    --field-color: #{map.get($color-map, 'danger')};
    --field-active-color: #{map.get($color-map, 'danger')};
  }

  &__container {
    display: flex;
    width: 100%;
  }

  &--label-left &__container {
    align-items: stretch;
    column-gap: 8px;
  }

  &--label-top &__container {
    flex-direction: column;
    row-gap: 6px;
  }

  &__label {
    flex-shrink: 0;
    font-size: 0.875rem;
    user-select: none;
  }

  &--label-left &__label {
    width: var(--field-label-width);
    line-height: var(--field-height);
  }

  &--hide-label &__label {
    @include sr-only;
  }

  &--required &__label-content::after {
    padding-left: 4px;
    color: map.get($color-map, 'danger');
    content: '*';
  }

  &__content {
    width: 100%;
  }

  &__control {
    flex-grow: 1;
    display: flex;
    align-items: center;
    min-height: var(--field-height);
  }

  &__message {
    display: flex;
    padding-right: 4px;
    padding-left: 4px;
    font-size: 0.75rem;
    color: #6b7280;
  }

  &--error &__message {
    color: var(--field-color, #6b7280);
  }
}
</style>
