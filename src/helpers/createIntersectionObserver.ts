type CallbackFn = () => void;
type ObserveFn = (element: Element, callback: CallbackFn) => () => void;

let cache: { observe: ObserveFn } | undefined;
export default function createIntersectionObserver() {
  if (cache) return cache;

  let observer: IntersectionObserver | null = null;
  const callbacks = new Map<Element, CallbackFn>();

  const observe: ObserveFn = (element, callback) => {
    if (!observer) {
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          const callback = callbacks.get(entry.target);
          const isVisible = entry.isIntersecting || entry.intersectionRatio > 0;
          if (isVisible && callback) {
            callback();
          }
        }
      });
    }
    callbacks.set(element, callback);
    observer.observe(element);

    return () => {
      callbacks.delete(element);
      observer!.unobserve(element);
      if (callbacks.size === 0) {
        observer!.disconnect();
        observer = null;
      }
    };
  };

  return (cache = { observe });
}
