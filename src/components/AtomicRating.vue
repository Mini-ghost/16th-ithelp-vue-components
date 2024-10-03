<script setup lang="ts">
import { computed, ref } from 'vue';

import AtomicRatingItem from '~/components/AtomicRatingItem.vue';
import useControlled from '~/composables/useControlled';

type Numberish = number | `${number}`;

interface AtomicRatingProps {
  /**
   * 表單控制元件的值
   */
  modelValue: number;

  /**
   * 最大值
   */
  max?: Numberish;

  /**
   * 表單控制元件的 name
   */
  name?: string;

  /**
   * Rating 的大小
   *
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * 是否允許選一半（0.5）
   */
  allowHalf?: boolean;

  /**
   * 是否為禁用狀態
   */
  disabled?: boolean;

  /**
   * 是否為唯獨狀態
   */
  readonly?: boolean;
}

interface AtomicRatingEmits {
  (event: 'update:modelValue', value: number | null): void;
}

const props = withDefaults(defineProps<AtomicRatingProps>(), {
  max: 5,
  size: 'medium',
  name: undefined,
});

const emit = defineEmits<AtomicRatingEmits>();

const id = Math.random().toString(36).slice(2);

const isControlled = useControlled(props, 'modelValue');

const modelValueLocal = ref(props.modelValue ?? 0);
const modelValueWritable = computed({
  get() {
    return isControlled.value ? props.modelValue : modelValueLocal.value;
  },
  set(value) {
    emit('update:modelValue', value);
    modelValueLocal.value = value;
  },
});

const hover = ref(0);
const onMouseenter = (value: number) => {
  if (props.readonly || props.disabled) return;
  hover.value = value;
};

const onMouseleave = () => {
  hover.value = 0;
};
</script>

<template>
  <span
    :aria-label="readonly ? `${modelValueWritable} Stars` : undefined"
    class="atomic-rating"
    :class="[`atomic-rating--${props.size}`]"
    :role="readonly ? 'img' : undefined"
    @mouseleave="onMouseleave"
  >
    <template v-if="!(readonly || disabled)">
      <span class="atomic-rating__group atomic-rating__group--hidden">
        <label
          class="atomic-rating__item"
          :for="`${id}:0`"
        >
          Empty
        </label>
        <input
          :id="`${id}:0`"
          v-model="modelValueWritable"
          class="atomic-rating__input"
          :name="name ?? id"
          type="radio"
          :value="0"
        >
      </span>
    </template>

    <template
      v-for="value in Number(max)"
      :key="value"
    >
      <span class="atomic-rating__group">
        <AtomicRatingItem
          v-if="readonly
            ? value - 0.5 === modelValueWritable
            : allowHalf
          "
          :id="id"
          v-model="modelValueWritable"
          :disabled="disabled"
          :hover="hover"
          :name="name ?? id"
          :readonly="readonly"
          :size="size"
          :value="value - 0.5"
          @mouseenter="onMouseenter"
        >
          <template #default="context">
            <slot
              name="default"
              v-bind="context"
            />
          </template>

          <template #icon:selected="context">
            <slot
              name="icon:selected"
              v-bind="context"
            />
          </template>

          <template #icon:unselected="context">
            <slot
              name="icon:unselected"
              v-bind="context"
            />
          </template>
        </AtomicRatingItem>

        <AtomicRatingItem
          :id="id"
          v-model="modelValueWritable"
          :disabled="disabled"
          :hover="hover"
          :name="name ?? id"
          :readonly="readonly"
          :size="size"
          :value="value"
          @mouseenter="onMouseenter"
        >
          <template #default="context">
            <slot
              name="default"
              v-bind="context"
            />
          </template>

          <template #icon:selected="context">
            <slot
              name="icon:selected"
              v-bind="context"
            />
          </template>

          <template #icon:unselected="context">
            <slot
              name="icon:unselected"
              v-bind="context"
            />
          </template>
        </AtomicRatingItem>
      </span>
    </template>
  </span>
</template>

<style lang="scss">
.atomic-rating {
  display: inline-flex;
  width: min-content;
  text-align: left;

  &__group {
    position: relative;
  }

  &__item {
    &--half {
      position: absolute;
      top: 0;
      left: 0;
      overflow: hidden;
      width: 50%;
    }
  }

  &:not([role='img']) &__item {
    cursor: pointer;
  }

  &:has(input:disabled) &__item {
    cursor: not-allowed;
  }

  &--small {
    --rating-size: 1.125rem;
  }

  &--medium {
    --rating-size: 1.5rem;
  }

  &--large {
    --rating-size: 2rem;
  }

  &__image {
    width: var(--rating-size);
    height: var(--rating-size);
  }

  &__group--hidden,
  &__reader,
  &__input {
    @include sr-only;
  }
}
</style>
