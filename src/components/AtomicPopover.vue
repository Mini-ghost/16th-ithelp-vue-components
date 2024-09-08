<script lang="ts">
const floatingAutoSize: () => Middleware = () => ({
  name: 'autoFit',
  fn({ rects, elements, placement }) {
    const [side] = placement.split('-');
    const isVertical = ['top', 'bottom'].includes(side!);

    const property = isVertical ? 'width' : 'height';

    Object.assign(elements.floating.style, {
      [property]: isVertical ? `${rects.reference[property]}px` : undefined,
    });

    return {};
  },
});
</script>

<script setup lang="ts">
import {
  autoUpdate,
  flip,
  arrow as floatingArrow,
  offset as floatingOffset,
  shift,
  useFloating,
} from '@floating-ui/vue';
import { createFocusTrap } from 'focus-trap';
import { tabbable } from 'tabbable';
import {
  computed,
  defineComponent,
  getCurrentInstance,
  onMounted,
  onUnmounted,
  ref,
  watch,
  withDirectives,
} from 'vue';

import type { Middleware } from '@floating-ui/vue';
import type { FocusTrap } from 'focus-trap';
import type { Slot, StyleValue } from 'vue';

import useControlled from '~/composables/useControlled';
import findFirstLegitChild from '~/helpers/findFirstLegitChild';
import { usePopupsManager } from '~/plugins/popups';
import toArray from '~/utils/toArray';
import toUnit from '~/utils/toUnit';

type Trigger = 'click' | 'hover' | 'focus' | 'touch';

type Side = 'top' | 'right' | 'bottom' | 'left';
type Alignment = 'start' | 'end';
type Placement = `${Side}-${Alignment}`;

interface AtomicPopoverProps {
  modelValue?: boolean;
  trigger?: Trigger | Trigger[];
  placement?: Side | Placement;
  offset?:
    | number
    | Partial<{
        mainAxis: number;
        crossAxis: number;
      }>;

  arrow?: {
    element: HTMLElement | null;
    padding?: number;
  };

  autoFit?: boolean;

  disabled?: boolean;
  role?: string;

  disabledFocusTrap?: boolean;
}

interface AtomicPopoverEmit {
  (event: 'update:modelValue', value: boolean): void;
}

interface AtomicPopoverSlots {
  reference?: () => ReturnType<Slot>;
  default?: (props: {
    close: () => void;
    arrowStyle: StyleValue;
  }) => ReturnType<Slot>;
}

const props = withDefaults(defineProps<AtomicPopoverProps>(), {
  modelValue: undefined,
  trigger: 'click',
  placement: 'bottom',
  offset: 8,
  arrow: undefined,
  role: undefined,
  autoFit: undefined,
});

const emit = defineEmits<AtomicPopoverEmit>();

const slots = defineSlots<AtomicPopoverSlots>();

const id = `popover-${Math.round(Math.random() * 1e5)}`;

const instance = getCurrentInstance()!;
const popups = usePopupsManager();

const isControlled = useControlled(props, 'modelValue');

const active = ref(props.modelValue ?? false);
const modelValueWritable = computed({
  get() {
    return isControlled.value ? props.modelValue! : active.value;
  },
  set(value) {
    if (props.disabled) return;

    emit('update:modelValue', value);
    active.value = value;
  },
});

const close = () => {
  modelValueWritable.value = false;
};

const referenceRef = ref<HTMLElement>();
const popoverRef = ref<HTMLElement>();

const { floatingStyles, middlewareData, placement } = useFloating(
  referenceRef,
  popoverRef,
  {
    open: modelValueWritable,
    placement: () => props.placement,
    whileElementsMounted: autoUpdate,
    middleware: () => {
      const list = [floatingOffset(props.offset), flip(), shift()];

      if (props.autoFit) {
        list.push(floatingAutoSize());
      }

      if (props.arrow) {
        list.push(floatingArrow(props.arrow));
      }

      return list;
    },
  },
);

const arrowStyle = computed<StyleValue>(() => {
  const { arrow } = middlewareData.value;
  if (!arrow) return arrow;

  const [side] = placement.value.split('-') as [Side];

  const arrowX = arrow.x ? toUnit(arrow.x) : '';
  const arrowY = arrow.y ? toUnit(arrow.y) : '';

  const rotation = {
    top: '',
    left: 'rotate(-90deg)',
    bottom: 'rotate(180deg)',
    right: 'rotate(90deg)',
  }[side];

  return {
    position: 'absolute',
    left: arrowX,
    top: arrowY,
    [side]: '100%',
    transform: rotation,
  };
});

