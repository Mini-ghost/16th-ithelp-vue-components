import { computed, getCurrentInstance } from 'vue';

import hasOwn from '~/utils/hasOwn';
import toKebabCase from '~/utils/toKebabCase';

export default function useControlled<
  P extends Record<string, any>,
  K extends keyof P
>(props: P, key: K) {
  const instance = getCurrentInstance();

  if (!instance) {
    throw new Error(
      'useControlled must be called from inside a setup function',
    );
  }

  const _key = key.toString();
  const kebabCase = toKebabCase(_key);

  return computed(() => {
    void props[key];

    const { props: _props } = instance.vnode;
    if (!_props) return false;
    return !!(
      (hasOwn(_props, _key) || hasOwn(_props, kebabCase)) &&
      hasOwn(_props, `onUpdate:${_key}`)
    );
  });
}
