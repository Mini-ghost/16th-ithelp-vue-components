import stringLength from 'string-length';
import { computed, toValue } from 'vue';

import type { MaybeRefOrGetter } from 'vue';

export default function useStringLength(value: MaybeRefOrGetter<string>) {
  return computed(() => stringLength(toValue(value)));
}
