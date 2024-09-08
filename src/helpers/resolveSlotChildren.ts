import { Fragment } from 'vue';

import type { VNode } from 'vue';

import isString from '~/utils/isString';

export default function resolveSlotChildren(nodes: VNode[] | undefined) {
  if (!nodes) return null;

  return nodes
    .map(node => {
      if (node.type === Fragment) return node.children;
      if (
        node.type === Comment ||
        node.type === Text ||
        node.type === 'svg' ||
        isString(node.type)
      )
        return;

      return node;
    })
    .flat()
    .filter(Boolean) as VNode[];
}
