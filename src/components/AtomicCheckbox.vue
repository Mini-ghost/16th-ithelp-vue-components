<script setup lang="ts" generic="T extends any">
import { computed, onMounted, onUpdated, ref, shallowRef, watch } from 'vue';

import { useCheckboxContext } from './AtomicCheckboxGroup.vue';

import AtomicFormLabelField, {
  useFormLabelFieldProps,
} from '~/components/AtomicFormLabelField.vue';
import useControlled from '~/composables/useControlled';
import isNullOrUndefined from '~/utils/isNullOrUndefined';

interface AtomicCheckboxProps {
  modelValue?: T;
  value?: T extends Array<infer U> ? U : T extends Set<infer S> ? S : T;
  name?: string;
  indeterminate?: boolean;
  label?: string;
  labelPlacement?: 'top' | 'left' | 'right' | 'bottom';
  hideLabel?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  trueValue?: T | boolean;
  falseValue?: T | boolean;
  disabled?: boolean;
  message?: string;
  error?: boolean;
}

interface AtomicCheckboxEmits {
  (type: 'update:modelValue', event: T): void;
}

const props = withDefaults(defineProps<AtomicCheckboxProps>(), {
  modelValue: undefined,
  value: undefined,
  name: undefined,
  label: undefined,
  labelPlacement: 'right',
  color: 'primary',
  trueValue: undefined,
  falseValue: undefined,
  message: undefined,
});

const emit = defineEmits<AtomicCheckboxEmits>();

const context = useCheckboxContext();

const inputRef = ref<HTMLInputElement>();

const filedProps = useFormLabelFieldProps(() => ({
  ...(context?.props ?? props),
  label: props.label,
}));

const isControlled = useControlled(props, 'modelValue');

const modelValueLocal = shallowRef(props.modelValue ?? false);
const modelValueWritable = computed({
  get() {
    return context
      ? context.modelValue.value
      : isControlled.value
      ? props.modelValue!
      : modelValueLocal.value;
  },
  set(value) {
    if (context) {
      context.modelValue.value = value;
      return;
    }

    emit('update:modelValue', value);
    modelValueLocal.value = value;
  },
});

const inputAttrs = computed(() => {
  const source = context?.props ?? props;
  const { value, trueValue, falseValue } = props;
  return {
    name: source.name,
    disabled: source.disabled,
    indeterminate: props.indeterminate,
    value: value !== undefined ? value : '',
    ...(!isNullOrUndefined(trueValue) ? { 'true-value': trueValue } : {}),
    ...(!isNullOrUndefined(falseValue) ? { 'false-value': falseValue } : {}),
  };
});

const isChecked = ref(false);
const isIndeterminate = ref(!!props.indeterminate);

const rootClass = computed(() => {
  const source = context?.props ?? props;
  const disabled = source.disabled;
  const color = source.color;
  return {
    'atomic-checkbox--disabled': disabled,
    [`atomic-checkbox--${color}`]: !!color,
  };
});

const onChange = () => {
  const input = inputRef.value;
  isChecked.value = input?.checked ?? false;
  isIndeterminate.value = input?.indeterminate ?? false;
};

watch(
  () => props.indeterminate,
  value => {
    isIndeterminate.value = !!value;
  },
  { immediate: true },
);

watch(
  () => props.modelValue,
  value => {
    modelValueLocal.value = value;
  },
);

onMounted(onChange);
onUpdated(onChange);
</script>

