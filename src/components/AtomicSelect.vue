<script lang="ts">
function toLowerCase(value: string) {
  return value.toLowerCase();
}

function scrollIntoView(element: HTMLElement | undefined) {
  requestAnimationFrame(() => {
    element?.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
    });
  });
}
</script>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';

import ArrowSvg from '~/assets/svg/arrow.svg?component';
import AtomicFormField, {
  useFormFieldProps,
} from '~/components/AtomicFormField.vue';
import AtomicPopover from '~/components/AtomicPopover.vue';
import useControlled from '~/composables/useControlled';
import { moveFocus, nextItem, previousItem } from '~/utils/dom';
import isNullOrUndefined from '~/utils/isNullOrUndefined';
import isSet from '~/utils/isSet';

interface AtomicSelectOption {
  value: any;
  label: string;
  disabled?: boolean;
}

interface AtomicSelectProps {
  modelValue?: any;
  options?: AtomicSelectOption[];
  placeholder?: string;
  label?: string;
  labelPlacement?: 'top' | 'left';
  labelWidth?: string | number;
  hideLabel?: boolean;
  name?: string;
  multiple?: boolean;
  message?: string;
  error?: boolean;
  required?: boolean;
  disabled?: boolean;
  filterable?: boolean;
}

interface AtomicSelectEmits {
  (event: 'update:modelValue', value: any): void;
}

const props = withDefaults(defineProps<AtomicSelectProps>(), {
  modelValue: undefined,
  options: undefined,
  placeholder: undefined,
  label: undefined,
  labelPlacement: 'left',
  labelWidth: 'fit-content',
  name: undefined,
  multiple: false,
  message: undefined,
});

const emit = defineEmits<AtomicSelectEmits>();

const id = `field-${Math.round(Math.random() * 1e5)}`;

const fieldProps = useFormFieldProps(() => props);

const active = ref(false);
const buttonRef = ref<HTMLElement>();
const filterRef = ref<HTMLInputElement>();
const menuRef = ref<HTMLElement>();

const isControlled = useControlled(props, 'modelValue');

const modelValueLocal = ref(props.modelValue);
const modelValueWritable = computed({
  get() {
    return isControlled.value ? props.modelValue : modelValueLocal.value;
  },
  set(value) {
    emit('update:modelValue', value);
    modelValueLocal.value = value;
  },
});

const filter = ref('');
const activeIndex = ref(-1);

const optionsComputed = computed(() => {
  if (!props.options) return [];

  const tabindex = props.filterable ? undefined : '0';

  const current = modelValueWritable.value;
  return props.options.map((option, index) => {
    const selected = props.multiple
      ? isSet(current)
        ? current.has(option.value)
        : Array.isArray(current)
        ? current.some(value => value === option.value)
        : current === option.value
      : current === option.value;

    return {
      ...option,
      selected,
      attrs: {
        role: 'option',
        id: `${id}--option-${option.value}`,
        tabindex,
        'aria-disabled': option.disabled || false,
        'aria-selected': selected,
        onClick: onOptionClick(option, index),
        onKeydown: onOptionKeydown(option),
        onKeyup: onOptionsKeyup,
      },
    };
  });
});

const filteredOptions = computed(() => {
  const options = optionsComputed.value;
  if (!options.length || !props.filterable || !filter.value) return options;

  const value = toLowerCase(filter.value);
  return options?.filter(option => {
    return toLowerCase(option.label).includes(value);
  });
});

const activedescendant = computed(() => {
  if (!props.filterable || activeIndex.value === -1) return;
  return filteredOptions.value[activeIndex.value]?.attrs.id;
});

const selected = computed(() => {
  const value = modelValueWritable.value;

  if (
    (isSet(value) && !value.size) ||
    (Array.isArray(value) && !value.length) ||
    isNullOrUndefined(value)
  ) {
    return;
  }

  return props.multiple
    ? optionsComputed.value.filter(option => option.selected)
    : optionsComputed.value.find(option => option.selected);
});

const display = computed(() => {
  if (props.multiple) {
    const values = selected.value as AtomicSelectOption[];
    if (!values || values.length === 0) return null;
    return values.map(value => value.label).join(', ');
  }

  return (selected.value as AtomicSelectOption)?.label;
});

const queryOptionElements = () => {
  return menuRef.value?.querySelectorAll('li');
};

const moveIndex = (currentIndex: number | null, direction: 'next' | 'prev') => {
  if (!props.filterable || !active.value) return;

  let nextIndex: number;
  const lastIndex = filteredOptions.value.length - 1;

  if (isNullOrUndefined(currentIndex)) {
    nextIndex = direction === 'next' ? lastIndex : 0;
  } else {
    nextIndex =
      direction === 'next'
        ? currentIndex !== lastIndex
          ? currentIndex + 1
          : 0
        : currentIndex !== 0
        ? currentIndex - 1
        : lastIndex;
  }

  const nextFocus = queryOptionElements()?.[nextIndex];
  if (nextFocus?.getAttribute('aria-disabled') === 'true') {
    moveIndex(nextIndex, direction);
    return;
  }

  activeIndex.value = nextIndex;
};

