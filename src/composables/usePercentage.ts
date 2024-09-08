import { computed, toValue } from 'vue';

import type { MaybeRefOrGetter } from 'vue';

import clamp from '~/utils/clamp';

export default function usePagination(
  value: MaybeRefOrGetter<number>,
  max: MaybeRefOrGetter<number> = 100,
) {
  return computed(() => {
    const unValue = toValue(value);
    const unMax = toValue(max);

    const percentage = clamp((unValue / unMax) * 100, 0, 100);
    return Number(percentage.toFixed(2));
  });
}
