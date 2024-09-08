<script lang="ts">
const ICON_MAP = {
  success: SuccessSvg,
  warning: WarningSvg,
  danger: ErrorSvg,
  info: InfoSvg,
};
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import CloseSvg from '~/assets/svg/close.svg?component';
import ErrorSvg from '~/assets/svg/error.svg?component';
import InfoSvg from '~/assets/svg/info.svg?component';
import SuccessSvg from '~/assets/svg/success.svg?component';
import WarningSvg from '~/assets/svg/warning.svg?component';

export interface AtomicToastProps {
  message: string;
  type?: 'success' | 'warning' | 'danger' | 'info';
  duration?: number;
  offset?: number;
}

interface AtomicToastEmits {
  (event: 'open', value: Element): void;
  (event: 'close'): void;
  (event: 'destroy'): void;
}

const props = withDefaults(defineProps<AtomicToastProps>(), {
  type: 'success',
  duration: 3000,
  offset: 16,
});

const emit = defineEmits<AtomicToastEmits>();

const active = ref(false);
const entered = ref(false);

const onEnter = (element: Element) => emit('open', element);
const onAfterLeave = () => emit('destroy');

const onAfterEnter = () => {
  entered.value = true;
  if (props.duration) {
    timeout = setTimeout(onClose, props.duration);
  }
};

let timeout: NodeJS.Timeout | undefined;

const onClose = () => {
  active.value = false;
  timeout && clearTimeout(timeout);
  emit('close');
};

onMounted(() => (active.value = true));
</script>

<template>
  <Transition
    name="transition-slide-left"
    @after-enter="onAfterEnter"
    @after-leave="onAfterLeave"
    @enter="onEnter"
  >
    <div
      v-show="active"
      class="atomic-toast"
      :class="{
        [`atomic-toast--${type}`]: !!type,
        'atomic-toast--entered': entered,
      }"
      role="status"
      :style="{
        '--toast-offset': offset,
      }"
    >
      <div class="atomic-toast__container">
        <component
          :is="ICON_MAP[type]"
          class="atomic-notification__status"
          fill="var(--toast-color)"
          height="20"
          width="20"
        />
        <p class="atomic-toast__message">
          {{ message }}
        </p>
        <button
          class="atomic-toast__close"
          type="button"
          @click="onClose"
        >
          <CloseSvg
            height="16"
            width="16"
          />
        </button>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss">
.atomic-toast {
  position: fixed;
  top: 0;
  // top: calc(var(--toast-offset, 16) * 1px);
  right: 16px;
  pointer-events: none;

  @each $color, $value in $color-map {
    @if $color != 'primary' {
      &--#{$color} {
        --toast-color: #{$value};
      }
    }
  }

  // &--entered {
  //   transition-property: transform, top;
  //   transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  //   transition-duration: 300ms;
  // }

  &__container {
    display: flex;
    padding: 16px 14px;
    width: 320px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    column-gap: 8px;
    transform: translateY(calc(var(--toast-offset, 16) * 1px));
    pointer-events: auto;
  }

  &--entered &__container {
    transition-property: transform;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 300ms;
  }

  &__status {
    margin-top: 3px;
  }

  &__message {
    flex-grow: 1;
    font-size: 0.875rem;
    color: #646464;
  }

  &__close {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 20px;
    height: 20px;
    color: gray;
    opacity: 0.5;

    &:hover {
      opacity: 1;
    }
  }
}
</style>
