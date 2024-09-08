import { Comment, Fragment, h, Text } from 'vue';

import type { VNode } from 'vue';

export default function findFirstLegitChild(
  nodes: VNode[] | undefined,
): VNode | null {
  if (!nodes) return null;

  for (const node of nodes) {
    if (typeof node === 'object') {
      switch (node.type) {
        case Comment:
          continue;
        case Text:
        case 'svg':
          return wrapTextContent(node);
        case Fragment:
          return findFirstLegitChild(node.children as VNode[]);
        default:
          return node;
      }
    }

    return wrapTextContent(node);
  }
  return null;
}

function wrapTextContent(content: string | VNode) {
  return h('span', { role: 'button', tabindex: 0 }, content);
}
