<script setup lang="ts">
import {
  computed,
  createElementBlock,
  defineComponent,
  ref,
  vModelText,
  // watch,
  withDirectives,
} from 'vue';

import type { Component, TextareaHTMLAttributes } from 'vue';

import AtomicFormField, {
  useFormFieldProps,
} from '~/components/AtomicFormField.vue';
import useControlled from '~/composables/useControlled';
import useResizeObserver from '~/composables/useResizeObserver';
import useStringLength from '~/composables/useStringLength';
import clamp from '~/utils/clamp';
import isComponent from '~/utils/isComponent';

interface AtomicTextareaProps {
  modelValue?: string;
  modelModifiers?: Record<string, boolean>;
  placeholder?: string;
  label?: string;
  labelPlacement?: 'top' | 'left';
  labelWidth?: string | number;
  hideLabel?: boolean;
  prepend?: string | Component;
  append?: string | Component;
  name?: string;
  maxlength?: TextareaHTMLAttributes['maxlength'];
  minlength?: TextareaHTMLAttributes['minlength'];
  rows?: TextareaHTMLAttributes['rows'];
  maxRows?: TextareaHTMLAttributes['rows'];
  showCount?: boolean;
  message?: string;
  error?: boolean;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  autosize?: boolean | 'cacheMeasurements';
}

interface AtomicTextareaEmits {
  (event: 'update:modelValue', value: string | undefined): void;
}

const props = withDefaults(defineProps<AtomicTextareaProps>(), {
  modelValue: undefined,
  modelModifiers: () => ({}),
  placeholder: undefined,
  label: undefined,
  labelPlacement: 'left',
  labelWidth: 'fit-content',
  prepend: undefined,
  append: undefined,
  name: undefined,
  maxlength: undefined,
  minlength: undefined,
  rows: 2,
  maxRows: undefined,
  message: undefined,
  autosize: false,
});

const emit = defineEmits<AtomicTextareaEmits>();

const isControlled = useControlled(props, 'modelValue');

const modelValueLocal = ref(props.modelValue ?? '');
const modelValueWritable = computed({
  get() {
    return isControlled.value ? props.modelValue! : modelValueLocal.value;
  },
  set(value) {
    emit('update:modelValue', value);
    modelValueLocal.value = value;
  },
});

const fieldProps = useFormFieldProps(() => props);

const textareaRef = ref<HTMLTextAreaElement>();

const shouldShowCount = computed(() => {
  if (props.modelModifiers.number) return false;
  return props.showCount ?? false;
});

const stringCount = useStringLength(() => {
  if (!shouldShowCount.value) return '';
  return `${modelValueWritable.value}`;
});

const InputComponent = defineComponent({
  render() {
    return withDirectives(
      createElementBlock(
        'textarea',
        {
          ref: textareaRef,
          'onUpdate:modelValue': (event: string) =>
            (modelValueWritable.value = event),
        },
        null,
        512, /* NEED_PATCH */
      ),
      [[vModelText, modelValueWritable.value, '', props.modelModifiers]],
    );
  },
});

const getSizingStyle = (node: HTMLElement) => {
  const computedStyle = window.getComputedStyle(node);

  const paddingSize =
    parseFloat(computedStyle.paddingTop) +
    parseFloat(computedStyle.paddingBottom);

  const lineHeight = parseFloat(computedStyle.lineHeight);

  return { paddingSize, lineHeight };
};

let measurementsCache: ReturnType<typeof getSizingStyle> | undefined;
const calcTextareaHeight = () => {
  if (!props.autosize) return;

  const node = textareaRef.value;
  if (!node) return;

  node.rows = Number(props.rows);

  const { paddingSize, lineHeight } =
    props.autosize === 'cacheMeasurements' && measurementsCache
      ? measurementsCache
      : (measurementsCache = getSizingStyle(node));

  node.style.overflow = 'hidden';

  const newRows = clamp(
    (node.scrollHeight - paddingSize) / lineHeight,
    node.rows,
    Number(props.maxRows ?? Infinity),
  );

  node.rows = newRows;
  node.style.overflow = '';
};

const onInput = () => calcTextareaHeight();

useResizeObserver(textareaRef, calcTextareaHeight);
</script>

<template>
  <AtomicFormField
    class="atomic-textarea"
    :class="{
      'atomic-textarea--autosize': props.autosize,
    }"
    v-bind="fieldProps"
  >
    <template
      v-if="$slots.label"
      #label
    >
      <slot name="label" />
    </template>
    <template #default="{ id, describedby }">
      <div class="atomic-textarea__container">
        <span
          v-if="prepend || $slots.prepend"
          class="atomic-textarea__prepend"
        >
          <slot name="prepend">
            <template v-if="isComponent(prepend)">
              <component :is="prepend" />
            </template>
            <template v-else>
              {{ prepend }}
            </template>
          </slot>
        </span>
        <InputComponent
          :id="id"
          :aria-describedby="describedby"
          class="atomic-textarea__input"
          :disabled="disabled"
          :name="name"
          :placeholder="placeholder"
          :readonly="readonly"
          :rows="rows"
          @click.stop
          @input="onInput"
        />
        <span
          v-if="append || $slots.append"
          class="atomic-textarea__append"
        >
          <slot name="append">
            <template v-if="isComponent(append)">
              <component :is="append" />
            </template>
            <template v-else>
              {{ append }}
            </template>
          </slot>
        </span>
      </div>
    </template>
    <template
      v-if="message || $slots.message || shouldShowCount"
      #message
    >
      <span class="atomic-textarea__message">
        <slot name="message">
          {{ message }}
        </slot>
      </span>
      <span v-if="shouldShowCount">
        {{ stringCount }}<template v-if="maxlength">/{{ maxlength }}</template>
      </span>
    </template>
  </AtomicFormField>
</template>

<style lang="scss">
.atomic-textarea {
  &__container {
    display: flex;
    overflow: hidden;
    width: 100%;
    background-color: var(--field-background);
    border-style: solid;
    border-width: 1px;
    border-color: var(--field-color);
    border-radius: 6px;
    column-gap: 6px;

    &:hover,
    &:focus-within {
      border-color: var(--field-active-color);
    }
  }

  &__input {
    padding: 6px 12px;
    width: 100%;
    height: 100%;
    outline: none;
    flex-grow: 1;

    &:disabled {
      background: transparent;
    }
  }

  &--autosize &__input {
    resize: none;
  }

  &__prepend {
    padding-top: 8px;
    padding-left: 12px;
  }

  &__prepend + &__input {
    padding-left: 0;
  }

  &__append {
    padding-top: 8px;
    padding-right: 12px;
  }

  &__container:has(&__append) &__input {
    padding-right: 0;
  }

  &__message {
    flex-grow: 1;
  }
}
</style>
