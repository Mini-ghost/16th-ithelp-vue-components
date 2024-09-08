<script setup lang="ts">
import { computed } from 'vue';

import CloseSvg from '~/assets/svg/close.svg?component';
import AtomicButton from '~/components/AtomicButton.vue';
import AtomicModal from '~/components/AtomicModal.vue';
import useDrag from '~/composables/useDrag';
import toUnit from '~/utils/toUnit';

interface AtomicDialogProps {
  modelValue: boolean;

  title?: string;

  transition?:
    | 'fade'
    | 'slide-up'
    | 'slide-down'
    | 'slide-right'
    | 'slide-left';

  width?: number | string;

  fullscreen?: boolean;

  disableEscapePress?: boolean;

  disableBackdropClick?: boolean;

  draggable?: boolean;
}

interface AtomicDialogEmits {
  (event: 'update:modelValue', value: boolean): void;
}

const props = withDefaults(defineProps<AtomicDialogProps>(), {
  title: undefined,
  transition: 'fade',
  width: 640,
});

const emit = defineEmits<AtomicDialogEmits>();

const id = `dialog-${Math.round(Math.random() * 1e5)}`;

const { translate, isDragging, onDragStart } = useDrag(() => {
  return props.draggable || !!props.fullscreen;
});

const modelValueWritable = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  },
});

const onClose = () => {
  modelValueWritable.value = false;
};

const wrapperStyle = computed(() => {
  if (props.fullscreen) return;
  const { x, y } = translate.value;

  return {
    transform: `translate(${toUnit(x)}, ${toUnit(y)})`,
  };
});

let backdropClick = false;

const onContainerClick = () => {
  if (props.disableBackdropClick) return;
  if (!backdropClick) return;
  onClose();
};

const onContainerMousedown = (event: MouseEvent) => {
  backdropClick = event.target === event.currentTarget;
};
</script>

<template>
  <AtomicModal
    v-model="modelValueWritable"
    #="{ open }"
    class="atomic-dialog"
    :class="{
      'atomic-dialog--fullscreen': fullscreen,
      'atomic-dialog-dragging': !!isDragging,
    }"
    :disable-backdrop-click="disableBackdropClick"
    :disable-escape-press="disableEscapePress"
    :style="{
      '--dialog-width': toUnit(width),
    }"
  >
    <Transition
      appear
      :name="`transition-${transition}`"
    >
      <div
        v-if="open"
        class="atomic-dialog__container"
        tabindex="-1"
        @click="onContainerClick"
        @mousedown="onContainerMousedown"
      >
        <div
          :aria-describedby="title || fullscreen ? `${id}-content` : undefined"
          :aria-labelledby="`${id}-title`"
          aria-modal="true"
          class="atomic-dialog__wrapper"
          role="dialog"
          :style="wrapperStyle"
        >
          <div
            v-if="title || fullscreen"
            class="atomic-dialog__header"
          >
            <AtomicButton
              v-if="fullscreen"
              aria-label="close"
              color="info"
              shape="square"
              variant="text"
              @click="onClose"
            >
              <CloseSvg
                height="20"
                width="20"
              />
            </AtomicButton>
            <span
              :id="`${id}-title`"
              class="atomic-dialog__title"
            >
              <slot name="title">
                {{ title }}
              </slot>
            </span>
          </div>
          <div
            :id="`${id}-content`"
            class="atomic-dialog__content"
          >
            <slot name="default" />
          </div>
          <template v-if="draggable && !fullscreen">
            <div
              class="atomic-dialog__sensor atomic-dialog__sensor--top"
              @mousedown="onDragStart"
            />
            <div
              class="atomic-dialog__sensor atomic-dialog__sensor--right"
              @mousedown="onDragStart"
            />
            <div
              class="atomic-dialog__sensor atomic-dialog__sensor--bottom"
              @mousedown="onDragStart"
            />
            <div
              class="atomic-dialog__sensor atomic-dialog__sensor--left"
              @mousedown="onDragStart"
            />
          </template>
        </div>
      </div>
    </Transition>
  </AtomicModal>
</template>

<style lang="scss">
.atomic-dialog {
  &__container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  &__wrapper {
    position: relative;
    background-color: white;
  }

  &--fullscreen &__wrapper {
    width: 100%;
    height: 100%;
  }

  &:not(&--fullscreen) &__wrapper {
    overflow: auto;
    margin: 1.5rem;
    width: var(--dialog-width);
    max-width: 100%;
    max-height: 100%;
    max-height: calc(100% - 3rem);
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }

  &__header {
    display: flex;
    align-items: center;
    column-gap: 2px;
    padding: 16px 24px;
  }

  &__title {
    font-size: 1.25rem;
    font-weight: bold;
  }

  &__content {
    padding: 16px 24px;
  }

  &__header + &__content {
    padding-top: 0;
  }

  &__sensor {
    position: absolute;
    cursor: move;

    &--top {
      top: 0;
      right: 0;
      left: 0;
      height: 16px;
    }

    &--right {
      top: 0;
      right: 0;
      bottom: 0;
      width: 24px;
    }

    &--bottom {
      right: 0;
      bottom: 0;
      left: 0;
      height: 16px;
    }

    &--left {
      top: 0;
      bottom: 0;
      left: 0;
      width: 24px;
    }
  }

  &--dragging {
    touch-action: none;
    user-select: none;
  }
}
</style>
