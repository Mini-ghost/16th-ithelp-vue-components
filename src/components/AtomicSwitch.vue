<script setup lang="ts" generic="T extends any">
import { computed, ref } from 'vue';

import type { Ref } from 'vue';

import AtomicFormLabelField, {
  useFormLabelFieldProps,
} from '~/components/AtomicFormLabelField.vue';
import useControlled from '~/composables/useControlled';
import isNullOrUndefined from '~/utils/isNullOrUndefined';

interface AtomicSwitchProps {
  modelValue?: T;
  name?: string;
  label?: string;
  labelPlacement?: 'top' | 'left' | 'right' | 'bottom';
  hideLabel?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  activeValue?: T;
  inactiveValue?: T;
  activeText?: string;
  inactiveText?: string;
  disabled?: boolean;
  message?: string;
  error?: boolean;
}

interface AtomicSwitchEmits {
  (event: 'update:modelValue', value: T | undefined): void;
}

const props = withDefaults(defineProps<AtomicSwitchProps>(), {
  modelValue: undefined,
  name: undefined,
  label: undefined,
  labelPlacement: 'left',
  color: 'primary',
  activeValue: undefined,
  inactiveValue: undefined,
  activeText: undefined,
  inactiveText: undefined,
  message: undefined,
});

const emit = defineEmits<AtomicSwitchEmits>();

const filedProps = useFormLabelFieldProps(props);

const isControlled = useControlled(props, 'modelValue');

const modelValueLocal = ref(props.modelValue) as Ref<T | undefined>;
const modelValueWritable = computed({
  get() {
    return isControlled.value ? props.modelValue : modelValueLocal.value;
  },
  set(value) {
    emit('update:modelValue', value);
    modelValueLocal.value = value;
  },
});

const isChecked = computed(() => {
  if (props.activeValue === undefined) return !!modelValueWritable.value;
  return modelValueWritable.value === props.activeValue;
});

const inputAttrs = computed(() => {
  const { activeValue, inactiveValue } = props;
  return {
    name: props.name,
    disabled: props.disabled,
    ...(!isNullOrUndefined(activeValue) ? { 'true-value': activeValue } : {}),
    ...(!isNullOrUndefined(inactiveValue)
      ? { 'false-value': inactiveValue }
      : {}),
  };
});
</script>

<template>
  <AtomicFormLabelField
    class="atomic-switch"
    :class="{
      'atomic-switch--disabled': disabled,
      [`atomic-switch--${color}`]: !!color,
    }"
    v-bind="filedProps"
  >
    <span
      v-if="inactiveText"
      :aria-hidden="`${isChecked}`"
      class="atomic-switch__text atomic-switch__text--inactive"
    >
      {{ inactiveText }}
    </span>
    <input
      v-model="modelValueWritable"
      v-bind="inputAttrs"
      class="atomic-switch__input"
      :disabled="disabled"
      :name="name"
      role="switch"
      type="checkbox"
      @click.stop
    >
    <span class="atomic-switch__track">
      <span class="atomic-switch__thumb" />
    </span>
    <span
      v-if="activeText"
      :aria-hidden="`${!isChecked}`"
      class="atomic-switch__text atomic-switch__text--active"
    >
      {{ activeText }}
    </span>
  </AtomicFormLabelField>
</template>

<style lang="scss">
@use 'sass:map';

.atomic-switch {
  --switch-width: 54px;
  --switch-height: 32px;
  --switch-padding: 3px;

  @each $color, $value in $color-map {
    &--#{$color} {
      --switch-color: #{$value};
    }
  }

  &--disabled {
    --switch-color: #aaadb3;

    cursor: default;
  }

  &__text {
    align-self: center;

    &--active {
      padding-left: 8px;
    }

    &--inactive {
      padding-right: 8px;
    }
  }

  &__input {
    @include sr-only;
  }

  &__track,
  &__thumb,
  &__text {
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 300ms;
  }

  &__track {
    position: relative;
    display: inline-block;
    width: var(--switch-width);
    height: var(--switch-height);
    background-color: #dedede;
    border-radius: 9999px;
    transition-property: background-color;
  }

  &__input:checked + &__track {
    --switch-thumb-translate: calc(var(--switch-width) - var(--switch-height));

    background-color: var(--switch-color);
  }

  &__input:focus-visible + &__track {
    outline: var(--switch-color) solid 2px;
    outline-offset: 2px;
  }

  &__thumb {
    --switch-thumb-size: calc(var(--switch-height) - 2 * var(--switch-padding));

    position: absolute;
    top: var(--switch-padding);
    left: var(--switch-padding);
    width: var(--switch-thumb-size);
    height: var(--switch-thumb-size);
    background-color: white;
    border-radius: 9999px;
    box-shadow: 1px 1px 0 #00000026;
    transform: translateX(var(--switch-thumb-translate, 0));
    transition-property: transform;
  }

  &__text {
    transition-property: color
  }

  &:has(&__input:checked) &__text--active,
  &:not(:has(&__input:checked)) &__text--inactive {
    color: var(--switch-color);
  }
}
</style>
