import { createVNode, render } from 'vue';

import type { VNode } from 'vue';
import type { ComponentProps } from 'vue-component-type-helpers';
import type { AtomicNotificationProps } from '~/components/AtomicNotification.vue';

import AtomicNotification from '~/components/AtomicNotification.vue';

type Notification = {
  key: symbol;
  props: AtomicNotificationProps;
  vnode?: VNode;
};

const GAP_SIZE = 16;
const notifications: Notification[] = [];

const handleOpen = (key: symbol, vnode: VNode) => {
  const index = notifications.findIndex(
    notification => notification.key === key,
  );
  if (index === -1) return;
  const notification = notifications[index];

  notification.vnode = vnode;
  handleUpdateOffset(index);
};

const handleClose = (key: symbol) => {
  const index = notifications.findIndex(
    notification => notification.key === key,
  );
  const cloned = notifications.slice();

  cloned.splice(index, 1);

  // 從 index 開始更新 offset
  for (let i = index; i < cloned.length; i++) {
    handleUpdateOffset(i, cloned);
  }
};

const handleDestroy = (key: symbol) => {
  const index = notifications.findIndex(
    notification => notification.key === key,
  );
  if (index === -1) return;
  notifications.splice(index, 1);
};

const handleUpdateOffset = (index: number, collections = notifications) => {
  const previous = collections[index - 1];

  let offset = GAP_SIZE;
  if (previous) {
    const { el, component } = previous.vnode!;
    offset += (component?.props.offset as number) || 0;
    offset += el instanceof HTMLElement ? el.offsetHeight : 0;
  }

  const { component } = collections[index].vnode!;
  component!.props.offset = offset;
};

export default function notify(options: AtomicNotificationProps) {
  const key = Symbol();
  const props: ComponentProps<typeof AtomicNotification> = {
    ...options,
    offset: 16,
    onOpen: () => handleOpen(key, vnode),
    onClose: () => handleClose(key),
    onDestroy: () => {
      handleDestroy(key);
      render(null, container);
    },
  };

  notifications.push({
    key,
    props,
  });

  const container = document.createElement('div');
  const vnode = createVNode(AtomicNotification, props);
  render(vnode, container);

  document.body.appendChild(container.firstElementChild!);
}
