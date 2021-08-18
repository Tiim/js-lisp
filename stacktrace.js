class Stacktrace {

  constructor() {
    this.stack = [];
  }

  static display(value) {
    if (value == null) {
      return '!no result'
    }
    if (value.type === 'id') {
      return `${value.val}`;
    }
    if (value.type === 'list') {
      return `(${value.val.map(Stacktrace.display).join(' ')})`;
    }
    if (value.type === 'num') {
      return value.val
    }
    if (value.type === 'str') {
      return `"${value.val}"`
    }
    if (value.type === 'func') {
      return `(lambda (${value.args.join(' ')}) (${value.ast.val.map(display).join(' ')}))`
    }
    if (typeof value === 'function') {
      return `(lambda () (internal function))`
    }
    //console.log(`Missing formatter for ${value} (${typeof value})`);
    //return JSON.stringify(value);
    return ""
  }

  push(fun, pos, ast) {
    console.log(Stacktrace.display(ast));
    const copy = new Stacktrace();
    copy.stack = [...this.stack, {fun, pos, ast}];
    return copy;
  }

  getLastFunction() {
    return this.stack[this.stack.length -1].fun;
  }

  toString() {
    //return Stacktrace.display(this.stack[this.stack.length - 1]?.ast) + "\n" + this.stack.map(s => `at ${s.fun} (${s.pos})`).join('\n')
    console.log("--- STACKTRACE ---")
    //console.log(this.stack.length)
    //console.log(this.stack[0])
    return Stacktrace.display(this.stack[this.stack.length - 1]?.ast) + "\n" + 
      this.stack.map(s => `at ${s.fun} (${s.pos})`).join('\n')
  }

  print() {
    console.log('\n\n'+this.toString())
  }

}

export {Stacktrace};
