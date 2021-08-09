import {jest} from '@jest/globals';
import {run, TRUE, FALSE} from './index.js';
import {cleanAST} from './parser.js'

test("eval arithmatic +", () => {
  const [res] = run('(+ 1 2)')
  expect(res).toEqual({type: 'num', val: 3});
})

test("nested arithmatic", () => {
  const [res] = run('(+ 1 (- 2 3))')
  expect(res).toEqual({type: 'num', val: 0});
})

test("pairs", () => {
  const [res] = cleanAST(run('(cons 1 2)'));
  expect(res).toEqual({type: 'list', val: [{type: 'num', val: 1 }, {type: 'num', val: 2 }]})
})

test("car cdr", () => {
  expect(cleanAST(run('(car (cdr (cons 1 (cons 2 3))))')))
    .toEqual([{type: "num", val: 2}]);
  expect(cleanAST(run("(car '(a b c))")))
    .toEqual([{type: "id", val: 'a'}]);
  expect(cleanAST(run("(cdr '(a b c))")))
    .toEqual([{type: "list", val: [
      {type: "id", val: 'b'},
      {type: "id", val: 'c'}
    ]}]);
})

test('cons', () => {
  expect(cleanAST(run("(cons 'a '(b c))")))
    .toEqual([{type: 'list', val: [
      {type: "id", val: 'a'},
      {type: "id", val: 'b'},
      {type: "id", val: 'c'},
    ]}])
  expect(cleanAST(run("(cons 'a (cons 'b (cons 'c '())))")))
    .toEqual([{type: 'list', val: [
      {type: "id", val: 'a'},
      {type: "id", val: 'b'},
      {type: "id", val: 'c'},
    ]}])
})

test("atom", () => {
  expect(run('(atom 1)')).toEqual([TRUE])
  expect(run('(atom "string")')).toEqual([TRUE])
  expect(run('(atom (quote x))')).toEqual([TRUE])
  expect(run('(atom \'x)')).toEqual([TRUE])
  expect(run('(atom (cons 1 2))')).toEqual([FALSE])
  expect(run('(atom \'())')).toEqual([TRUE])
  expect(run('(atom (atom \'a))')).toEqual([TRUE])
  expect(run('(atom \'(atom \'a))')).toEqual([FALSE])
})

test("quote", () => {
  expect(cleanAST(run('(quote a)'))).toEqual([{type: 'id', val: 'a'}])
  expect(cleanAST(run("'a"))).toEqual([{type: 'id', val: 'a'}])
  expect(cleanAST(run("(quote (a b c))"))).toEqual([{type: 'list', val: [
    {type: 'id', val: 'a'},
    {type: 'id', val: 'b'},
    {type: 'id', val: 'c'},
  ]}])
  expect(cleanAST(run("'(a b c)"))).toEqual([{type: 'list', val: [
    {type: 'id', val: 'a'},
    {type: 'id', val: 'b'},
    {type: 'id', val: 'c'},
  ]}])
})

test("eq", () => {
  expect(run("(eq 'a 'a)")).toEqual([TRUE])
  expect(run("(eq 'a 'b)")).toEqual([FALSE])
  expect(run("(eq '() '())")).toEqual([TRUE])
})

test("lambda", () => {
  expect(cleanAST(run("((lambda (x) (cons x '(b))) 'a)"))).toEqual([{
    type: 'list', 
    val: [
      {type: 'id', val: 'a'},
      {type: 'id', val: 'b'},
    ]
  }])
  expect(cleanAST(run("((lambda (x y) (cons x (cdr y))) 'z '(a b c))"))).toEqual([{
    type: 'list', 
    val: [
      {type: 'id', val: 'z'},
      {type: 'id', val: 'b'},
      {type: 'id', val: 'c'},
    ]
  }])
  // TODO: why is the second lambda quoted in the book
  expect(cleanAST(run("((lambda (f) (f '(b c))) '(lambda (x) (cons 'a x)))"))).toEqual([{
    type: 'list', 
    val: [
      {type: 'id', val: 'a'},
      {type: 'id', val: 'b'},
      {type: 'id', val: 'c'},
    ]
  }])
  
})

test('list', () => {
  expect(cleanAST(run("(list 'a 'b 'c)"))[0]).toEqual({
    type: 'list',
    val: [
      {type: 'id', val: 'a'},
      {type: 'id', val: 'b'},
      {type: 'id', val: 'c'}
    ]
  })
})