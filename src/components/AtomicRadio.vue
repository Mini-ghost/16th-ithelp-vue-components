<script lang="ts">
type CombinedKey =
  | 'name'
  | 'labelPlacement'
  | 'hideLabel'
  | 'color'
  | 'disabled'
  | 'error';
</script>

<script setup lang="ts">
import { computed, inject } from 'vue';

import AtomicFormLabelField from './AtomicFormLabelField.vue';
import { RADIO_INJECT_KEY } from './AtomicRadioGroup.vue';

interface AtomicRadioProps {
  modelValue?: any;
  value?: any;
  name?: string;
  label?: string;
  labelPlacement?: 'top' | 'left' | 'right' | 'bottom';
  hideLabel?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  message?: string;
  disabled?: boolean;
  error?: boolean;
}

interface AtomicRadioEmits {
  (event: 'update:modelValue', value: any): void;
}

const props = withDefaults(defineProps<AtomicRadioProps>(), {
  modelValue: undefined,
  value: undefined,
  name: undefined,
  label: undefined,
  labelPlacement: undefined,
  color: undefined,
  message: undefined,
});

const emit = defineEmits<AtomicRadioEmits>();

const context = inject(RADIO_INJECT_KEY, null);

const modelValueWritable = computed({
  get() {
    if (context) return context.modelValue.value;
    return props.modelValue;
  },
  set(value) {
    if (context) {
      context.modelValue.value = value;
      return;
    }

    emit('update:modelValue', value);
  },
});

const marge = <Key extends CombinedKey>(key: Key): AtomicRadioProps[Key] => {
  return props[key] ?? context!.props[key];
};

const mergedProps = computed(() => {
  if (!context) return props;

  return {
    name: marge('name'),
    labelPlacement: marge('labelPlacement') ?? 'right',
    hideLabel: marge('hideLabel'),
    color: marge('color') ?? 'primary',
    disabled: marge('disabled'),
    error: marge('error'),
  };
});
</script>

<template>
  <AtomicFormLabelField
    class="atomic-radio"
    :class="{
      'atomic-radio--disabled': mergedProps.disabled,
      [`atomic-radio--${mergedProps.color}`]: !!mergedProps.color,
    }"
    :hide-label="mergedProps.hideLabel"
    :label="label"
    :label-placement="mergedProps.labelPlacement"
  >
    <input
      v-model="modelValueWritable"
      class="atomic-radio__input"
      :disabled="mergedProps.disabled"
      :name="mergedProps.name"
      type="radio"
      :value="value"
    >
    <svg
      class="atomic-radio__icon atomic-radio__icon--unpicked"
      fill="none"
      height="26"
      viewBox="0 0 20 20"
      width="26"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="10"
        cy="10"
        fill="#AAADB3"
        opacity="0.2"
        r="8"
      />
      <circle
        cx="10"
        cy="10"
        r="7"
        stroke="#AAADB3"
        stroke-width="2"
      />
    </svg>

    <svg
      class="atomic-radio__icon atomic-radio__icon--picked"
      fill="none"
      height="26"
      viewBox="0 0 20 20"
      width="26"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="10"
        cy="10"
        fill="var(--radio-color)"
        r="8"
      />
      <circle
        cx="10"
        cy="10"
        fill="white"
        r="3"
      />
    </svg>
  </AtomicFormLabelField>
</template>

<style lang="scss">
@use 'sass:map';

.atomic-radio {
  @each $color, $value in $color-map {
    &--#{$color} {
      --radio-color: #{$value};
    }
  }

  &--disabled {
    --radio-color: #aaadb3;

    cursor: default;
  }

  &__input {
    @include sr-only;
  }

  &__icon {
    border-radius: 9999px;
  }

  &__input:checked ~ .atomic-radio__icon--unpicked,
  &__input:not(:checked) ~ .atomic-radio__icon--picked {
    display: none;
  }

  &__input:focus-visible + &__icon {
    outline: var(--radio-color) solid 2px;
  }
}
</style>
