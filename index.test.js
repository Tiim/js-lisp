import {jest} from '@jest/globals';
import {run} from './index.js';


test("eval arithmatic +", () => {
  const res = run('(+ 1 2)')
  expect(res).toBe(3);
})

test("nested arithmatic", () => {
  const res = run('(+ 1 (- 2 3))')
  expect(res).toBe(0)
})

test("pairs", () => {
  const res = run('(cons 1 2)')
  expect(res).toEqual([1,2])
})