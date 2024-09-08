import { onMounted, onUnmounted, ref } from 'vue';

export default function useMouse() {
  const x = ref(0);
  const y = ref(0);

  const onMousemove = (event: MouseEvent) => {
    x.value = event.x;
    y.value = event.y;
  };

  onMounted(() => {
    window.addEventListener('mousemove', onMousemove);
  });

  onUnmounted(() => {
    window.removeEventListener('mousemove', onMousemove);
  });

  return {
    x,
    y,
  };
}
