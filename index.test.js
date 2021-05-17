import {jest} from '@jest/globals';
import {run} from './index.js';


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
  const res = run('(car (cdr (cons 1 (cons 2 3))))')
  expect(res).toEqual({"type": "num", "val": 2})
})

test("atom?", () => {
  expect(run('(atom 1)')).toEqual({type: "id", val: 't'})
  expect(run('(atom "string")')).toEqual({type: "id", val: 't'})
  expect(run('(atom (quote x))')).toEqual({type: "id", val: 't'})
  expect(run('(atom (cons 1 2))')).toEqual({type: "list", val: []})
})