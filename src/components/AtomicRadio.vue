<script setup lang="ts">
import { computed } from 'vue';

import AtomicFormLabelField from './AtomicFormLabelField.vue';

interface AtomicRadioProps {
  modelValue?: any;
  value?: any;
  name?: string;
  label?: string;
  labelPlacement?: 'top' | 'left' | 'right' | 'bottom';
  hideLabel?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  disabled?: boolean;
}

interface AtomicRadioEmits {
  (type: 'update:modelValue', value: any): void;
}

const props = withDefaults(defineProps<AtomicRadioProps>(), {
  modelValue: undefined,
  value: undefined,
  name: undefined,
  label: undefined,
  labelPlacement: 'right',
  color: 'primary',
  trueValue: undefined,
  falseValue: undefined,
});

const emit = defineEmits<AtomicRadioEmits>();

const modelValueWritable = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  },
});
</script>

<template>
  <AtomicFormLabelField
    class="atomic-radio"
    :class="{
      'atomic-radio--disabled': disabled,
      [`atomic-radio--${color}`]: !!color,
    }"
    :hide-label="hideLabel"
    :label="label"
    :label-placement="labelPlacement"
  >
    <input
      v-model="modelValueWritable"
      class="atomic-radio__input"
      :disabled="disabled"
      :name="name"
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
