const callbacks = [];

// 不可 observe
const object = {
  a: 1,
  b: 2,
};
// 可以 observe
const po = reactive(object);

// 监听 po 上的属性，代替事件监听的机制
effect(() => {
  console.log(po.a);
})

function effect(cb) {
  callbacks.push(cb);
}

function reactive(object) {
  return new Proxy(object, {
    set(obj, prop, val) {
      obj[prop] = val;

      for (const cb of callbacks) {
        cb();
      }
      return obj[prop];
    },
    get(obj, prop) {
      console.log(obj, prop);
      return obj[prop];
    }
  })
}