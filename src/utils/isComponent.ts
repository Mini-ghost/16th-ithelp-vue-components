import isFunction from './isFunction';

import type { Component } from 'vue';

/**
 * @see https://stackoverflow.com/questions/66953115/how-to-check-if-an-object-is-a-vue-component-in-vue3
 */
// export default function isComponent(value: any): value is Component {
//   return value && isFunction(value.render);
// }

export default function isComponent(value: any): value is Component {
  if (
    isFunction(value) ||
    isFunction(value?.render) ||
    isFunction(value?.setup)
  ) {
    return true;
  }

  return false;
}
