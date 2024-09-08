import { computed, onScopeDispose, toValue, watch } from 'vue';

import type { MaybeRefOrGetter } from 'vue';

import createResizeObserver from '~/helpers/createResizeObserver';
import toArray from '~/utils/toArray';

type MaybeElementRef = MaybeRefOrGetter<Element | undefined>;

const UNOBSERVE＿KEY = Symbol('__unobserve');

export default function useResizeObserver(
  element: MaybeElementRef | MaybeElementRef[],
  callback: () => void,
) {
  type Target = Element & { [UNOBSERVE＿KEY]?: () => void };
  const targets = computed<Array<Target | undefined>>(() => {
    return toArray(element).map(el => toValue(el));
  });

  const unobserve = () => {
    for (const element of targets.value!) {
      element?.[UNOBSERVE＿KEY]?.();
      delete element?.[UNOBSERVE＿KEY];
    }
  };

  watch(
    targets,
    elements => {
      const observer = createResizeObserver();

      for (const element of elements) {
        if (!element || element?.[UNOBSERVE＿KEY]) continue;
        element[UNOBSERVE＿KEY] = observer.observe(element, callback);
      }
    },
    { flush: 'post' },
  );

  onScopeDispose(() => {
    unobserve();
  });

  return unobserve;
}
