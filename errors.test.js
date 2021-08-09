import {jest} from '@jest/globals';
import {run, TRUE, FALSE} from './index.js';



test("stack trace", () => {
  try {
    run(`
    (defun my-failing-func (x) (/ x 0))
    (defun test () (my-failing-func 1))
    (test)
    `)
  } catch (err) {
    expect(err.lispStacktrace).toEqual([
      "test",
      "my-failing-func",
      "Builtin call: /",
    ])
  }
})

test("stack trace long", () => {
  try {
    run(`
    (defun dec (x) (cond ((eq x 0) (/ 1 x)) ('t (dec (- x 1)))))
    (dec 5)
    `)
  } catch (err) {
    console.log(err)
    expect(err.lispStacktrace).toEqual([
      "dec",
      "Builtin call: cond",
      "dec",
      "Builtin call: cond",
      "dec",
      "Builtin call: cond",
      "dec",
      "Builtin call: cond",
      "dec",
      "Builtin call: cond",
      "dec",
      "Builtin call: cond",
      "Builtin call: /",
    ])
  }
})

test("divide by zero", () => {
  expect(() => run('(/ 1 2 0)')).toThrow("Divide By Zero");
})