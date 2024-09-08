import { onUnmounted, ref, toRef, toValue } from 'vue';

import type { MaybeRefOrGetter } from 'vue';

import useMouse from '~/composables/useMouse';

type Coords = {
  x: number;
  y: number;
};

export default function useDrag(enabled: MaybeRefOrGetter<boolean>) {
  const { x, y } = useMouse();
  const start = ref<Coords | null>(null);
  const translate = ref<Coords>({ x: 0, y: 0 });

  const isDragging = toRef(() => !!start.value);

  const addEventListener = () => {
    window.addEventListener('mousemove', onWindowMousemove);
    window.addEventListener('mouseup', onWindowMouseup);
  };

  const removeEventListener = () => {
    window.removeEventListener('mousemove', onWindowMousemove);
    window.removeEventListener('mouseup', onWindowMouseup);
  };

  const onDragStart = () => {
    start.value = {
      x: x.value - translate.value.x,
      y: y.value - translate.value.y,
    };

    addEventListener();
  };

  const onWindowMousemove = () => {
    if (!toValue(enabled)) return;
    if (!start.value) return;

    translate.value.x = x.value - start.value.x;
    translate.value.y = y.value - start.value.y;
  };

  const onWindowMouseup = () => {
    start.value = null;
    removeEventListener();
  };

  onUnmounted(() => {
    removeEventListener();
  });

  return {
    translate,
    isDragging,
    onDragStart,
  };
}
