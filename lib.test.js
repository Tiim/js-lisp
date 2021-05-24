import {jest} from '@jest/globals';
import {run, TRUE, FALSE, newEnv} from './index.js';

let env;

beforeEach(() => {
  env = newEnv()
  run('(load "lib.ls")', env)
})


test("cxxxr", () => {
  expect(run("(caar '((a b) c))", env)[0]).toEqual({type: 'id', val: 'a'})
  expect(run("(cadar '(((c y) 1) c))", env)[0]).toEqual({type: 'num', val: 1})
  expect(run("(caddar '((a (b c) d) x))", env)[0]).toEqual({type: 'id', val: 'd'})
  expect(run("(caddr '(1 (2 3) 4))", env)[0]).toEqual({type: 'num', val: 4})
  expect(run("(cadr '(1 2))", env)[0]).toEqual({type: 'num', val: 2})
  expect(run("(cdar '((a b) (c d) e))", env)[0]).toEqual({type: 'list', val: [{type: 'id', val: 'b'}]})
})

test("null", () => {
  expect(run("(null. 't)", env)[0]).toEqual(FALSE)
  expect(run("(null. '())", env)[0]).toEqual(TRUE)
})

test("and", () => {
  expect(run("(and. 't 't)", env)[0]).toEqual(TRUE)
  expect(run("(and. '() 't)", env)[0]).toEqual(FALSE)
  expect(run("(and. 't '())", env)[0]).toEqual(FALSE)
  expect(run("(and. '() '())", env)[0]).toEqual(FALSE)
  expect(run("(and. (atom 'a) (eq 'a 'b))", env)[0]).toEqual(FALSE)
  expect(run("(and. (atom 'a) (eq 'a 'a))", env)[0]).toEqual(TRUE)
})

test("not", () => {
  expect(run("(not. 't)", env)[0]).toEqual(FALSE)
  expect(run("(not. '())", env)[0]).toEqual(TRUE)
  expect(run("(not. (atom 'a))", env)[0]).toEqual(FALSE)
  expect(run("(not. (eq 'a 'b))", env)[0]).toEqual(TRUE)
})

test("append", () => {
  expect(run("(append. '(a b) '(c d))", env)[0]).toEqual({
    type: 'list',
    val: [
      {type: 'id', val: 'a'},
      {type: 'id', val: 'b'},
      {type: 'id', val: 'c'},
      {type: 'id', val: 'd'},
    ]
  })
  expect(run("(append. '() '(c d))", env)[0]).toEqual({
    type: 'list',
    val: [
      {type: 'id', val: 'c'},
      {type: 'id', val: 'd'},
    ]
  })
  expect(run("(append. '(a b) '())", env)[0]).toEqual({
    type: 'list',
    val: [
      {type: 'id', val: 'a'},
      {type: 'id', val: 'b'},
    ]
  })
})

test('pair', () => {
  expect(run("(pair. '(x y z) '(a b c))", env)[0]).toEqual({
    type: 'list',
    val: [
      {type: 'list', val: [{type: 'id', val: 'x'},{type: 'id', val: 'a'},]},
      {type: 'list', val: [{type: 'id', val: 'y'},{type: 'id', val: 'b'},]},
      {type: 'list', val: [{type: 'id', val: 'z'},{type: 'id', val: 'c'},]},
    ]
  })
})
