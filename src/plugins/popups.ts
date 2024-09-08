import { inject, shallowReactive } from 'vue';
import type { ComponentInternalInstance, InjectionKey, ObjectPlugin } from 'vue';
import toUnit from '~/utils/toUnit';

type Popup = ComponentInternalInstance
interface PopupsManager {
  add: (popup: Popup) => number
  remove: (popup: Popup) => number
  lock: (popup: Popup) => number
  unlock: (popup: Popup) => number
  isTop: (popup: Popup) => boolean
}

const POPUPS_MANAGEMENT: InjectionKey<PopupsManager> = Symbol();

function indexOf<T>(array: T[], item: T) {
  return array.indexOf(item);
}

export function createPopupsManager() {
  const popups = shallowReactive<Popup[]>([]);
  const locks = shallowReactive<Popup[]>([]);

  const add = (popup: Popup) => {
    let index = indexOf(popups, popup);
    if (index !== -1) return index;

    index = popups.length;
    popups.push(popup);

    return index;
  };

  const remove = (popup: Popup) => {
    const index = indexOf(popups, popup);
    if (index === -1) return index;

    popups.splice(index, 1);
  
    return index;
  };

  const isTopModal = (popup: Popup) => {
    return popups.length > 0 && popups[popups.length - 1] === popup;
  };

  const lock = (popup: Popup) => {
    if (!locks.length) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = toUnit(scrollbarWidth) || '';
      document.body.style.overflow = 'hidden';
    }

    let index = indexOf(locks, popup);
    if (index !== -1) return index;

    index = lock.length;
    locks.push(popup);

    return index;
  };

  const unlock = (popup: Popup) => {
    const index = indexOf(locks, popup);
    if (index === -1) return index;

    locks.splice(index, 1);

    if (!locks.length) {
      document.body.style.paddingRight = '';
      document.body.style.overflow = '';
    }

    return index;
  };

  const manager: PopupsManager = {
    add,
    remove,
    lock,
    unlock,
    isTop: isTopModal,
  };

  return <ObjectPlugin>{
    install(app) {
      app.provide(POPUPS_MANAGEMENT, manager);
    },
  };
}

export function usePopupsManager() {
  const context =  inject(POPUPS_MANAGEMENT, null);
  if (!context) throw new Error('error');
  return context;
}
