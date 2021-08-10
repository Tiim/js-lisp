class Stacktrace {

  constructor() {
    this.stack = [];
  }

  push(fun, pos) {
    const copy = new Stacktrace();
    copy.stack = [...this.stack, {fun, pos}];
    return copy;
  }

  get lastFunction() {
    return this.stack[this.stack.length -1].fun;
  }

  toString() {
    return this.stack.map(s => `at ${s.fun} (${s.pos})`).join('\n')
  }

  print() {
    console.log('\n\n'+this.toString())
  }

}

export {Stacktrace};