import readline from 'readline';
import {readFileSync} from 'fs';
import {parse} from './parser.js';

/**
 * Debug variable. If set to true will print debug information.
 * Can be toggled at runtime with (debug)
 */
let DEBUG = false;
const LOG = (...x) => DEBUG && console.log(...x);
const DIR = (...x) => DEBUG && console.dir(...x); 


export const TRUE = {type: 'id', val: 't'};
export const FALSE = {type: 'list', val: []};

const isTrue = (x) => x.type == 'id' && x.val == 't';

/**
 * The global environment
 */
const globalEnv = {
  '+': (x) => ({type: "num", val: x.reduce((p, c) => p + c.val, 0)}),
  '-': (x) => {
    if (x.length === 1) {
      return {type: "num", val: -x[0].val};
    } else {
      return {type: "num", val: x[0].val - globalEnv['+'](x.slice(1)).val}
    }
  },
  '*': (x) => ({type: "num", val:x.reduce((p, c) => p*c.val, 1)}),
  '/': (x) => {
    if (x.length === 1) {
      return {type: "num", val:1 / x[0].val};
    } else {
      return {type: "num", val: x[0].val / globalEnv['*'](x.slice(1)).val};
    }
  },
  'atom': (x) =>  x[0].type !== 'list' || x[0].val.length === 0 ? TRUE: FALSE,
  'begin': (x) => x[x.length -1],
  'car': (x) => x[0].val[0],
  'cdr': (x) => ({type: 'list', val: (x[0].val).slice(1)}),
  'cons': (x) => ({type: 'list', val: [x[0], ...(x[1].type === 'list'? x[1].val : [x[1]])]}),
  'debug': () => DEBUG = !DEBUG,
  'define': (x, env) => env[x[0].val] = x[1],
  'eq': (x) => x[0] === x[1] || (x[0].type && x[1].type && x[0].type === x[1].type && JSON.stringify(x[0].val) === JSON.stringify(x[1].val))? TRUE:FALSE,
  'eval': (x) => x,
  'load': (x) => loadFile(x[0]),
  'parse': (x) => parse(x[0]),
  'quote': (x) => x[0],
  'cond': (x) => evaluate(x.find(c => isTrue(evaluate(c.val[0]))).val[1]),
  'display': (x) => x.forEach(x => console.log(x)),
}

/**
 * Prevent evaluation of parameter number 0 of the define command
 */
globalEnv.define.preventEval = [0];
/**
 * Prevent evaluation of the first 100 parameters of the quote command
 */
globalEnv.quote.preventEval = [...new Array(100)].map((_,i) => i);
/**
 * Prevent evaluation of the first 100 parameters of the cond command
 */
globalEnv.cond.preventEval = [...new Array(100)].map((_,i) => i);

function evaluate(ast, env=globalEnv) {
  LOG('Evaluating', ast);
  if (ast.type === 'id') {
    return env[ast.val];
  } else if (ast.type === 'num' || ast.type === 'str') {
    return ast
  } else if (ast.type === 'list') {
    const proc = evaluate(ast.val[0], env)
    if (!proc || typeof proc !== 'function') {
      console.log(ast.val[0].val)
      throw new Error(`Function "${ast.val[0].val}" is undefined`);
    }
    const args = ast.val.slice(1).map((a, i) => {
      if (proc.preventEval && proc.preventEval.includes(i)) {
        return a;
      }
      return evaluate(a,env)
    })
    LOG('Function call:',  proc?.name, args);
    const ret = proc(args, env);
    LOG("Return", ret);
    return ret;
  }
}

export function run(str) {
  const p = parse(str);
  DIR(p , { depth: null });
  
  return evaluate(p);
}


function loadFile(file) {
  LOG('Loading file ' + file)
  const str = readFileSync(file, {encoding: 'utf-8'})
  return run(str);
}

function repl() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  const read = () =>
  rl.question('> ', (str) => {
    try {  
      const res = run(str);

      LOG(res)
      console.log('->', display(res));
    } catch(err) {
      console.log('#>',err);
    }
    read()
    })
  read()
}

function display(value) {
  if (value == null) {
    return '!no result'
  }
  if (Array.isArray(value)) {
    console.log("warn: old list format")
    return `( ${value.map(display).join(' ')} )`;
  }
  if (["number", "string"].includes(typeof value)) {
    console.log("warn: old string/number format")
    return JSON.stringify(value);
  }
  if (value.type === 'id') {
    return value.val;
  }

  if (value.type === 'list') {
    return `(${value.val.map(display).join(' ')})`;
  }

  if (value.type === 'num') {
    return value.val
  }
  if (value.type === 'str') {
    return `"${value.val}"`
  }
  console.log("Missing formatter for " , value, typeof value);
  return value;
}


function main() {
  if (process.env.NODE_ENV === 'test') {
    return
  }
  repl();
}

main();