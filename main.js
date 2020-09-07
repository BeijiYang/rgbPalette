// object 作为 key，以便找相应的 reactivities
const callbacks = new Map();
let usedReactivities = [];
// 全局的缓存，防止在 po.a.b 时，由于新包装的一层，导致 effect 中，与 reactive 中访问到的不是同一个 proxy
const reactives = new Map();

// 不可 observe
const object = {
  a: { b: 3 },
  b: 2,
};
// 可以 observe
const po = reactive(object);

// 监听 po 上的属性，代替事件监听的机制
effect(() => {
  console.log(po.a.b);
})

function effect(cb) {
  usedReactivities = [];
  cb();
  console.log(usedReactivities) // [   [po, "a"]   ]
  for (const reactivity of usedReactivities) {
    // eactivity[0] 即作为 key 的 object
    if (!callbacks.has(reactivity[0])) {
      callbacks.set(reactivity[0], new Map());
    }
    // 对象的属性 prop
    if (!callbacks.get(reactivity[0]).has(reactivity[1])) {
      callbacks.get(reactivity[0]).set(reactivity[1], []);
    }
    callbacks.get(reactivity[0]).get(reactivity[1]).push(cb);
  }
}

function reactive(object) {
  if (reactives.has(object)) return reactives.get(object);

  const proxy = new Proxy(object, {
    set(obj, prop, val) {
      obj[prop] = val;

      if (callbacks.get(obj) && callbacks.get(obj).get(prop)) {
        for (const cb of callbacks.get(obj).get(prop)) {
          cb();
        }
      }
      // console.log(callbacks)
      return obj[prop];
    },
    get(obj, prop) {
      // 注册
      usedReactivities.push([obj, prop]);
      // 当 obj[prop] 是对象，套一层 reactive，以支持 po.a.b 的情况
      if (typeof obj[prop] === 'object') {
        return reactive(object[prop]);
      }
      return obj[prop];
    }
  })
  reactives.set(object, proxy);
  return proxy;
}