import {jest} from '@jest/globals';
import {run, TRUE, FALSE, newEnv} from './index.js';
import { cleanAST } from './parser.js';

let env;

beforeEach(() => {
  env = newEnv()
  run('(load "lisp-eval.ls")', env)
})

test("example 1", () => {
  expect(cleanAST(run("(eval. 'x '((x a) (y b)))", env))[0]).toEqual({type: 'id', val: 'a'})
})

test("example 2", () => {
  expect(run("(eval. '(eq 'a 'a) '())", env)[0]).toEqual({type: 'id', val: 't'})
})

test("example 3", () => {
  expect(cleanAST(
    run("(eval. '(cons x '(b c)) '((x a) (y b)))", env))[0]
  ).toEqual({type: 'list', val: [
    {type: 'id', val: 'a'},
    {type: 'id', val: 'b'},
    {type: 'id', val: 'c'},
  ]})
})

test("example 4", () => {
  expect(cleanAST(
    run("(eval. '(cond ((atom x) 'atom) ('t 'list)) '((x '(a b))))", env))[0]
  ).toEqual({type: 'id', val: 'list'})
})

test("example 5", () => {
  expect(cleanAST(run("(eval. '(f '(b c)) '((f (lambda (x) (cons 'a x)))))", env))[0]).toEqual({type: 'list', val: [
    {type: 'id', val: 'a'},
    {type: 'id', val: 'b'},
    {type: 'id', val: 'c'},
  ]})
})



