<script lang="ts">
const GAP = 4;
const MIN_SIZE = 20;

const ORIENTATION_MAP = {
  vertical: {
    size: 'offsetHeight',
    scroll: 'scrollTop',
    scrollSize: 'scrollHeight',
    page: 'pageY',
    direction: 'top',
  },
  horizontal: {
    size: 'offsetWidth',
    scroll: 'scrollLeft',
    scrollSize: 'scrollWidth',
    page: 'pageX',
    direction: 'left',
  },
} as const;

type Orientation = typeof ORIENTATION_MAP;
type OrientationKey = keyof Orientation;
</script>

<script setup lang="ts">
import { computed, onUpdated, ref } from 'vue';

import useResizeObserver from '~/composables/useResizeObserver';

interface AtomicScrollbarProps {
  native?: boolean;
}

const props = withDefaults(defineProps<AtomicScrollbarProps>(), {});

const id = `scrollbar-${Math.round(Math.random() * 1e5)}`;

const active = ref(false);
const dragging = ref(false);

const viewportRef = ref<HTMLElement>();

let time: ReturnType<typeof setTimeout>;

let currentOrientation: Orientation[OrientationKey] | null = null;
let mousePosition = 0;
let scrollOffset: number | null = null;

let originalOnSelectStart:
  | ((this: GlobalEventHandlers, ev: Event) => any)
  | null = typeof window !== 'undefined' ? document.onselectstart : null;

const scheduleHideScrollbar = () => {
  time && clearTimeout(time);
  time = setTimeout(() => {
    active.value = false;
  }, 1000);
};

const onThumbPointerdown = (
  event: PointerEvent,
  orientation: OrientationKey,
) => {
  event.stopPropagation();

  if (event.ctrlKey || event.button !== 0) return;
  if (!viewportRef.value) return;

  const { page, scroll } = (currentOrientation = ORIENTATION_MAP[orientation]);

  mousePosition = event[page];
  scrollOffset = viewportRef.value[scroll];

  window.getSelection()?.removeAllRanges();

  originalOnSelectStart = document.onselectstart;
  document.onselectstart = () => false;

  document.addEventListener('pointermove', onDocumentPointermove);
  document.addEventListener('pointerup', onDocumentPointerup);
};

const onTrackPointerenter = () => {
  active.value = true;
  time && clearTimeout(time);
};

const onTrackPointerleave = scheduleHideScrollbar;

const onTrackPointerdown = (
  event: PointerEvent,
  orientation: OrientationKey,
) => {
  const viewport = viewportRef.value;
  if (!viewport) return;

  const { scroll, scrollSize, size, page, direction } =
    ORIENTATION_MAP[orientation];

  const track = event.currentTarget as HTMLElement;
  const thumb = track.childNodes[0] as HTMLElement;

  const rect = track.getBoundingClientRect();

  const thumbHalf = thumb[size] / 2;
  const position = Math.abs(rect[direction] - event[page]);

  viewport[scroll] =
    (position - thumbHalf) * (viewport[scrollSize] / track[size]);
};

const onDocumentPointermove = (event: PointerEvent) => {
  if (!currentOrientation) return;

  const viewport = viewportRef.value;
  if (!viewport) return;

  dragging.value = true;

  const { page, scroll, scrollSize, size } = currentOrientation;

  const offset = (event[page] - mousePosition) / (viewport[size] - GAP);

  viewport[scroll] = scrollOffset! + offset * viewport[scrollSize];
};

const onDocumentPointerup = () => {
  document.removeEventListener('pointermove', onDocumentPointermove);
  document.removeEventListener('pointerup', onDocumentPointerup);

  dragging.value = false;

  currentOrientation = null;
  scrollOffset = null;
  mousePosition = 0;

  if (document.onselectstart !== originalOnSelectStart) {
    document.onselectstart = originalOnSelectStart;
  }
};

const thumbLeft = ref(0);
const thumbTop = ref(0);
const thumbHeight = ref(0);
const thumbWidth = ref(0);

let ratioY = 1;
let ratioX = 1;

const valuenow = (getter: (viewport: HTMLElement) => number) => {
  return computed(() => {
    const viewport = viewportRef.value;
    if (!viewport) return 0;

    return Math.floor(getter(viewport) * 100);
  });
};

const valuenowY = valuenow(({ scrollTop, scrollHeight, offsetHeight }) => {
  void thumbTop.value; // 追蹤依賴

  return scrollHeight - offsetHeight
    ? scrollTop / (scrollHeight - offsetHeight)
    : 100;
});

const valuenowX = valuenow(({ scrollLeft, scrollWidth, offsetWidth }) => {
  void thumbLeft.value; // 追蹤依賴

  return scrollWidth - offsetWidth
    ? scrollLeft / (scrollWidth - offsetWidth)
    : 100;
});

