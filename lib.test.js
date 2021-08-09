import {jest} from '@jest/globals';
import {run, TRUE, FALSE, newEnv} from './index.js';
import { cleanAST } from './parser.js';

let env;

beforeEach(() => {
  env = newEnv()
  run('(load "lib.ls")', env)
})


test("cxxxr", () => {
  expect(cleanAST(run("(caar '((a b) c))", env)[0])).toEqual({type: 'id', val: 'a'})
  expect(cleanAST(run("(cadar '(((c y) 1) c))", env)[0])).toEqual({type: 'num', val: 1})
  expect(cleanAST(run("(caddar '((a (b c) d) x))", env)[0])).toEqual({type: 'id', val: 'd'})
  expect(cleanAST(run("(caddr '(1 (2 3) 4))", env)[0])).toEqual({type: 'num', val: 4})
  expect(cleanAST(run("(cadr '(1 2))", env)[0])).toEqual({type: 'num', val: 2})
  expect(cleanAST(run("(cdar '((a b) (c d) e))", env)[0])).toEqual({type: 'list', val: [{type: 'id', val: 'b'}]})
})

test("null", () => {
  expect(run("(null. 't)", env)[0]).toEqual(FALSE)
  expect(run("(null. '())", env)[0]).toEqual(TRUE)
})

test("and", () => {
  expect(cleanAST(run("(and. 't 't)", env))[0]).toEqual(TRUE)
  expect(cleanAST(run("(and. '() 't)", env))[0]).toEqual(FALSE)
  expect(cleanAST(run("(and. 't '())", env))[0]).toEqual(FALSE)
  expect(cleanAST(run("(and. '() '())", env))[0]).toEqual(FALSE)
  expect(cleanAST(run("(and. (atom 'a) (eq 'a 'b))", env))[0]).toEqual(FALSE)
  expect(cleanAST(run("(and. (atom 'a) (eq 'a 'a))", env))[0]).toEqual(TRUE)
})

test("not", () => {
  expect(cleanAST(run("(not. 't)", env))[0]).toEqual(FALSE)
  expect(cleanAST(run("(not. '())", env))[0]).toEqual(TRUE)
  expect(cleanAST(run("(not. (atom 'a))", env))[0]).toEqual(FALSE)
  expect(cleanAST(run("(not. (eq 'a 'b))", env))[0]).toEqual(TRUE)
})

test("append", () => {
  expect(cleanAST(run("(append. '(a b) '(c d))", env))[0]).toEqual({
    type: 'list',
    val: [
      {type: 'id', val: 'a'},
      {type: 'id', val: 'b'},
      {type: 'id', val: 'c'},
      {type: 'id', val: 'd'},
    ]
  })
  expect(cleanAST(run("(append. '() '(c d))", env)[0])).toEqual({
    type: 'list',
    val: [
      {type: 'id', val: 'c'},
      {type: 'id', val: 'd'},
    ]
  })
  expect(cleanAST(run("(append. '(a b) '())", env))[0]).toEqual({
    type: 'list',
    val: [
      {type: 'id', val: 'a'},
      {type: 'id', val: 'b'},
    ]
  })
})

test('pair', () => {
  expect(cleanAST(run("(pair. '(x y z) '(a b c))", env))[0]).toEqual({
    type: 'list',
    val: [
      {type: 'list', val: [{type: 'id', val: 'x'},{type: 'id', val: 'a'},]},
      {type: 'list', val: [{type: 'id', val: 'y'},{type: 'id', val: 'b'},]},
      {type: 'list', val: [{type: 'id', val: 'z'},{type: 'id', val: 'c'},]},
    ]
  })
})
