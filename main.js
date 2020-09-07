// object 作为 key，以便找相应的 reactivities
const callbacks = new Map();
let usedReactivities = [];
// 全局的缓存，防止在 po.a.b 时，由于新包装的一层，导致 effect 中，与 reactive 中访问到的不是同一个 proxy
const reactives = new Map();

// 不可 observe
const object = {
  r: 0,
  g: 0,
  b: 0,
};
// 可以 observe
const po = reactive(object);

// 从数据到 input element 的绑定
effect(() => {
  document.getElementById('r').value = po.r;
  document.getElementById('valueR').innerText = po.r;
})
effect(() => {
  document.getElementById('g').value = po.g;
  document.getElementById('valueG').innerText = po.g;
})
effect(() => {
  document.getElementById('b').value = po.b;
  document.getElementById('valueB').innerText = po.b;
})

// input element => data 的绑定
document.getElementById('r').addEventListener('input', evt => po.r = evt.target.value);
document.getElementById('g').addEventListener('input', evt => po.g = evt.target.value);
document.getElementById('b').addEventListener('input', evt => po.b = evt.target.value);

effect(() => {
  document.getElementById('color').style.backgroundColor = `rgb(${po.r},${po.g},${po.b})`;
  document.getElementById('valueC').innerText = `rgb(${po.r},${po.g},${po.b})`;
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