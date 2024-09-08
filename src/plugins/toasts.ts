import { inject, shallowReactive } from 'vue';

import type { InjectionKey, ObjectPlugin } from 'vue';
import AtomicToast from '~/components/AtomicToast.vue';
import type { AtomicToastProps } from '~/components/AtomicToast.vue';
import type { ComponentProps } from 'vue-component-type-helpers';

interface ToastsManager {
  open: (options: AtomicToastProps) => void;
}

type Toast = {
  key: symbol;
  props: AtomicToastProps;
  element?: Element;
};

const GAP_SIZE = 16;

const TOASTS_MANAGEMENT: InjectionKey<ToastsManager> = Symbol();
const TOASTS: InjectionKey<Toast[]> = Symbol();

export function createToastsManager() {
  const toasts = shallowReactive<Toast[]>([]);

  const handleOpen = (key: symbol, element: Element) => {
    const index = toasts.findIndex(message => message.key === key);
    if (index === -1) return;
    const message = toasts[index];
  
    message.element = element;
    handleUpdateOffset(index);
  };
  
  const handleClose = (key: symbol) => {
    const index = toasts.findIndex(toast => toast.key === key);
    const cloned = toasts.slice();
  
    cloned.splice(index, 1);
  
    // 從 index 開始更新 offset
    for (let i = index; i < cloned.length; i++) {
      handleUpdateOffset(i, cloned);
    }
  };
  
  const handleDestroy = (key: symbol) => {
    const index = toasts.findIndex(toast => toast.key === key);
    if (index === -1) return;
    toasts.splice(index, 1);
  };
  
  const handleUpdateOffset = (index: number, collections = toasts) => {
    const previous = collections[index - 1];
  
    let offset = GAP_SIZE;
    if (previous) {
      offset += previous.props.offset || 0;
      offset += 
        previous.element instanceof HTMLElement
          ? previous.element.offsetHeight
          : 0;
    }
  
    collections[index].props.offset = offset;
  };

  const open = (options: AtomicToastProps) => {
    const key = Symbol();
    toasts.push({
      key,
      props: shallowReactive<ComponentProps<typeof AtomicToast>>({
        ...options,
        onOpen: element => handleOpen(key, element),
        onClose: () => handleClose(key),
        onDestroy: () => handleDestroy(key),
      }),
    });

    return key;
  };

  const manager: ToastsManager = {
    open,
  };

  return <ObjectPlugin>{
    install(app) {
      app.provide(TOASTS, toasts);
      app.provide(TOASTS_MANAGEMENT, manager);
    },
  };
}

export function useToasts() {
  const context = inject(TOASTS, null);
  if (!context) throw new Error('error');
  return context;
}

export function useToast() {
  const context = inject(TOASTS_MANAGEMENT, null);
  if (!context) throw new Error('error');
  return context;
}
