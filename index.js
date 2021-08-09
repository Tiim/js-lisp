/*
  This is the main lisp interpreter file
  Usage:

  (Tested with node version v14.15.4)
  
  node index.js [-f (filename)] [-c '(code)']
    -f (filename): loads the file and executes it
    -c (code): executes the code given as the parameter.

    If both options are given, the file will be loaded first, then the code from the argument will be executed.

    If none of the options are given the REPL is launched.

  ## Examples:

  node index.js -f examples/roots-of-lisp.ls # run examples from roots of lisp
  node index.js -f examples/built-in-functions.ls # run other example programs
  node index.js -f examples/lib-functions.ls # run other example programs
  node index.js -f lib.ls -c "(cadar '(((c y) 1) c))" # load the "std-lib" and use a defined function

  ## REPL:

  ### Loading a Lisp file

  > (load "<filename>")
  Examples
  > (load "lib.sh")
  > (load "lisp-eval.ls")

  ### Enable debugging

  > (debug ['env])
  Examples
  > (debug)
  > (debug 'env)

  ## Running the unit tests:
  $ npm ci        #install jest dependency
  $ npm run test  #run the unit tests
*/


import readline from 'readline';
import {readFileSync} from 'fs';
import {parse} from './parser.js';
import {LispError} from './error.js';

/**
 * Debug variable. If set to true will print debug information.
 * Can be toggled at runtime with (debug)
 */
let DEBUG = false;

/**
 * Helper function, only logs when debug flag is set
 */
const LOG = (...x) => DEBUG && console.log(...x);
/**
 * Helper funtion (deep object printing), only logs when debug flag is set
 */
const DIR = (x) => DEBUG && console.dir(x, {depth: Infinity}); 

const printStacktrace = (stacktrace) => stacktrace?.forEach((x) => console.log("# " + x))

/**
 * Constant representing the truth value 't
 */
export const TRUE = {type: 'id', val: 't'};
/**
 * Constant representing the truth value '()
 */
export const FALSE = {type: 'list', val: []};

/**
 * Helper function create a new environment with only the gloabal env as parent
 */
export const newEnv = () => ({_parentEnv: globalEnv})

/**
 * Helper funtion. Returns true if x == TRUE
 */
const isTrue = (x) => x.type == 'id' && x.val == 't';

/**
 * Returns value from given environment, recursively searches 
 * parent environments
 */
const getEnv = (id, env, stacktrace) => {
  do {
    const val = env[id];
    if (val) {
      return val;
    }
    env = env._parentEnv;
  } while(env);
  DIR(env);
  throw new LispError(`Identifier ${id} not found in env ${env}`, [...stacktrace, `Evaluating ${id}`]);
}

/**
 * recursively print environment for debugging
 */
const printEnv = (env) => {
  do {
    Object.entries(env)
      .forEach(([key, val]) => key!== '_parentEnv' && console.log(`${key}: ${display(val)}`))
    env = env._parentEnv;
  } while(env);
}

/**
 * Assert value x is of type type.
 */
function assertType(x, type, stacktrace) {
  if (x?.type === type) {
    return x
  } else {
    throw new LispError("Expected type " + type + " got type " + x?.type, stacktrace)
  }
}

function assertArgs(x, {min, max, exact}, stacktrace) {
  if(min !== undefined && x.length < min) {
    throw new LispError(`Function ${stacktrace[stacktrace.length-1]} expects at least ${min} args, given: ${x.length}`, stacktrace);
  } else if (max !== undefined && x.length > max) {
    throw new LispError(`Function ${stacktrace[stacktrace.length-1]} expects at most ${max} args, given: ${x.length}`, stacktrace);
  } else if (exact !== undefined && x.length !== exact) {
    throw new LispError(`Function ${stacktrace[stacktrace.length-1]} expects exactly ${exact} args, given: ${x.length}`, stacktrace);
  }
  return x;
}

