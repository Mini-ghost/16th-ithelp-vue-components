import { h, Transition } from 'vue';

import type { FunctionalComponent, TransitionProps } from 'vue';

interface HTMLExpandElement extends HTMLElement {
  _initialStyle?: {
    transition: string;
    overflow: string;
    height: string;
    paddingTop: string;
    paddingBottom: string;
  };
}

function resetStyles(el: HTMLExpandElement) {
  const initialStyle = el._initialStyle;

  if (!initialStyle) return;

  el.style.height = initialStyle.height ?? '';
  el.style.paddingTop = initialStyle.paddingTop ?? '';
  el.style.paddingBottom = initialStyle.paddingBottom ?? '';
  el.style.overflow = initialStyle.overflow ?? '';

  delete el._initialStyle;
}

const onBeforeEnter = (el: HTMLExpandElement) => {
  el._initialStyle = {
    transition: el.style.transition,
    overflow: el.style.overflow,
    height: el.style.height,
    paddingTop: el.style.paddingTop,
    paddingBottom: el.style.paddingBottom,
  };
};

const onEnter = (el: HTMLExpandElement) => {
  const initialStyle = el._initialStyle!;

  el.style.setProperty('transition', 'none', 'important');

  // Hide overflow to account for collapsed margins in the calculated height
  el.style.overflow = 'hidden';
  const offset = `${el.offsetHeight}px`;

  el.style.height = '0';
  el.style.paddingTop = '0';
  el.style.paddingBottom = '0';

  void el.offsetHeight; // force reflow

  el.style.transition = initialStyle.transition;

  requestAnimationFrame(() => {
    el.style.height = offset;
    el.style.paddingTop = initialStyle.paddingTop;
    el.style.paddingBottom = initialStyle.paddingBottom;
    el.style.overflow = 'hidden';
  });
};

const onAfterEnter = resetStyles;
const onEnterCancelled = resetStyles;

const onBeforeLeave = (el: HTMLExpandElement) => {
  el._initialStyle = {
    transition: el.style.transition,
    overflow: el.style.overflow,
    height: el.style.height,
    paddingTop: el.style.paddingTop,
    paddingBottom: el.style.paddingBottom,
  };

  el.style.height = `${el.scrollHeight}px`;
  el.style.overflow = 'hidden';
};

const onLeave = (el: HTMLExpandElement) => {
  requestAnimationFrame(() => {
    el.style.height = '0';
    el.style.paddingTop = '0';
    el.style.paddingBottom = '0';
  });
};

const onAfterLeave = resetStyles;
const onLeaveCancelled = resetStyles;

const props = {
  name: 'transition-collapse',
  onBeforeEnter,
  onEnter,
  onAfterEnter,
  onEnterCancelled,
  onBeforeLeave,
  onLeave,
  onAfterLeave,
  onLeaveCancelled,
} as any as TransitionProps;

export default <FunctionalComponent> function TransitionCollapse(_, context) {
  return h(Transition, props, context.slots);
};
