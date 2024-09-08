<script setup lang="ts">
import { createFocusTrap } from 'focus-trap';
import { tabbable } from 'tabbable';
import {
  computed,
  getCurrentInstance,
  onUnmounted,
  ref,
  useAttrs,
  watch,
} from 'vue';

import type { FocusTrap } from 'focus-trap';
import type { FocusableElement } from 'tabbable';
import type { Slot } from 'vue';

import { usePopupsManager } from '~/plugins/popups';

interface AtomicModalProps {
  modelValue: boolean;
  hideBackdrop?: boolean;
  disableEscapePress?: boolean;
  disableBackdropClick?: boolean;
}

interface AtomicModalEmits {
  (event: 'update:modelValue', value: boolean): void;
}

interface AtomicModalSlots {
  default?: (props: { open: boolean }) => ReturnType<Slot>;
}

const props = withDefaults(defineProps<AtomicModalProps>(), {});

const emit = defineEmits<AtomicModalEmits>();

const slots = defineSlots<AtomicModalSlots>();

const attrs = useAttrs();

const instance = getCurrentInstance()!;

const popups = usePopupsManager();

const rootRef = ref<HTMLElement>();

const modelValueWritable = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  },
});

const modelValueLocal = ref(modelValueWritable.value);

let focusableElements: FocusableElement[] = [];
let trap: FocusTrap | undefined;

const onRootKeydown = (event: KeyboardEvent) => {
  if (props.disableEscapePress) return;
  if (event.key !== 'Escape' || !popups.isTop(instance)) return;

  event.preventDefault();
  modelValueWritable.value = false;
};

const onBackdropClick = () => {
  if (props.disableBackdropClick) return;
  if (!popups.isTop(instance)) return;
  modelValueWritable.value = false;
};

const onFocusout = (event: FocusEvent) => {
  if (event.relatedTarget) return;
  (event.target as HTMLElement | null)?.focus();
};

const onAfterLeave = () => {
  modelValueLocal.value = false;
};

const onSentinelFocus = () => {
  if (focusableElements.length === 1) return;
  focusableElements[0]?.focus();
};

watch(
  modelValueWritable,
  async value => {
    if (value) {
      modelValueLocal.value = value;
      return;
    }

    popups.remove(instance);
    trap?.deactivate();
    trap = undefined;
  },
  {
    flush: 'sync',
  },
);

watch(modelValueLocal, value => {
  if (value) {
    popups.add(instance);
    popups.lock(instance);
    return;
  }

  popups.unlock(instance);
});

watch(rootRef, element => {
  if (!element) return;

  focusableElements = tabbable(element);
  if (!focusableElements.length) return;

  trap = createFocusTrap(element);
  trap.activate();
});

onUnmounted(() => {
  popups.remove(instance);
  popups.unlock(instance);
  trap?.deactivate();
  trap = undefined;
});
</script>

<template>
  <Teleport
    v-if="modelValueLocal"
    to="body"
  >
    <div
      ref="rootRef"
      class="atomic-modal"
      role="presentation"
      v-bind="attrs"
      @focusout="onFocusout"
      @keydown="onRootKeydown"
    >
      <Transition
        v-if="!hideBackdrop"
        appear
        name="transition-fade"
        @after-leave="onAfterLeave"
      >
        <div
          v-if="modelValueWritable"
          aria-hidden="true"
          class="atomic-modal__backdrop"
          @click="onBackdropClick"
        />
      </Transition>
      <slot
        name="default"
        :open="modelValueWritable"
      />
      <div
        tabindex="0"
        @focus="onSentinelFocus"
      />
    </div>
  </Teleport>
</template>

<style lang="scss">
.atomic-modal {
  position: fixed;
  inset: 0;

  &__backdrop {
    position: fixed;
    z-index: -1;
    background-color: rgba(0, 0, 0, 0.6);
    inset: 0;
  }
}
</style>
