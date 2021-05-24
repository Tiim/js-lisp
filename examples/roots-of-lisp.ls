(begin 
  (load "lisp-eval.ls")
  (print "Examples from 'Roots of Lisp':")
  (print "Example 1")
  (print (eval. 'x '((x a) (y b))))
  (print "Example 2")
  (print (eval. '(eq 'a 'a) '()) )
  (print "Example 3")
  (print (eval. '(cons x '(b c)) '((x a) (y b))) )
  (print "Example 4")
  (print (eval. '(cond ((atom x) 'atom) ('t 'list)) '((x '(a b)))) )
  (print "Example 5")
  (print (eval. '(f '(b c)) '((f (lambda (x) (cons 'a x))))) )
  't
)