const onSearchKeydown = (event: KeyboardEvent) => {
  if (!props.filterable || !active.value) return;

  event.stopPropagation();

  if (event.isComposing) return;

  const currentIndex = activeIndex.value;
  switch (event.key) {
    case 'Enter': {
      event.preventDefault();
      const option = filteredOptions.value[currentIndex];
      if (!option) return;

      handleEmitChange(option.value);
      if (!props.multiple) active.value = false;
      return;
    }
    case 'Tab':
    case 'Escape':
      event.preventDefault();
      active.value = false;
      return;
    case 'ArrowDown':
      event.preventDefault();
      moveIndex(currentIndex, 'next');

      break;
    case 'ArrowUp':
      event.preventDefault();
      moveIndex(currentIndex, 'prev');
      break;
    case 'Home':
      event.preventDefault();
      moveIndex(null, 'prev');
      break;
    case 'End':
      event.preventDefault();
      moveIndex(null, 'next');
      break;
  }
};

const onMenuKeydown = (event: KeyboardEvent) => {
  const container = menuRef.value as HTMLElement;
  const currentFocus = document.activeElement as HTMLElement;

  if (!container) return;

  switch (event.key) {
    case ' ':
      event.preventDefault();
      break;
    case 'Tab':
      event.preventDefault();
      active.value = false;
      break;
    case 'ArrowDown':
      event.preventDefault();
      moveFocus(container, currentFocus, nextItem);
      break;
    case 'ArrowUp':
      event.preventDefault();
      moveFocus(container, currentFocus, previousItem);
      break;
    case 'Home':
      event.preventDefault();
      moveFocus(container, null, nextItem);
      break;
    case 'End':
      event.preventDefault();
      moveFocus(container, null, previousItem);
      break;
  }
};

const onOptionClick =
  (option: AtomicSelectOption, index: number) => (event: MouseEvent) => {
    event.preventDefault();
    handleEmitChange(option.value);

    if (props.filterable) {
      if (props.multiple) activeIndex.value = index;
      filterRef.value!.focus();
    }
  };

const onOptionKeydown =
  (option: AtomicSelectOption) => (event: KeyboardEvent) => {
    if (event.key !== 'Enter') return;

    event.preventDefault();
    handleEmitChange(option.value);
  };

const onOptionsKeyup = (event: KeyboardEvent) => {
  switch (event.key) {
    case ' ':
      // otherwise our <li> dispatches a keyup event
      // it's not behaver of the native <option> and causes
      // the <select> to close immediately since we open on space keydown
      event.preventDefault();

      break;
  }
};

const onInputFocus = () => {
  buttonRef.value?.focus();
};

const onPrepareOptions = () => {
  void optionsComputed.value;
};

const handleEmitChange = (value: any) => {
  if (props.multiple) {
    const selected = modelValueWritable.value;
    const method = isSet(selected) ? 'has' : 'includes';

    const values = optionsComputed.value
      .filter(option => {
        return option.value === value
          ? !selected?.[method](value)
          : option.selected;
      })
      .map(option => option.value);

    if (method === 'has') {
      modelValueWritable.value = new Set(values);
    } else {
      modelValueWritable.value = values;
    }

    return;
  }

  modelValueWritable.value = value;
  active.value = false;
};

watch(active, value => {
  if (props.filterable) return;
  if (!value) return;

  const target = props.multiple
    ? (selected.value as AtomicSelectOption[])?.at(-1)
    : selected.value;

  if (!target) return;

  const index = optionsComputed.value.findIndex(item => item === target);
  if (index === -1) return;

  nextTick(() => {
    queryOptionElements()?.[index]?.focus();
  });
});

watch(active, value => {
  if (!props.filterable) return;
  if (!value) {
    nextTick(() => {
      filter.value = '';
      activeIndex.value = -1;
    });
    return;
  }

  filterRef.value?.focus();

  let lastIndex = optionsComputed.value.findLastIndex(item => item.selected);
  if (lastIndex === -1) lastIndex = 0;
  activeIndex.value = lastIndex;
});

watch(filter, () => {
  if (!props.filterable || !active.value) return;
  const newIndex = filteredOptions.value.findIndex(
    options => !options.disabled,
  );

  activeIndex.value = newIndex;
});

watch(activeIndex, index => {
  if (index === -1) return;
  nextTick(() => {
    scrollIntoView(queryOptionElements()?.[index]);
  });
});
</script>

