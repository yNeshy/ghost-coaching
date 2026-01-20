// Utility to combine class names — similar to clsx but tiny and local.
// Accepts strings, arrays, and objects: cn('a', {b: true}, ['c', false]) -> 'a b c'
export function cn(...args) {
  const classes = [];
  for (const arg of args) {
    if (!arg) continue;
    if (typeof arg === 'string') {
      classes.push(arg);
    } else if (Array.isArray(arg)) {
      const joined = arg.filter(Boolean).join(' ');
      if (joined) classes.push(joined);
    } else if (typeof arg === 'object') {
      for (const [key, val] of Object.entries(arg)) {
        if (val) classes.push(key);
      }
    } else {
      classes.push(String(arg));
    }
  }
  return classes.join(' ');
}

export default cn;
