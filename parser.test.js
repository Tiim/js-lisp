import {jest} from '@jest/globals';
import {ast, parse, tokenize} from './parser.js'

test("test basic parser usage", () => {
  const [p] = parse("(+ 1 2)")
  expect(p.val).toEqual([{type: 'id', val: '+'}, {type: 'num', val: 1}, {type: 'num', val: 2}])
})

test("test nested parser usage", () => {
  const [p] = parse("(+ 1 (+ 2 3))")
  expect(p.val).toEqual([
    {type: 'id', val: '+'}, 
    {type: 'num', val: 1}, 
    {type: 'list', val: [
      {type: 'id', val: '+'},
      {type: 'num', val: 2},
      {type: 'num', val: 3}
    ]}
  ])
})

test("test nested ast usage", () => {
  const p = ast([
    {type: 'special', val: '('}, 
    {type: 'id', val: '+'},
    {type: 'num', val: 1},
    {type: 'special', val: '('},
    {type: 'id', val: '+'},
    {type: 'num', val: 2},
    {type: 'num', val: 3},
    {type: 'special', val: ')'},
    {type: 'special', val: ')'},]
  )
  expect(p).toEqual({type: 'list', val: [
    {type: 'id', val: '+'}, 
    {type: 'num', val: 1}, 
    {type: 'list', val: [
      {type: 'id', val: '+'},
      {type: 'num', val: 2},
      {type: 'num', val: 3}
    ]}
  ]})
})


test("tokenize number", () => {
  expect(tokenize('1234')).toEqual([{type: 'num', val: 1234}])
})

test("tokenize negative number", () => {
  expect(tokenize('-1234')).toEqual([{type: 'num', val: -1234}])
})

test("tokenize number with decimal point", () => {
  expect(tokenize('2.5')).toEqual([{type: 'num', val: 2.5}])
})

test("tokenize string", () => {
  expect(tokenize('"my string"')).toEqual([{type: 'str', val: "my string"}])
})

test("tokenize identifiers", () => {
  expect(tokenize('my string')).toEqual([
    {type: 'id', val: "my"},
    {type: 'id', val: "string"},
  ])
})

test("tokenize identifiers with number", () => {
  expect(tokenize('my0')).toEqual([
    {type: 'id', val: "my0"},
  ])
})

test("tokenize identifiers with dots", () => {
  expect(tokenize('my.')).toEqual([
    {type: 'id', val: "my."},
  ])
})

test("tokenize nested expression", () => {
  expect(tokenize('(+ 1 (+ 2 3))')).toEqual([
    {type: 'special', val: '('}, 
    {type: 'id', val: '+'},
    {type: 'num', val: 1},
    {type: 'special', val: '('},
    {type: 'id', val: '+'},
    {type: 'num', val: 2},
    {type: 'num', val: 3},
    {type: 'special', val: ')'},
    {type: 'special', val: ')'},
  ])
})

test("tokenize symbols as identifiers", () => {
  const symbols = ['+', '-', '*', '/']
  
  expect(tokenize(symbols.join(" "))).toEqual(
    symbols.map(s => ({type: 'id', val: s})),
  )
})

test("nested quotes", () => {
  expect(tokenize("(eval. '(eq 'a 'a) '())")).toEqual([
    {type: 'special', val: '('},
    {type: 'id', val: 'eval.'},
    {type: 'special', val: '\''},
    {type: 'special', val: '('},
    {type: 'id', val: 'eq'},
    {type: 'special', val: '\''},
    {type: 'id', val: 'a'},
    {type: 'special', val: '\''},
    {type: 'id', val: 'a'},
    {type: 'special', val: ')'},
    {type: 'special', val: '\''},
    {type: 'special', val: '('},
    {type: 'special', val: ')'},
    {type: 'special', val: ')'},
  ])


  expect(ast(tokenize("(eval. '(eq 'a 'a) '())")))
    .toEqual(ast(tokenize("(eval. (quote (eq (quote a) (quote a))) (quote ()))")))
})