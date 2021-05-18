import readline from 'readline';
import {readFileSync} from 'fs';
import {parse} from './parser.js';

/**
 * Debug variable. If set to true will print debug information.
 * Can be toggled at runtime with (debug)
 */
let DEBUG = false;
const LOG = (...x) => DEBUG && console.log(...x);
const DIR = (x) => DEBUG && console.dir(x, {depth: Infinity}); 


export const TRUE = {type: 'id', val: 't'};
export const FALSE = {type: 'list', val: []};
export const newEnv = () => ({_parentEnv: globalEnv})

const isTrue = (x) => x.type == 'id' && x.val == 't';

const getEnv = (id, env) => {
  do {
    const val = env[id];
    if (val) {
      return val;
    }
    env = env._parentEnv;
  } while(env);
  DIR(env);
  throw new Error(`Identifier ${id} not found in env ${env}`);
}

const printEnv = (env) => {
  do {
    Object.entries(env)
      .forEach(([key, val]) => key!== '_parentEnv' && console.log(`${key}: ${display(val)}`))
    env = env._parentEnv;
  } while(env);
}

/**
 * The global environment
 */
export const globalEnv = {
  '+': (x) => ({type: "num", val: x.reduce((p, c) => p + c.val, 0)}),
  '-': (x, env) => {
    if (x.length === 1) {
      return {type: "num", val: -x[0].val};
    } else {
      return {type: "num", val: x[0].val - getEnv('+',env)(x.slice(1)).val}
    }
  },
  '*': (x) => ({type: "num", val:x.reduce((p, c) => p*c.val, 1)}),
  '/': (x) => {
    if (x.length === 1) {
      return {type: "num", val:1 / x[0].val};
    } else {
      return {type: "num", val: x[0].val / getEnv('*',env)(x.slice(1)).val};
    }
  },
  'atom': (x) =>  x[0].type !== 'list' || x[0].val.length === 0 ? TRUE: FALSE,
  'begin': (x) => x[x.length -1],
  'car': (x) => x[0].val[0],
  'cdr': (x) => ({type: 'list', val: (x[0].val).slice(1)}),
  'cond': (x, env) => evaluate(x.find(c => isTrue(evaluate(c.val[0], env))).val[1], env),
  'cons': (x) => ({type: 'list', val: [x[0], ...(x[1].type === 'list'? x[1].val : [x[1]])]}),
  'defun': (x, env) => env[x[0].val] = ({type: 'func', args: x[1].val.map(y => y.val), ast: x[2]}),
  'display': (x) => x.forEach(x => console.log(x)),
  'eq': (x) => x[0] === x[1] || (x[0].type && x[1].type && x[0].type === x[1].type && JSON.stringify(x[0].val) === JSON.stringify(x[1].val))? TRUE:FALSE,
  'eval': (x) => x,
  'label': (x, env) => env[x[0].val] = x[1],
  'lambda': (x, env) => ({type: 'func', args: x[0].val.map(y => y.val), ast: x[1]}),
  'list': (x) => ({type: 'list', val: [...x]}),
  'load': (x, env) => {loadFile(x[0].val, env); return TRUE},
  'parse': (x) => ({type: list, val: parse(x[0])}),
  'quote': (x) => x[0],
  'debug': (x, env) => {
    if (!x.length) {
      DEBUG = !DEBUG;
    } else if (x[0].val === 'env') {
      printEnv(env);
    } 
    return TRUE;
  },
}

/**
 * Prevent evaluation of parameter number 0 of the define command
 */
globalEnv.label.preventEval = [0];
/**
 * Prevent evaluation of parameter number 0 of the defun command
 */
globalEnv.defun.preventEval = [0, 1, 2];
/**
 * Prevent evaluation of the first 100 parameters of the quote command
 */
globalEnv.quote.preventEval = [...new Array(100)].map((_,i) => i);
/**
 * Prevent evaluation of the first 100 parameters of the cond command
 */
globalEnv.cond.preventEval = [...new Array(100)].map((_,i) => i);
/**
 * Prevent evaluation of the first and second paramerter of the lambda command
 */
globalEnv.lambda.preventEval = [0,1];


function evaluate(ast, env) {
  LOG('Evaluating:');
  DIR(ast);
  DIR(env);
  if (ast.type === 'id') {
    return getEnv(ast.val, env);
  } else if (ast.type === 'num' || ast.type === 'str') {
    return ast
  } else if (ast.type === 'list') {
    let proc = evaluate(ast.val[0], env)

    // to solve quoted lambdas for some reason
    while (proc.type === 'list') {
      proc = evaluate(proc, env)
    }

    if (!proc || (typeof proc !== 'function' && proc.type !== 'func')) {
      console.log(ast.val[0].val)
      DIR(proc)
      throw new Error(`Function "${ast.val[0].val}" is undefined`);
    }
    const args = ast.val.slice(1).map((a, i) => {
      if (proc.preventEval && proc.preventEval.includes(i)) {
        return a;
      }
      return evaluate(a, env)
    })
    let ret;
    if (!proc.type) {
      LOG('Built-in function call:',  proc?.name);
      DIR(args)
      try {
        ret = proc(args, env);
      } catch (err) {
        console.log('ERROR: function call ' + proc?.name +' failed.');
        console.log('args: ' + JSON.stringify(args, null, 2));
        console.log('env:', + JSON.stringify(env, null, 2));
        throw new Error(err);
      }
    } else {
      LOG('User defined function call:');
      DIR(proc)
      const newEnv = proc.args.reduce((obj, a, i) => ({...obj, [a]: args[i]}),{})
      LOG('New ENV', newEnv)
      newEnv._parentEnv = env;
      ret = evaluate(proc.ast, newEnv)
    }
    LOG("Return", ret);
    return ret;
  }
}

export function run(str, env) {
  const p = parse(str);
  if (!env) {
    env = newEnv();
  }
  return p.map(e => evaluate(e, env));
}


function loadFile(file, env) {
  LOG('Loading file ' + file)
  const str = readFileSync(file, {encoding: 'utf-8'})
  return {type: 'list', val: run(str, env)};
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
      res.forEach(r => console.log('->', display(r)));
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
  if (value.type === 'func') {
    return `(lambda (${value.args.join(' ')}) (${value.ast.val.map(display).join(' ')}))`
  }
  if (typeof value === 'function') {
    return `(lambda () (internal function))`
  }
  console.log(`Missing formatter for ${value} (${typeof value})`);
  return value;
}


function main() {
  if (process.env.NODE_ENV === 'test') {
    return
  }
  
  const env = newEnv();
  const argv = process.argv;
  
  const fileIdx = argv.findIndex(a => a === '-f')+1;
  const file = argv[fileIdx];
  if (file && fileIdx !== 0) {
    console.log(display(loadFile(file, env)));
    console.log()
  }
  const codeIdx = argv.findIndex(a => a === '-c') +1;
  const code = argv[codeIdx];
  if (code && codeIdx !== 0) {
    const res = run(code, env)
    res.forEach(r => console.log(display(r)));
  }  

  if (!fileIdx && !codeIdx) {
    repl();
  }
}

main();