function assertListLen(x, {min, max, exact}, stacktrace) {
  assertType(x, 'list', stacktrace);
  if(min !== undefined && x.val.length < min) {
    throw new LispError(`List index out of bounds, length: ${x.val.length}, expected at least: ${min}`, stacktrace);
  } else if (max !== undefined && x.val.length > max) {
    throw new LispError(`List index out of bounds, length: ${x.val.length}, expected at most: ${max}`, stacktrace);
  } else if (exact !== undefined && x.val.length !== exact) {
    throw new LispError(`List index out of bounds, length: ${x.val.length}, expected exactly: ${exact}`, stacktrace);
  }

  return x;
}

/**
 * The global environment
 */
export const globalEnv = {
  '+': (x, _env, stacktrace) => ({
    type: "num", 
    val: x.map(y => 
      assertType(y, 'num', stacktrace)
    ).reduce((p, c) => p + c.val, 0)}),
  '-': (x, env, stacktrace) => {
    x.forEach(y => assertType(y, "num", stacktrace))
    if (x.length <= 1) {
      return {type: "num", val: -(x[0]?.val ?? 0)};
    } else {
      return {type: "num", val: x[0].val - getEnv('+',env, stacktrace)(x.slice(1)).val}
    }
  },
  '*': (x) => ({type: "num", val: x.map(y => assertType(y, "num", stacktrace)).reduce((p, c) => p*c.val, 1)}),
  '/': (x, env, stacktrace) => {
    x.forEach(y => assertType(y, "num", stacktrace))

    if (x.slice(1).findIndex( y => y.val === 0) !== -1) {
      throw new LispError('Divide By Zero', stacktrace)
    }

    if (x.length <= 1) {
      return {type: "num", val: 1 / (x[0]?.val ?? 1)};
    } else {
      return {type: "num", val: x[0].val / getEnv('*',env, stacktrace)(x.slice(1)).val};
    }
  },
  'atom': (x, _env, stacktrace) =>  assertArgs(x, {exact: 1}, stacktrace)[0].type !== 'list' || x[0].val.length === 0 ? TRUE: FALSE,
  'begin': (x, _env, stacktrace) => assertArgs(x, {min: 1}, stacktrace)[x.length -1],
  'car': (x, _env, stacktrace) => assertListLen(assertArgs(x, {exact: 1}, stacktrace)[0], {min: 1}, stacktrace).val[0],
  'cdr': (x, _env, stacktrace) => ({type: 'list', val: (assertType(assertArgs(x, {exact: 1}, stacktrace)[0], 'list', stacktrace).val).slice(1)}),
  'cond': (x, env, stacktrace) => { 
    assertArgs(x, {min: 1}, stacktrace)
    x.forEach(y => assertListLen(y, {exact: 2}, stacktrace));
    const trueCondition = x.find(c => isTrue(evaluate(c.val[0], env)))?.val[1];
    if (trueCondition === undefined) {
      throw new LispError("No true branch found", stacktrace)
    }
    return evaluate(trueCondition, env, stacktrace);
  },
  'cons': (x, _env, stacktrace) => {
    assertArgs(x, {exact: 2}, stacktrace);
    return {type: 'list', val: [x[0], ...(x[1].type === 'list'? x[1].val : [x[1]])]};
  },
  'defun': (x, env) => {

    // TODO: implement type and arg checking 
    env[x[0].val] = ({type: 'func', args: x[1].val.map(y => y.val), ast: x[2], name: x[0].val});
    return env[x[0].val];
  },
  'display': (x) => x.forEach(x => console.log(x)),
  'print': (x) => {console.log(x.map(y => display(y)).join('\n')); return TRUE;},
  'eq': (x) => x[0] === x[1] || (x[0].type && x[1].type && x[0].type === x[1].type && JSON.stringify(x[0].val) === JSON.stringify(x[1].val))? TRUE:FALSE,
  'eval': (x, env, stacktrace) => evaluate(assertListLen(x[0], {min: 1}, stacktrace), env, stacktrace),
  'label': (x, env) => env[x[0].val] = x[1],
  'lambda': (x) => ({type: 'func', args: x[0].val.map(y => y.val), ast: x[1]}),
  'list': (x) => ({type: 'list', val: [...x]}),
  'load': (x, env, stacktrace) => {loadFile(assertType(x[0], 'str', stacktrace).val, env, stacktrace); return TRUE},
  'parse': (x, _env, stacktrace) => ({type: 'list', val: parse(assertType(x[0], 'str', stacktrace).val)}),
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


/**
 * The eval function
 */
function evaluate(ast, env, stacktrace = []) {
  LOG('Evaluating:');
  DIR(ast);
  LOG('STACK:');
  DIR(stacktrace);

  if (ast == undefined) {
    throw new LispError('Internal error: tried to evaluate undefined value', stacktrace)
  }
  
  if (ast.type === 'id') {
    // ast is an identifier, return the value from the environment
    return getEnv(ast.val, env, stacktrace);
  } else if (ast.type === 'num' || ast.type === 'str') {
    // ast is number or string, return directly
    return ast
  } else if (ast.type === 'list') {
    // ast is a list, call first element as a function with other elements as args

    // recursively evalueate the first element
    let proc = evaluate(ast.val[0], env, stacktrace)

    // to solve quoted lambdas for some reason
    while (proc.type === 'list') {
      proc = evaluate(proc, env, stacktrace)
    }

    // if the first paramenter is not a function
    if (!proc || (typeof proc !== 'function' && proc.type !== 'func')) {
      console.log(ast.val[0].val)
      DIR(proc)
      throw new LispError(`Function "${ast.val[0].val}" is undefined`, stacktrace);
    }

    // evaluate the arguments but skip special forms
    const args = ast.val.slice(1).map((a, i) => {
      if (proc.preventEval && proc.preventEval.includes(i)) {
        return a;
      }
      return evaluate(a, env, stacktrace)
    })


    // execute built in functions or evaluate the AST of user defined function
    let ret;
    if (!proc.type) {
      LOG('Built-in function call:',  proc?.name);
      DIR(args)
      try {
        ret = proc(args, env, [...stacktrace, proc.name]);
      } catch (err) {
        if (DEBUG) {
          console.log('ERROR: function call ' + proc?.name +' failed.');
          console.log('args: ' + JSON.stringify(args, null, 2));
          console.log('env:', + JSON.stringify(env, null, 2));
        }
        throw err;
      }
    } else {
      LOG('User defined function call:');
      DIR(proc)
      const newEnv = proc.args.reduce((obj, a, i) => ({...obj, [a]: args[i]}),{})
      LOG('New ENV', newEnv)
      newEnv._parentEnv = env;
      ret = evaluate(proc.ast, newEnv, [...stacktrace, `${proc.name}`])
    }
    LOG("Return", ret);
    return ret;
  }
}


/**
 * Convenience run function, will parse and run a program with a given env.
 * returns a array of results
 */
export function run(str, env, stacktrace=[]) {
  const p = parse(str);
  if (!env) {
    env = newEnv();
  }
  return p.map(e => evaluate(e, env, stacktrace));
}

/**
 * Load content of file and run it with given environment.
 * Returns an AST list of results
 */
function loadFile(file, env, stacktrace=[]) {
  LOG('Loading file ' + file)
  const str = readFileSync(file, {encoding: 'utf-8'})
  return {type: 'list', val: run(str, env, stacktrace)};
}

/**
 * Launch the REPL
 */
function repl() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  const env = newEnv();

  const read = () =>
  rl.question('> ', (str) => {
    try {  
      const res = run(str, env);

      LOG(res)
      res.forEach(r => console.log('->', display(r)));
    } catch(err) {
      if (err.lispStacktrace) {
        printStacktrace(err.lispStacktrace);
        console.log('#>',err.message);
      } else {
        console.log("No stacktrace found!");
        console.log(err)
      }
    }
    read()
    })
  read()
}

/**
 * Format AST value as human readable text
 */
function display(value) {
  if (value == null) {
    return '!no result'
  }
  if (value.type === 'id') {
    return `${value.val}`;
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
  return JSON.stringify(value);
}

/**
 * Main function. Handles command line arguments and either runs code from them or launches the REPL
 */
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