const onScroll = () => {
  if (props.native) return;

  const viewport = viewportRef.value;
  if (!viewport) return;

  const offsetHeight = viewport.offsetHeight - GAP;
  const offsetWidth = viewport.offsetWidth - GAP;

  thumbTop.value = ((viewport.scrollTop * 100) / offsetHeight) * ratioY;
  thumbLeft.value = ((viewport.scrollLeft * 100) / offsetWidth) * ratioX;

  scheduleHideScrollbar();
  active.value = true;
};

const update = () => {
  const viewport = viewportRef.value;
  if (!viewport) return;

  const offsetHeight = viewport.offsetHeight - GAP;
  const offsetWidth = viewport.offsetWidth - GAP;

  const originalHeight = offsetHeight ** 2 / viewport.scrollHeight;
  const originalWidth = offsetWidth ** 2 / viewport.scrollWidth;

  const height = Math.max(originalHeight, MIN_SIZE);
  const width = Math.max(originalWidth, MIN_SIZE);

  thumbHeight.value = height + GAP < offsetHeight ? height : 0;
  thumbWidth.value = width + GAP < offsetWidth ? width : 0;

  ratioY =
    originalHeight /
    (offsetHeight - originalHeight) /
    (height / (offsetHeight - height));
  ratioX =
    originalWidth /
    (offsetWidth - originalWidth) /
    (width / (offsetWidth - width));
};

useResizeObserver(viewportRef, update);
onUpdated(update);
</script>

<template>
  <div
    class="atomic-scrollbar"
    :class="{
      'atomic-scrollbar--native': native,
    }"
  >
    <div
      ref="viewportRef"
      class="atomic-scrollbar__viewport"
      @scroll="onScroll"
    >
      <slot name="default" />
    </div>
    <template v-if="!native">
      <Transition
        v-if="thumbHeight"
        name="atomic-scrollbar"
      >
        <div
          v-show="active || dragging"
          :aria-controls="id"
          aria-orientation="vertical"
          aria-valuemax="100"
          aria-valuemin="0"
          :aria-valuenow="valuenowY"
          class="atomic-scrollbar__track atomic-scrollbar__track--vertical"
          role="scrollbar"
          @pointerdown="onTrackPointerdown($event, 'vertical')"
          @pointerenter="onTrackPointerenter"
          @pointerleave="onTrackPointerleave"
        >
          <div
            class="atomic-scrollbar__thumb"
            :style="{ transform: `translateY(${thumbTop}%)`, height: `${thumbHeight}px` }"
            @pointerdown="onThumbPointerdown($event, 'vertical')"
          />
        </div>
      </Transition>
      <Transition
        v-if="thumbWidth"
        name="atomic-scrollbar"
      >
        <div
          v-show="active || dragging"
          :aria-controls="id"
          aria-orientation="horizontal"
          aria-valuemax="100"
          aria-valuemin="0"
          :aria-valuenow="valuenowX"
          class="atomic-scrollbar__track atomic-scrollbar__track--horizontal"
          role="scrollbar"
          @pointerdown="onTrackPointerdown($event, 'horizontal')"
          @pointerenter="onTrackPointerenter"
          @pointerleave="onTrackPointerleave"
        >
          <div
            class="atomic-scrollbar__thumb"
            :style="{ transform: `translateX(${thumbLeft}%)`, width: `${thumbWidth}px` }"
            @pointerdown="onThumbPointerdown($event, 'horizontal')"
          />
        </div>
      </Transition>
    </template>
  </div>
</template>

<style lang="scss">
.atomic-scrollbar {
  position: relative;
  overflow: hidden;

  &__viewport {
    overflow: auto;
    height: inherit;
  }

  &:not(#{&}--native) &__viewport {
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &__track {
    --atomic-scrollbar-track-size: 8px;

    position: absolute;
    background-color: transparent;
    border-radius: 10px;

    &--vertical,
    &--horizontal {
      right: 2px;
      bottom: 2px;
      transition-property: all;
      transition-duration: 300ms;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }

    &--vertical {
      top: 2px;
      width: var(--atomic-scrollbar-track-size);
    }

    &--horizontal {
      left: 2px;
      height: var(--atomic-scrollbar-track-size);
    }

    &:hover {
      --atomic-scrollbar-track-size: 10px;

      background-color: rgba(white, 0.5);
    }
  }

  &__thumb {
    background-color: #23232399;
    border-radius: 10px;
  }

  &__track--vertical &__thumb {
    width: 100%;
  }

  &__track--horizontal &__thumb {
    height: 100%;
  }

  &-enter-active {
    transition-property: opacity;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }

  &-leave-active {
    transition-property: opacity;
    transition-timing-function: cubic-bezier(0.4, 0.2, 0, 1);
    transition-duration: 350ms;
  }

  &-enter-from,
  &-leave-active {
    opacity: 0;
  }
}
</style>
