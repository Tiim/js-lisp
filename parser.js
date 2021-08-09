import { ParseError } from "./error.js";

/**
 * Read characters and return a number token
 */
function tokenizeNumber(chars) {
  
  const recoverChars = chars.copy();
  
  let c = chars.shift();
  let nr = '';
  while (c != null && c.match(number)|| c === '.') {
    nr += c;
    c = chars.shift();
  }
  if (c != null) {
    chars.unshift(c);
  }
  const num = Number(nr);
  if (Number.isNaN(num)) {
    return tokenizeIdentifier(recoverChars);
  } else {
    return {type: 'num', val: num, pos: recoverChars.pos};
  }
}

/**
 * Read characters and return a identifier token
 */
function tokenizeIdentifier(chars) {
  const pos = chars.pos
  let c = chars.shift();
  let id = '';
  while (c != null && (c.match(identifier)|| c.match(number))) {
    id += c;
    c = chars.shift();
  }
  if (c != null) {
    chars.unshift(c);
  }
  return {type: 'id', val: id, pos};
}

/**
 * Read characters and return a string token
 */
function tokenizeString(chars) {
  const pos = chars.pos
  let c = chars.shift() // "
  let last = c;
  c = chars.shift()
  let str = '';
  while (true) {
    if (c === '"' && last !== '\\') {
      return {type: 'str', val: str, pos};
    } 
    if (c === undefined) {
      throw new ParseError("String literal never finished", pos)
    }
    str += c;
    last = c;
    c = chars.shift();
  }
}

/* Some Regex matchers */
const whitespace = /\s/
const number = /-|\d/
const identifier = /[A-Za-z_\-+\/\*\?\.]/

/**
 * The main tokenizer function.
 * Receives a string and returns an array of tokens
 */
export function tokenize(str) {
  const tokens = []

  const chars = new CharacterProvider(str);
  
  while (chars.length > 0) {
    const c = chars.shift()

    if (c.match(whitespace)) {
      continue
    } else if (c === '(' || c === ')') {
      tokens.push({type: 'special', val: c, pos: chars.pos})
    } else if (c.match(number)) {
      chars.unshift(c);
      tokens.push(tokenizeNumber(chars));
    } else if (c.match(identifier)) {
      chars.unshift(c);
      tokens.push(tokenizeIdentifier(chars));
    } else if (c === '"') {
      chars.unshift(c)
      tokens.push(tokenizeString(chars))
    } else if (c === '\'') {
      tokens.push({type: "special", val: '\'', pos: chars.pos});
    }
  }
  return tokens;
}

/**
 * AST assembling of a quoted expression
 */
function quoteAst(tokens) {
  const AST = [];
  let t = tokens.shift()
  const pos = t.pos;
  if (t.type !== 'special' || t.val !== '\'') {
    throw new ParseError(`Expected "'" instead of "${t}"`, t.pos);
  }
  t = tokens.shift()
  if (t.type !== 'special' || t.val !== '(') {
    return {type: 'list', val: [{type: 'id', val: 'quote'}, t], pos: t.pos}
  }
  t = tokens.shift()
  while ( t==null || t.type !== 'special' || t.val !== ')') {
    if (t === undefined) {
      throw new ParseError('Quoted S-Expression not closed with ")"', pos);
    } else if (t.type === 'special' && t.val === '(') {
      tokens.unshift(t)
      AST.push(ast(tokens));
    } else if(t.type === 'special' && t.val === '\'') {
      tokens.unshift(t);
      AST.push(quoteAst(tokens));
    } else {
      AST.push(t);
    }
    t = tokens.shift()
  }
  return {type: 'list', val: [{type: 'id', val: 'quote'}, {type: 'list', val: AST}], pos};
}

/**
 * AST assembling from list of tokens
 */
export function ast(tokens) {  
  const AST = [];
  let t = tokens.shift()
  const pos = t.pos;
  
  if (t.type === 'special' && t.val === '\'') {
    tokens.unshift(t)
    return quoteAst(tokens)
  }

  if (t.type !== 'special') {
    return t;
  }
  
  if (t.type !== 'special' || t.val !== '(') {
    throw new ParseError(`Expected "(" instead of "${t}"`, t.pos);
  }
  t = tokens.shift()
  while (t == null || t.type !== 'special' || t.val !== ')') {
    if (t === undefined) {
      throw new ParseError('S-Expression not closed with ")"', pos);
    } else if (t.type === 'special' && t.val === '(') {
      tokens.unshift(t)
      AST.push(ast(tokens));
    } else if(t.type === 'special' && t.val === '\'') {
      tokens.unshift(t);
      AST.push(quoteAst(tokens));
    } else {
      AST.push(t);
    }
    t = tokens.shift()
  }
  return {type: 'list', val: AST, pos};
}


/**
 * Tokenize and assemble AST from string
 * returns array of AST objects.
 */
export function parse(str) {
  const tokens = tokenize(str);
  const a = []
  do {
    a.push(ast(tokens));
  } while (tokens.length != 0)
  return a;
}


/**
 * Removes all properties of the AST exept the type and value properties
 * This is useful for the unit tests because for example the pos property is just noise
 */
export function cleanAST(obj) {
  if (Array.isArray(obj)) {
    return obj.map(o => cleanAST(o));
  } else if (obj.type === 'list') {
    return {type: 'list', val: obj.val.map(o => cleanAST(o))};
  } else {
    return {type: obj.type, val: obj.val};
  }
}

class CharacterProvider {

  constructor(str) {
    this.chars = str.split('');
    this.line = 1;
    this.char = 1;
    this.charTotal = 1;
  }

  shift() {
    const c = this.chars.shift();
    this.char += 1;
    this.charTotal += 1;
    if (c === '\n') {
      this.line += 1;
      this.char = 0;
    }
    return c;
  }

  unshift(c) {
    this.chars.unshift(c);
    this.char -= 1;
    this.charTotal -= 1;

    // TODO: what if c is '\n'?
  }

  copy() {
    const n = new CharacterProvider("");
    n.chars = [...this.chars];
    n.line = this.line;
    n.char = this.char;
    n.charTotal = this.charTotal;
    return n;
  }

  get length() {
    return this.chars.length;
  }

  get pos() {
    return {
      line: this.line,
      char: this.char,
      charTotal: this.charTotal,
      toString() {
        return `line: ${this.line}, character: ${this.char}`
      }
    }
  }

}