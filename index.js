import { exit } from 'process';
import readline from 'readline';
import {readFileSync} from 'fs';
import {parse} from './parser.js';


const DEBUG = false;
const LOG = (...x) => DEBUG && console.log(...x);
const DIR = (...x) => DEBUG && console.dir(...x); 

const globalEnv = {
  '+': (x) => x.reduce((p, c) => p+c, 0),
  '-': (x) => x.slice(1).reduce((p, c) => p-c, x[0]),
  '*': (x) => x.reduce((p, c) => p*c, 0),
  '/': (x) => x.reduce((p, c) => p/c, 0),
  'load': (x) => loadFile(x[0]),
  'cons': (x) => x.slice(0,2),
  'cdr': (x) => x[0][1],
  'car': (x) => x[0][0],
  'parse': (x) => parse(x[0]),
  'eval': (x) => x[0],
}

function evaluate(ast, env=globalEnv) {
  LOG('Evaluating', ast);
  if (ast.type === 'id') {
    return env[ast.val];
  } else if (ast.type === 'num' || ast.type === 'str') {
    return ast.val
  } else if (ast.type === 'ast') {
    LOG('Function call:', ast.val);
    const proc = evaluate(ast.val[0], env)
    const args = ast.val.slice(1).map(a => evaluate(a,env))

    if (!proc || typeof proc !== 'function') {
      throw new Error(`Function "${ast.val[0].val}" is undefined`);
    }
    return proc(args)
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