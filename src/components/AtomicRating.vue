<script setup lang="ts">
import { computed, ref } from 'vue';

import StarEmptySvg from '~/assets/svg/star-empty.svg?component';
import StarFillSvg from '~/assets/svg/star-fill.svg?component';
import useControlled from '~/composables/useControlled';

interface AtomicRatingProps {
  modelValue: number;
  max?: number;
  name?: string;
  disabled?: boolean;
  readonly?: boolean;
  allowHalf?: boolean;
}

interface AtomicRatingEmits {
  (event: 'update:modelValue', value: number): void;
}

const props = withDefaults(defineProps<AtomicRatingProps>(), {
  max: 5,
  name: undefined,
});

const emit = defineEmits<AtomicRatingEmits>();

const id = Math.random().toString(36).slice(2);

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
</script>

<template>
  <span
    :aria-label="readonly ? `${modelValueWritable} Stars` : undefined"
    class="atomic-rating"
    :role="readonly ? 'img' : undefined"
  >
    <template v-if="!readonly">
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
      v-for="value in max"
      :key="value"
    >
      <span class="atomic-rating__group">
        <!-- 0.5 -->
        <template v-if="readonly ? value - 0.5 === modelValueWritable : allowHalf">
          <component
            :is="!readonly ? 'label' : 'span'"
            class="atomic-rating__item atomic-rating__item--half"
            :for="!readonly ? `${id}:${value - 0.5}` : undefined"
          >
            <slot
              name="default"
              :selected="value - 0.5 === modelValueWritable"
              :value="value - 0.5"
            >
              <template v-if="value - 0.5 === modelValueWritable">
                <slot
                  name="icon:selected"
                  :value="value - 0.5"
                >
                  <StarFillSvg fill="#faaf00" />
                </slot>
              </template>
              <template v-else>
                <slot
                  name="icon:unselected"
                  :value="value - 0.5"
                >
                  <StarEmptySvg fill="#faaf00" />
                </slot>
              </template>
            </slot>
            <span
              v-if="!readonly"
              class="atomic-rating__content"
            >
              {{ value - 0.5 }} Stars
            </span>
          </component>
          <input
            v-if="!readonly"
            :id="`${id}:${value - 0.5}`"
            v-model="modelValueWritable"
            class="atomic-rating__input"
            :disabled="disabled"
            :name="name ?? id"
            type="radio"
            :value="value - 0.5"
          >
        </template>

        <!-- 整數 -->
        <component
          :is="!readonly ? 'label' : 'span'"
          class="atomic-rating__item"
          :for="!readonly ? `${id}:${value}` : undefined"
        >
          <slot
            name="default"
            :selected="value <= modelValueWritable"
            :value="value"
          >
            <template v-if="value <= modelValueWritable">
              <slot
                name="icon:selected"
                :value="value"
              >
                <StarFillSvg fill="#faaf00" />
              </slot>
            </template>
            <template v-else>
              <slot
                name="icon:unselected"
                :value="value"
              >
                <StarEmptySvg fill="#faaf00" />
              </slot>
            </template>
          </slot>
          <span
            v-if="!readonly"
            class="atomic-rating__content"
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
        >
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

  &__group--hidden,
  &__content,
  &__input {
    @include sr-only;
  }
}
</style>
