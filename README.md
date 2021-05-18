# Lisp interpreter in JavaScript


## Command line interface

```
node index.js [-f (filename)] [-c '(code)']
  -f (filename): loads the file and executes it
  -c (code): executes the code given as the parameter.

  If both options are given, the file will be loaded first, then the code from the argument will be executed.
```


## Loading a Lisp file

```lisp
# node index.js
(load "my-filename")
```

### Examples

Loading the "standard library".
```lisp
(load "lib.ls")
```

Loading the Lisp interpreter (loads "lib.ls" automatically)
```
(load "lisp-eval.ls")
```

## Enamble debugging

Toggle the debug setting.
This will print the evaluation/funcion execution and other information.

```lisp
(debug)
```

Print the current environment
```lisp
(debug 'env)
```