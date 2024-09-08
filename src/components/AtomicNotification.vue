<script lang="ts">
const ICON_MAP = {
  success: SuccessSvg,
  warning: WarningSvg,
  danger: ErrorSvg,
  info: InfoSvg,
};
</script>

<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, ref } from 'vue';

import type { AtomicButtonProps } from '~/components/AtomicButton.vue';

import CloseSvg from '~/assets/svg/close.svg?component';
import ErrorSvg from '~/assets/svg/error.svg?component';
import InfoSvg from '~/assets/svg/info.svg?component';
import SuccessSvg from '~/assets/svg/success.svg?component';
import WarningSvg from '~/assets/svg/warning.svg?component';
import AtomicButton from '~/components/AtomicButton.vue';
import noop from '~/utils/noop';

export interface AtomicNotificationProps {
  title?: string;
  message: string;
  type?: 'success' | 'warning' | 'danger' | 'info';
  duration?: number;
  offset?: number;
  actions?: (AtomicButtonProps & {
    label: string;
    onClick: (close: () => void) => void;
  })[];
}

interface AtomicNotificationEmits {
  (event: 'open', value: any): void;
  (event: 'close'): void;
  (event: 'destroy'): void;
}

const props = withDefaults(defineProps<AtomicNotificationProps>(), {
  title: '',
  type: 'danger',
  duration: 3000,
  offset: 0,
  actions: undefined,
});

const emit = defineEmits<AtomicNotificationEmits>();

const instance = getCurrentInstance();

const active = ref(false);
const entered = ref(false);

const modificationActions = computed(() => {
  return props.actions?.map(({ label, onClick, ...attrs }) => ({
    attrs,
    label,
    onClick() {
      if (onClick.length) {
        return onClick(onClose);
      }

      onClick(noop);
      onClose();
    },
  }));
});

const onClose = () => {
  active.value = false;
  timeout && clearTimeout(timeout);
  emit('close');
};

const onEnter = () => emit('open', instance);
const onAfterLeave = () => emit('destroy');

const onAfterEnter = () => {
  entered.value = true;
  if (props.duration) {
    timeout = setTimeout(onClose, props.duration);
  }
};

let timeout: NodeJS.Timeout | undefined;
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
      class="atomic-notification"
      :class="{
        [`atomic-notification--${type}`]: !!type,
        'atomic-notification--entered': entered,
      }"
      :style="{
        '--notification-offset': offset,
      }"
    >
      <div class="atomic-notification__container">
        <div class="atomic-notification__wrapper">
          <component
            :is="ICON_MAP[type]"
            class="atomic-notification__status"
            fill="var(--notification-color)"
            height="20"
            width="20"
          />
          <div class="atomic-notification__content">
            <h2
              v-if="title"
              class="atomic-notification__title"
            >
              {{ title }}
            </h2>
            <p class="atomic-notification__message">
              {{ message }}
            </p>
          </div>
          <button
            class="atomic-notification__close"
            type="button"
            @click="onClose"
          >
            <CloseSvg
              height="16"
              width="16"
            />
          </button>
        </div>
        <div class="atomic-notification__actions">
          <AtomicButton
            v-for="action in modificationActions"
            :key="action.label"
            size="small"
            v-bind="action.attrs"
            @click="action.onClick"
          >
            {{ action.label }}
          </AtomicButton>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss">
.atomic-notification {
  position: fixed;
  top: 0;
  right: 16px;
  pointer-events: none;

  @each $color, $value in $color-map {
    @if $color != 'primary' {
      &--#{$color} {
        --notification-color: #{$value};
      }
    }
  }

  &__container {
    padding: 16px 14px;
    width: 320px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    transform: translateY(calc(var(--notification-offset) * 1px));
    pointer-events: auto;
  }

  &--entered &__container {
    transition-property: transform;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 300ms;
  }

  &__wrapper {
    display: flex;
    column-gap: 8px;
  }

  &__status {
    margin-top: 3px;
  }

  &__content {
    flex-grow: 1;
  }

  &__title {
    font-size: 1rem;
    font-weight: bold;
  }

  &__message {
    font-size: 0.875rem;
    color: #646464;
  }

  &__actions {
    display: flex;
    column-gap: 8px;
    justify-content: flex-end;
    margin-top: 8px;
  }

  &__title + &__message {
    margin-top: 4px;
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
