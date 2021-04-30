import {jest} from '@jest/globals';
import {parse, tokenize} from './parser.js'

test("test basic parser usage", () => {
  const p = parse("(+ 1 2)")
  expect(p).toEqual([{type: 'id', val: '+'}, {type: 'num', val: 1}, {type: 'num', val: 2}])
})


test("tokenize number", () => {
  expect(tokenize('1234')).toEqual([{type: 'num', val: 1234}])
})

test("tokenize negative number", () => {
  expect(tokenize('-1234')).toEqual([{type: 'num', val: -1234}])
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

test("tokenize symbols as identifiers", () => {
  const symbols = ['+', '-', '*', '/']
  
  expect(tokenize(symbols.join(" "))).toEqual(
    symbols.map(s => ({type: 'id', val: s})),
  )
})