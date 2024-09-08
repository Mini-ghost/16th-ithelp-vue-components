<script setup lang="ts">
interface AtomicDividerProps {
  orientation?: 'horizontal' | 'vertical';
  textAlign?: 'start' | 'center' | 'end';
}

const props = withDefaults(defineProps<AtomicDividerProps>(), {
  orientation: 'horizontal',
  textAlign: 'center',
});

const slots = defineSlots();
</script>

<template>
  <div
    v-if="slots.default"
    :aria-orientation="orientation"
    class="atomic-divider"
    :class="[
      `atomic-divider--${props.orientation}`,
      `atomic-divider--${props.textAlign}`,
    ]"
    role="separator"
  >
    <span class="atomic-divider__wrapper">
      <slot name="default" />
    </span>
  </div>
  <hr
    v-else
    :aria-orientation="orientation"
    class="atomic-divider"
    :class="[
      `atomic-divider--${props.orientation}`,
    ]"
  >
</template>

<style lang="scss">
div.atomic-divider {
  display: flex;
  justify-content: center;
  align-items: center;

  &::before,
  &::after {
    content: '';
    display: block;
  }

  &--horizontal {
    &::before,
    &::after {
      width: var(--atomic-divider-size, 50%);
      border-top: 1px solid lightslategray;
    }
  }

  &--vertical {
    flex-direction: column;

    &::before,
    &::after {
      height: var(--atomic-divider-size, 50%);
      border-left: 1px solid lightslategray;
    }
  }
}

hr.atomic-divider {
  border: none;

  &--horizontal {
    border-top: 1px solid lightslategray;
    width: 100%;
  }

  &--vertical {
    border-left: 1px solid lightslategray;
    height: auto;
  }
}

.atomic-divider {
  &--end {
    &::before {
      --atomic-divider-size: 90%;
    }

    &::after {
      --atomic-divider-size: 10%;
    }
  }

  &--start {
    &::before {
      --atomic-divider-size: 10%;
    }

    &::after {
      --atomic-divider-size: 90%;
    }
  }

  &__wrapper {
    display: inline-block;
  }

  &--horizontal &__wrapper {
    padding: 0 8px;
  }

  &--vertical &__wrapper {
    padding: 4px 0;
  }
}
</style>
