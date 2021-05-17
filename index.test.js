import {jest} from '@jest/globals';
import {run, TRUE, FALSE} from './index.js';

test("eval arithmatic +", () => {
  const res = run('(+ 1 2)')
  expect(res).toEqual({type: 'num', val: 3});
})

test("nested arithmatic", () => {
  const res = run('(+ 1 (- 2 3))')
  expect(res).toEqual({type: 'num', val: 0});
})

test("pairs", () => {
  const res = run('(cons 1 2)')
  expect(res).toEqual({type: 'list', val: [{type: 'num', val: 1 }, {type: 'num', val: 2 }]})
})

test("car cdr", () => {
  expect(run('(car (cdr (cons 1 (cons 2 3))))'))
    .toEqual({type: "num", val: 2});
  expect(run("(car '(a b c))"))
    .toEqual({type: "id", val: 'a'});
  expect(run("(cdr '(a b c))"))
    .toEqual({type: "list", val: [
      {type: "id", val: 'b'},
      {type: "id", val: 'c'}
    ]});
})

test('cons', () => {
  expect(run("(cons 'a '(b c))"))
    .toEqual({type: 'list', val: [
      {type: "id", val: 'a'},
      {type: "id", val: 'b'},
      {type: "id", val: 'c'},
    ]})
  expect(run("(cons 'a (cons 'b (cons 'c '())))"))
    .toEqual({type: 'list', val: [
      {type: "id", val: 'a'},
      {type: "id", val: 'b'},
      {type: "id", val: 'c'},
    ]})
})

test("atom", () => {
  expect(run('(atom 1)')).toEqual(TRUE)
  expect(run('(atom "string")')).toEqual(TRUE)
  expect(run('(atom (quote x))')).toEqual(TRUE)
  expect(run('(atom \'x)')).toEqual(TRUE)
  expect(run('(atom (cons 1 2))')).toEqual(FALSE)
  expect(run('(atom \'())')).toEqual(TRUE)
  expect(run('(atom (atom \'a))')).toEqual(TRUE)
  expect(run('(atom \'(atom \'a))')).toEqual(FALSE)
})

test("quote", () => {
  expect(run('(quote a)')).toEqual({type: 'id', val: 'a'})
  expect(run("'a")).toEqual({type: 'id', val: 'a'})
  expect(run("(quote (a b c))")).toEqual({type: 'list', val: [
    {type: 'id', val: 'a'},
    {type: 'id', val: 'b'},
    {type: 'id', val: 'c'},
  ]})
    expect(run("'(a b c)")).toEqual({type: 'list', val: [
    {type: 'id', val: 'a'},
    {type: 'id', val: 'b'},
    {type: 'id', val: 'c'},
  ]})
})

test("eq", () => {
  expect(run("(eq 'a 'a)")).toEqual(TRUE)
  expect(run("(eq 'a 'b)")).toEqual(FALSE)
  expect(run("(eq '() '())")).toEqual(TRUE)
})