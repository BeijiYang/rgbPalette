// 不可 observe
const object = {
  a: 1,
  b: 2,
};
// 可以 observe
const po = new Proxy(object, {
  set(obj, prop, val) {
    console.log(obj, prop, val);
  }
})