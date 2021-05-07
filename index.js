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

/**
 * The global environment
 */
const globalEnv = {
  '+': (x) => x.reduce((p, c) => p+c, 0),
  '-': (x) => {
    if (x.length === 1) {
      return -x[0];
    } else {
      return x[0] - globalEnv['+'](x.slice(1))
    }
  },
  '*': (x) => x.reduce((p, c) => p*c, 1),
  '/': (x) => {
    if (x.length === 1) {
      return 1 / x[0]
    } else {
      return x[0] / globalEnv['*'](x.slice(1))
    }
  },
  'atom?': (x) => (typeof x[0] === 'string' || typeof x[0] === 'number' || (typeof x[0] === 'object' && x[0].type != null)),
  'car': (x) => x[0][0],
  'cdr': (x) => x[0][1],
  'cons': (x) => x.slice(0,2),
  'debug': () => DEBUG = !DEBUG,
  'define': (x, env) => env[x[0].val] = x[1],
  'eq': (x) => x.reduce((p, c) => p && c === x[0], true),
  'eval': (x) => x,
  'load': (x) => loadFile(x[0]),
  'parse': (x) => parse(x[0]),
  'quote': (x) => x[0],
}

/**
 * Prevent evaluation of parameter number 0 of the define command
 */
globalEnv.define.preventEval = [0];
/**
 * Prevent evaluation of the first 100 parameters of the quote command
 */
globalEnv.quote.preventEval = [...new Array(100)].map((_,i) => i);

function evaluate(ast, env=globalEnv) {
  LOG('Evaluating', ast);
  if (ast.type === 'id') {
    return env[ast.val];
  } else if (ast.type === 'num' || ast.type === 'str') {
    return ast.val
  } else if (ast.type === 'ast') {
    LOG('Function call:', ast.val);
    const proc = evaluate(ast.val[0], env)
    if (!proc || typeof proc !== 'function') {
      throw new Error(`Function "${ast.val[0].val}" is undefined`);
    }
    const args = ast.val.slice(1).map((a, i) => {
      if (proc.preventEval && proc.preventEval.includes(i)) {
        return a;
      }
      return evaluate(a,env)
    })
    return proc(args, env)
  }
}

export function run(str) {
  const p = parse(str);
  DIR({ p }, { depth: null });
  
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
      console.log(res);
    } catch(err) {
      console.log(err);
    }
    read()
    })
  read()
}


function main() {
  if (process.env.NODE_ENV === 'test') {
    return
  }
  repl();
}

main();