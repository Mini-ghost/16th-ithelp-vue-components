interface TraversalFunction {
  (
    container: HTMLElement,
    currentFocus: HTMLElement | null
  ): HTMLElement | null;
}

export function firstChild(container: HTMLElement) {
  let child = container.firstChild;
  while (child?.nodeType === 3) {
    child = child.nextSibling;
  }

  return child as HTMLElement | null;
}

export function lastChild(container: HTMLElement) {
  let child = container.lastChild;
  while (child?.nodeType === 3) {
    child = child.previousSibling;
  }

  return child as HTMLElement | null;
}

export function moveFocus(
  container: HTMLElement,
  currentFocus: HTMLElement | null,
  traversalFn: TraversalFunction,
) {
  let wrappedOnce = false;
  let nextFocus = traversalFn(container, currentFocus);

  if (nextFocus === firstChild(container)) {
    if (wrappedOnce) {
      return false;
    }
    wrappedOnce = true;
  }

  while (nextFocus) {
    const nextFocusDisabled =
      (nextFocus as any).disabled || nextFocus.getAttribute?.('aria-disabled') === 'true';

    if (!nextFocus.hasAttribute?.('tabindex') || nextFocusDisabled) {
      // Move to the next element.
      nextFocus = traversalFn(container, nextFocus);
    } else {
      nextFocus.focus();
      return true;
    }
  }
  return false;
}

export function nextItem(
  container: HTMLElement,
  item: HTMLElement | null,
): HTMLElement | null {  
  if (item && item.nextElementSibling) {
    return item.nextElementSibling as HTMLElement;
  }

  return firstChild(container);
}

export function previousItem(
  container: HTMLElement,
  item: HTMLElement | null,
): HTMLElement | null {
  if (item && item.previousElementSibling) {
    return item.previousElementSibling as HTMLElement;
  }

  return lastChild(container) ;
}