<template>
  <AtomicFormLabelField
    class="atomic-checkbox"
    :class="rootClass"
    v-bind="filedProps"
  >
    <template
      v-if="label || $slots.label"
      #label
    >
      <slot name="label" />
    </template>

    <input
      ref="inputRef"
      v-model="modelValueWritable"
      v-bind="inputAttrs"
      class="atomic-checkbox__input"
      type="checkbox"
      @click.stop
    >

    <svg
      v-if="isIndeterminate"
      class="atomic-checkbox__icon atomic-checkbox__icon--indeterminate"
      fill="none"
      height="20"
      viewBox="0 0 20 20"
      width="20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15 0H5C2.23858 0 0 2.23858 0 5V15C0 17.7614 2.23858 20 5 20H15C17.7614 20 20 17.7614 20 15V5C20 2.23858 17.7614 0 15 0Z"
        fill="var(--checkbox-color)"
      />
      <path
        d="M4.65733 10C4.65733 9.44772 5.10505 9 5.65733 9H14.6278C15.1801 9 15.6278 9.44772 15.6278 10V10C15.6278 10.5523 15.1801 11 14.6278 11H5.65733C5.10504 11 4.65733 10.5523 4.65733 10V10Z"
        fill="white"
      />
    </svg>

    <svg
      v-else-if="isChecked"
      class="atomic-checkbox__icon atomic-checkbox__icon--checked"
      fill="none"
      height="20"
      viewBox="0 0 20 20"
      width="20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15 0H5C2.23858 0 0 2.23858 0 5V15C0 17.7614 2.23858 20 5 20H15C17.7614 20 20 17.7614 20 15V5C20 2.23858 17.7614 0 15 0Z"
        fill="var(--checkbox-color)"
      />
      <path
        d="M13.7328 6.10808C13.9201 5.92986 14.1692 5.83133 14.4277 5.83328C14.6862 5.83524 14.9337 5.93753 15.1182 6.11856C15.3027 6.29961 15.4097 6.54523 15.4165 6.80361C15.4233 7.06201 15.3295 7.31294 15.1548 7.50347L9.85233 14.1349C9.76116 14.2331 9.65116 14.3119 9.52883 14.3666C9.40649 14.4213 9.27433 14.4508 9.14041 14.4533C9.00641 14.4558 8.87333 14.4312 8.74899 14.3811C8.62474 14.3309 8.51183 14.2563 8.41708 14.1615L4.90073 10.6451C4.80279 10.5538 4.72425 10.4438 4.66978 10.3215C4.6153 10.1993 4.58601 10.0673 4.58365 9.9335C4.58129 9.79967 4.6059 9.66667 4.65604 9.54259C4.70616 9.4185 4.78078 9.30576 4.87542 9.21109C4.97007 9.11651 5.08281 9.04184 5.20691 8.99176C5.33102 8.94159 5.46395 8.91701 5.59779 8.91934C5.73161 8.92167 5.86359 8.95101 5.98585 9.00551C6.10812 9.05992 6.21815 9.13851 6.3094 9.23642L9.09224 12.0179L13.7076 6.13732C13.7159 6.12709 13.7235 6.11733 13.7328 6.10808Z"
        fill="white"
      />
    </svg>

    <svg
      v-else
      class="atomic-checkbox__icon atomic-checkbox__icon--unchecked"
      fill="none"
      height="20"
      viewBox="0 0 20 20"
      width="20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        fill="white"
        height="18.6"
        rx="5.3"
        width="18.6"
        x="0.7"
        y="0.7"
      />
      <rect
        height="18.6"
        rx="5.3"
        stroke="#C6C7CB"
        stroke-width="1.4"
        width="18.6"
        x="0.7"
        y="0.7"
      />
    </svg>

    <template
      v-if="message || $slots.message"
      #message
    >
      <slot
        :error="error"
        :message="message"
        name="message"
      >
        {{ props.message }}
      </slot>
    </template>
  </AtomicFormLabelField>
</template>

<style lang="scss">
@use 'sass:map';

.atomic-checkbox {
  @each $color, $value in $color-map {
    &--#{$color} {
      --checkbox-color: #{$value};
    }
  }

  &--disabled {
    --checkbox-color: #aaadb3;

    cursor: default;
  }

  &__input {
    @include sr-only;
  }

  &__icon {
    border-radius: 6px;
  }

  &__input:focus-visible + &__icon {
    outline: var(--checkbox-color) solid 2px;
    outline-offset: 2px;
  }

  // 如果要使用 CSS 控制顯示狀態，可以使用下列設定
  // &__icon--indeterminate {
  //   display: none;
  // }

  // &__input:checked ~ &__icon--unchecked,
  // &__input:not(:checked) ~ &__icon--checked {
  //   display: none;
  // }

  // &__input:indeterminate ~ &__icon--indeterminate {
  //   display: unset;
  // }

  // &__input:indeterminate ~ &__icon--checked,
  // &__input:indeterminate ~ &__icon--unchecked {
  //   display: none;
  // }
}
</style>
