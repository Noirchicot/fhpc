const listeners = new Map();

export function on(type, fn) {
  if (!listeners.has(type)) {
    listeners.set(type, new Set());
  }
  const set = listeners.get(type);
  set.add(fn);
  return function off() {
    set.delete(fn);
  };
}

export function emit(type, data) {
  const event = { ...data, type, at: Date.now() };
  const set = listeners.get(type);
  if (set) {
    for (const fn of set) fn(event);
  }
  return event;
}
