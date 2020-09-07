// object 作为 key，以便找相应的 reactivities
const callbacks = new Map();
let usedReactivities = [];

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
  return new Proxy(object, {
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
      return obj[prop];
    }
  })
}