const withTrigger = <E extends Event>(
  callback: (event: E) => void,
  trigger: Trigger,
) => {
  return (event: E) => {
    if (!toArray(props.trigger).includes(trigger)) return;
    return callback(event);
  };
};

const onClick = withTrigger(() => {
  modelValueWritable.value = !modelValueWritable.value;
}, 'click');

const onKeydown = withTrigger((event: KeyboardEvent) => {
  if ((event.target as HTMLElement).tagName === 'BUTTON') return;
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  modelValueWritable.value = !modelValueWritable.value;
}, 'click');

const onMouseenter = withTrigger(() => {
  modelValueWritable.value = true;
}, 'hover');

const onMouseleave = withTrigger(() => {
  modelValueWritable.value = false;
}, 'hover');

const onFocus = withTrigger(() => (modelValueWritable.value = true), 'focus');
const onBlur = withTrigger(() => (modelValueWritable.value = false), 'focus');

const onTouchstart = withTrigger(() => {
  modelValueWritable.value = !modelValueWritable.value;
}, 'touch');

const onTouchend = withTrigger(() => {
  modelValueWritable.value = !modelValueWritable.value;
}, 'touch');

const ReferenceComponent = defineComponent({
  name: 'ReferenceComponent',
  setup() {
    return () => {
      const child = findFirstLegitChild(slots.reference?.());
      if (!child) return;

      return withDirectives(child, [
        [
          {
            mounted(el: HTMLElement) {
              referenceRef.value = el;
            },
            updated(el: HTMLElement) {
              referenceRef.value = el;
            },
            unmounted() {
              referenceRef.value = undefined;
            },
          },
        ],
      ]);
    };
  },
});

const onEscKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return;
  modelValueWritable.value = false;
};

const onPopoverMouseenter = withTrigger(() => {
  modelValueWritable.value = true;
}, 'hover');

const onPopoverMouseleave = withTrigger(() => {
  modelValueWritable.value = false;
}, 'hover');

const onClickOutside = (event: Event) => {
  if (!modelValueWritable.value) return;

  const reference = referenceRef.value!;
  const floating = popoverRef.value!;

  if (
    event.target === reference ||
    event.composedPath().includes(reference) ||
    event.target === floating ||
    event.composedPath().includes(floating)
  ) {
    return;
  }

  modelValueWritable.value = false;
};

onMounted(() => {
  document.addEventListener('click', onClickOutside);
  document.addEventListener('keydown', onEscKeydown);
});

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside);
  document.removeEventListener('keydown', onEscKeydown);
  popups.remove(instance);
});

watch(
  modelValueWritable,
  value => {
    !value ? popups.remove(instance) : popups.add(instance);
  },
  {
    immediate: true,
    flush: 'sync',
  },
);

let trap: FocusTrap | undefined;

watch(popoverRef, popover => {
  if (!popover) {
    trap?.deactivate();
    trap = undefined;
    return;
  }

  if (props.disabledFocusTrap || !tabbable(popover).length) return;

  trap = createFocusTrap(popover, {
    clickOutsideDeactivates: true,
  });

  trap.activate();
});
</script>

<template>
  <template v-if="$slots.reference">
    <ReferenceComponent
      :aria-controls="id"
      :aria-disabled="disabled"
      :aria-expanded="modelValueWritable"
      :aria-haspopup="!!$slots.reference"
      class="atomic-popover__reference"
      :disabled="disabled"
      @blur="onBlur"
      @click="onClick"
      @focus="onFocus"
      @keydown="onKeydown"
      @mouseenter="onMouseenter"
      @mouseleave="onMouseleave"
      @touchend="onTouchend"
      @touchstart.passive="onTouchstart"
    />
  </template>
  <template v-if="!disabled && $slots.reference && $slots.default && modelValueWritable">
    <Teleport to="body">
      <div
        :id="id"
        ref="popoverRef"
        class="atomic-popover"
        :role="role"
        :style="floatingStyles"
        @mouseenter="onPopoverMouseenter"
        @mouseleave="onPopoverMouseleave"
      >
        <slot
          :arrow-style="arrowStyle"
          :close="close"
          name="default"
        />
      </div>
    </Teleport>
  </template>
</template>
