

function tokenizeNumber(chars) {
  let c = chars.shift();
  let nr = '';
  while (c != null && c.match(number)) {
    nr += c;
    c = chars.shift();
  }
  if (c != null) {
    chars.unshift(c);
  }
  const num = Number(nr);
  if (Number.isNaN(num)) {
    return tokenizeIdentifier(nr.split('').concat(chars))
  } else {
    return {type: 'num', val: num};
  }
}

function tokenizeIdentifier(chars) {
  let c = chars.shift();
  let id = '';
  while (c != null && (c.match(identifier)|| c.match(number))) {
    id += c;
    c = chars.shift();
  }
  if (c != null) {
    chars.unshift(c);
  }
  return {type: 'id', val: id};
}

function tokenizeString(chars) {
  let c = chars.shift() // "
  let last = c;
  c = chars.shift()
  let str = '';
  while (true) {
    if (c === '"' && last !== '\\') {
      return {type: 'str', val: str};
    } 
    if (c === undefined) {
      return str;
    }
    str += c;
    last = c;
    c = chars.shift();
  }
}

const whitespace = /\s/
const number = /-|\d/
const identifier = /[A-Za-z_\-+\/\*\?]/

export function tokenize(str) {
  const tokens = []

  const chars = str.split('');
  while (chars.length > 0) {
    const c = chars.shift()

    if (c.match(whitespace)) {
      continue
    } else if (c === '(' || c === ')') {
      tokens.push(c)
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
      tokens.push('\'');
    }
  }
  return tokens;
}

function quoteAst(tokens) {
  const AST = [];
  let t = tokens.shift()
  if (t !== '\'') {
    throw new Error(`Expected "'" instead of "${t}"`);
  }
  t = tokens.shift()
  if (t !== '(') {
    return {type: 'list', val: [{type: 'id', val: 'quote'}, t]}
  }
  t = tokens.shift()
  while (t !== ')') {
    if (t === undefined) {
      throw new Error('Expression not closed with ")"');
    } else if (t === '(') {
      tokens.unshift('(')
      AST.push(ast(tokens));
    } else {
      AST.push(t);
    }
    t = tokens.shift()
  }
  return {type: 'list', val: [{type: 'id', val: 'quote'}, {type: 'list', val: AST}]};
}

export function ast(tokens) {
  const AST = [];
  let t = tokens.shift()
  
  if (t === '\'') {
    tokens.unshift(t)
    return quoteAst(tokens)
  }
  
  if (t !== '(') {
    throw new Error(`Expected "(" instead of "${t}"`);
  }
  t = tokens.shift()
  while (t !== ')') {
    if (t === undefined) {
      throw new Error('S-Expression not closed with ")"');
    } else if (t === '(') {
      tokens.unshift('(')
      AST.push(ast(tokens));
    } else if(t === '\'') {
      tokens.unshift('\'');
      AST.push(quoteAst(tokens));
    } else {
      AST.push(t);
    }
    t = tokens.shift()
  }
  return {type: 'list', val: AST};
}

export function parse(str) {
  return ast(tokenize(str));
}