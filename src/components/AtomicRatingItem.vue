<script setup lang="ts">
import { computed, watch } from 'vue';

import StarEmptySvg from '~/assets/svg/star-empty.svg?component';
import StarFillSvg from '~/assets/svg/star-fill.svg?component';

interface AtomicRatingItemProps {
  id: string;

  /**
   * 表單控制元件的值
   */
  modelValue: number;

  /**
   * 表單控制元件的值
   */
  value: number;

  /**
   * 表單控制元件的 name
   */
  name: string;

  /**
   * Rating 的大小
   *
   * @default 'medium'
   */
  size: 'small' | 'medium' | 'large';

  /**
   * 是否為唯獨狀態
   */
  readonly: boolean | undefined;

  /**
   * 是否為禁用狀態
   */
  disabled: boolean | undefined;

  /**
   * 懸停的值
   */
  hover: number;
}

interface AtomicRatingItemEmits {
  (event: 'update:modelValue', value: number): void;
  (event: 'mouseenter', value: number): void;
}

const props = withDefaults(defineProps<AtomicRatingItemProps>(), {
  size: 'medium',
  name: undefined,
});

const emit = defineEmits<AtomicRatingItemEmits>();

const modelValueWritable = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  },
});

const selected = computed(() => props.value <= modelValueWritable.value);

const isFilled = computed(() => {
  const { hover, value } = props;
  return (hover ? hover : modelValueWritable.value) >= value;
});

const isHalf = computed(() => props.value % 1 !== 0);

const onMouseenter = (value: number) => {
  if (props.readonly || props.disabled) return;

  emit('mouseenter', value);
};

const onClick = () => {
  if (props.readonly || props.disabled) return;
  if (modelValueWritable.value !== props.value) return;

  modelValueWritable.value = 0;
};
</script>

<template>
  <component
    :is="!readonly ? 'label' : 'span'"
    class="atomic-rating__item"
    :class="{
      'atomic-rating__item--half': isHalf,
    }"
    :for="!readonly ? `${id}:${value}` : undefined"
    @mouseenter="onMouseenter(value)"
  >
    <slot
      :is-fill="isFilled"
      name="default"
      :selected="selected"
      :value="value"
    >
      <template v-if="isFilled">
        <slot
          name="icon:selected"
          :selected="selected"
          :value="value"
        >
          <StarFillSvg
            class="atomic-rating__image"
            fill="#faaf00"
          />
        </slot>
      </template>
      <template v-else>
        <slot
          name="icon:unselected"
          :selected="selected"
          :value="value"
        >
          <StarEmptySvg
            class="atomic-rating__image"
            fill="#e0e0e0"
          />
        </slot>
      </template>
    </slot>
    <span
      v-if="!readonly"
      class="atomic-rating__reader"
    >
      {{ value }} Stars
    </span>
  </component>
  <input
    v-if="!readonly"
    :id="`${id}:${value}`"
    v-model="modelValueWritable"
    class="atomic-rating__input"
    :disabled="disabled"
    :name="name ?? id"
    type="radio"
    :value="value"
    @click.stop="onClick"
  >
</template>
