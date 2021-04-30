import { exit } from 'process';
import readline from 'readline';
import {readFileSync} from 'fs';
import {parse} from './parser.js';

const globalEnv = {
  '+': (x) => x.reduce((p, c) => p+c, 0),
  '-': (x) => x.slice(1).reduce((p, c) => p-c, x[0]),
  '*': (x) => x.reduce((p, c) => p*c, 0),
  '/': (x) => x.reduce((p, c) => p/c, 0),
  'load': (x) => loadFile(x[0]),
}

function evaluate(ast, env=globalEnv) {
  if (ast.type === 'id') {
    return env[ast.val];
  } else if (ast.type === 'num' || ast.type === 'str') {
    return ast.val
  } else if (ast.type === 'ast') {
    const proc = evaluate(ast.val[0], env)
    const args = ast.val.slice(1).map(a => evaluate(a,env))
    return proc(args)
  }
}


function loadFile(file) {
  console.log('Loading file ' + file)
  const str = readFileSync(file, {encoding: 'utf-8'})
  const p = parse(str);
  return evaluate(p);
}

function repl() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  const read = () =>
  rl.question('> ', (str) => {
    try {  
      const p = parse(str);
      console.log(p);
      const res = evaluate(p);
      console.log(res);
      read()
     } catch(err) {
       console.log(err);
       exit(0);
     }
    })
  read()
}

repl()