<template>
  <AtomicFormField
    :id="id"
    class="atomic-select"
    :class="{
      'atomic-select--active': active,
      'atomic-select--disabled': props.disabled,
      'atomic-select--filterable': props.filterable,
    }"
    v-bind="fieldProps"
    @mouseenter="onPrepareOptions"
  >
    <template
      v-if="label || $slots.label"
      #label
    >
      <slot
        :label="label"
        name="label"
      />
    </template>
    <template #default>
      <AtomicPopover
        v-model="active"
        auto-fit
        :disabled="disabled"
        placement="bottom-start"
        trigger="click"
      >
        <template #reference>
          <div
            ref="buttonRef"
            class="atomic-select__button"
            role="combobox"
            :tabindex="!disabled ? 0 : -1"
          >
            <span
              v-if="$slots.prepend"
              class="atomic-select__prepend"
            >
              <slot name="prepend" />
            </span>

            <span
              v-show="!filterable || !active"
              class="atomic-select__selection"
            >
              <span
                :class="{
                  'atomic-select__selected': display,
                  'atomic-select__placeholder': !display,
                }"
              >
                <slot
                  v-if="display"
                  name="display"
                >
                  {{ display }}
                </slot>
                <template v-else>
                  {{ placeholder }}
                </template>
              </span>
            </span>

            <input
              v-if="filterable"
              :id="id"
              ref="filterRef"
              v-model="filter"
              :aria-activedescendant="activedescendant"
              class="atomic-select__filter"
              :placeholder="placeholder"
              role="searchbox"
              type="text"
              @click.stop
              @keydown="onSearchKeydown"
            >

            <input
              v-else
              :id="id"
              class="atomic-select__input"
              :disabled="disabled"
              tabindex="-1"
              type="text"
              @click.stop
              @focus="onInputFocus"
            >

            <ArrowSvg class="atomic-select__arrow" />
          </div>
        </template>

        <ul
          v-if="!disabled"
          ref="menuRef"
          class="atomic-select__menu"
          role="listbox"
          tabindex="-1"
          @keydown="onMenuKeydown"
        >
          <template v-if="filteredOptions.length">
            <li
              v-for="(option, index) in filteredOptions"
              :key="option.value"
              class="atomic-select__option"
              :class="{
                'atomic-select__option--selected': option.selected,
                'atomic-select__option--disabled': option.disabled,
                'atomic-select__option--hover': filterable && index === activeIndex,
              }"
              v-bind="option.attrs"
            >
              <slot
                :index="index"
                :label="option.label"
                name="option"
                :selected="option.selected"
                :value="option.value"
              >
                {{ option.label }}
              </slot>
            </li>
          </template>
          <template v-else>
            <li class="atomic-select__empty">
              <slot name="empty">
                查無選項
              </slot>
            </li>
          </template>
        </ul>
      </AtomicPopover>
    </template>
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
  </AtomicFormField>
</template>

<style lang="scss">
@use 'sass:map';

.atomic-select {
  &__button {
    position: relative;
    display: flex;
    align-items: center;
    padding-right: 12px;
    padding-left: 12px;
    width: 100%;
    height: var(--field-height);
    border-style: solid;
    border-width: 1px;
    border-color: var(--field-color);
    border-radius: 6px;
    outline: none;
    column-gap: 6px;

    &:hover,
    &:focus-within {
      border-color: var(--field-active-color);
    }
  }

  &--active &__button {
    border-color: var(--field-active-color);
  }

  &__selection {
    display: flex;
    flex-grow: 1;
    user-select: none;
  }

  &__selected,
  &__placeholder {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    line-clamp: 1;
  }

  &__placeholder {
    color: #9ca3af;
  }

  &__filter {
    width: 100%;
    outline: none;
  }

  &__input,
  &:not(#{&}--active) &__filter {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    opacity: 0;
    pointer-events: none;
  }

  &__arrow {
    flex-shrink: 0;
    transition: transform 0.2s;
  }

  &--active &__arrow {
    transform: rotate(180deg);
  }

  &__menu {
    overflow: auto;
    padding: 2px;
    max-height: 300px;
    background-color: white;
    border-radius: 6px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }

  &__option,
  &__empty {
    padding: 8px;
    user-select: none;
    border-radius: 6px;
  }

  &__option {
    cursor: pointer;

    &:focus,
    &:hover,
    &--hover {
      background-color: #e0e8f3;
      outline: none;
    }

    &--selected {
      background-color: #d7e8ff;
    }

    &--selected#{&}--hover {
      background-color: #c0dafe;
    }
  }

  &__option--disabled {
    color: #9ca3af;
    cursor: not-allowed;
  }

  &__empty {
    text-align: center;
    color: #bfbfbf;
  }

  &__option + &__option {
    margin-top: 2px;
  }
}
</style>
