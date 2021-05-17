import {jest} from '@jest/globals';
import {run, TRUE, FALSE, globalEnv} from './index.js';

let env;

beforeEach(() => {
  env = {_parentEnv: globalEnv}
  run('(load "lib.ls")', env)
})


test("cxxxr", () => {
  expect(run("(caar '((a b) c))")[0]).toEqual({type: 'id', val: 'a'})
  expect(run("(cadar '(((c y) 1) c))")[0]).toEqual({type: 'num', val: 1})
  expect(run("(caddr '(1 (2 3) 4))")[0]).toEqual({type: 'num', val: 4})
  expect(run("(cadr '(1 2))")[0]).toEqual({type: 'num', val: 2})
  expect(run("(cdar '((1 2) 3))")[0]).toEqual({type: 'list', val: [{type: 'num', val: 2}]})
})

test("null", () => {
  expect(run("(null. 't)")[0]).toEqual(FALSE)
  expect(run("(null. '())")[0]).toEqual(TRUE)
})

test("and", () => {
  expect(run("(and. 't 't)")[0]).toEqual(TRUE)
  expect(run("(and. '() 't)")[0]).toEqual(FALSE)
  expect(run("(and. 't '())")[0]).toEqual(FALSE)
  expect(run("(and. '() '())")[0]).toEqual(FALSE)
  expect(run("(and. (atom 'a) (eq 'a 'b))")[0]).toEqual(FALSE)
  expect(run("(and. (atom 'a) (eq 'a 'a))")[0]).toEqual(TRUE)
})

test("not", () => {
  expect(run("(not. 't)")[0]).toEqual(FALSE)
  expect(run("(not. '())")[0]).toEqual(TRUE)
  expect(run("(not. (atom 'a))")[0]).toEqual(FALSE)
  expect(run("(not. (eq 'a 'b))")[0]).toEqual(TRUE)
})

test("append", () => {
  expect(run("(append. '(a b) '(c d))")[0]).toEqual({
    type: 'list',
    val: [
      {type: 'id', val: 'a'},
      {type: 'id', val: 'b'},
      {type: 'id', val: 'c'},
      {type: 'id', val: 'd'},
    ]
  })
  expect(run("(append. '() '(c d))")[0]).toEqual({
    type: 'list',
    val: [
      {type: 'id', val: 'c'},
      {type: 'id', val: 'd'},
    ]
  })
  expect(run("(append. '(a b) '())")[0]).toEqual({
    type: 'list',
    val: [
      {type: 'id', val: 'a'},
      {type: 'id', val: 'b'},
    ]
  })
})

test('pair', () => {
  expect(run("(pair. '(x y z) '(a b c))")[0]).toEqual({
    type: 'list',
    val: [
      {type: 'list', val: [{type: 'id', val: 'x'},{type: 'id', val: 'a'},]},
      {type: 'list', val: [{type: 'id', val: 'y'},{type: 'id', val: 'b'},]},
      {type: 'list', val: [{type: 'id', val: 'z'},{type: 'id', val: 'c'},]},
    ]
  })
})
