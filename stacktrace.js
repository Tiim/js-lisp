class Stacktrace {

  constructor() {
    this.stack = [];
    this.errorObject = null;
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
    //console.log("AST:" + Stacktrace.display(ast));
    // console.log(ast.val)
    // console.log("\n")
    if (fun === null) {
      return this
    }
    const copy = new Stacktrace();
    copy.stack = [...this.stack, {fun, pos, ast}];
    return copy;
  }

  pushErrorObject(errorObject) {
    this.errorObject = errorObject;
    return this
  }

  getLastFunction() {
    return this.stack[this.stack.length -1]?.fun;
  }

  toString() {
    //return Stacktrace.display(this.stack[this.stack.length - 1]?.ast) + "\n" + this.stack.map(s => `at ${s.fun} (${s.pos})`).join('\n')
    // console.log("--- STACKTRACE ---")
    // console.log(this.stack.length)
    // console.log(this.stack[this.stack.length - 1]?.ast)
    // console.log(this.x)
    var str = "\n\t"
    str += Stacktrace.display(this.stack[0]?.ast) + "\n"
    if (this.errorObject != null) {
      str += "\t" + Array(this.errorObject.pos.char).fill('\xa0').join('') + "^\n"
    }
    str += this.stack.map(s => `at ${s.fun} (${s.pos})`).join('\n')

    return str
    
    // return Stacktrace.display(this.stack[this.stack.length - 1]?.ast) + "\n" + 
      // this.stack.map(s => `at ${s.fun} (${s.pos})`).join('\n')
  }

  print() {
    console.log(this.toString())
  }

}

export {Stacktrace};
