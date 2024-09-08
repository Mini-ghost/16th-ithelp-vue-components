<script setup lang="ts">
import {
  computed,
  createElementBlock,
  defineComponent,
  ref,
  vModelText,
  withDirectives,
} from 'vue';

import type { Component, InputHTMLAttributes } from 'vue';

import AtomicFormField, {
  useFormFieldProps,
} from '~/components/AtomicFormField.vue';
import useControlled from '~/composables/useControlled';
import useStringLength from '~/composables/useStringLength';
import isComponent from '~/utils/isComponent';

interface AtomicTextFieldProps {
  modelValue?: string | number;
  modelModifiers?: Record<string, boolean>;
  type?: 'text' | 'password' | 'email' | 'tel' | 'number';
  placeholder?: string;
  label?: string;
  labelPlacement?: 'top' | 'left';
  labelWidth?: string | number;
  hideLabel?: boolean;
  prepend?: string | Component;
  append?: string | Component;
  name?: string;
  maxlength?: InputHTMLAttributes['maxlength'];
  minlength?: InputHTMLAttributes['minlength'];
  showCount?: boolean;
  message?: string;
  error?: boolean;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
}

interface AtomicTextFieldEmits {
  (event: 'update:modelValue', value: string | number | undefined): void;
}

const props = withDefaults(defineProps<AtomicTextFieldProps>(), {
  modelValue: undefined,
  modelModifiers: () => ({}),
  type: 'text',
  placeholder: undefined,
  label: undefined,
  labelPlacement: 'left',
  labelWidth: 'fit-content',
  prepend: undefined,
  append: undefined,
  name: undefined,
  maxlength: undefined,
  minlength: undefined,
  message: undefined,
});

const emit = defineEmits<AtomicTextFieldEmits>();

const fieldProps = useFormFieldProps(() => props);

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

const shouldShowCount = computed(() => {
  if (props.modelModifiers.number || props.type === 'number') return false;
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
        'input',
        {
          'onUpdate:modelValue': (event: string | number) =>
            (modelValueWritable.value = event),
        },
        null,
        512, /* NEED_PATCH */
      ),
      [[vModelText, modelValueWritable.value, '', props.modelModifiers]],
    );
  },
});
</script>

<template>
  <AtomicFormField
    class="atomic-text-field"
    v-bind="fieldProps"
  >
    <template
      v-if="$slots.label"
      #label
    >
      <slot name="label" />
    </template>
    <template #default="{ id, describedby }">
      <div class="atomic-text-field__container">
        <span
          v-if="prepend || $slots.prepend"
          class="atomic-text-field__prepend"
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
          class="atomic-text-field__input"
          :disabled="disabled"
          :maxlength="maxlength"
          :minlength="minlength"
          :name="name"
          :placeholder="placeholder"
          :readonly="readonly"
          :type="type"
          @click.stop
        />
        <span
          v-if="append || $slots.append"
          class="atomic-text-field__append"
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
      <span class="atomic-text-field__message">
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
.atomic-text-field {
  &__container {
    display: flex;
    align-items: center;
    overflow: hidden;
    width: 100%;
    height: var(--field-height);
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
    padding-right: 12px;
    padding-left: 12px;
    width: 100%;
    height: 100%;
    outline: none;
    flex-grow: 1;

    &:disabled {
      background-color: transparent;
    }
  }

  &__prepend {
    padding-left: 12px;
  }

  &__prepend + &__input {
    padding-left: 0;
  }

  &__append {
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
