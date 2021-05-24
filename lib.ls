(begin
  "The standard library"
  "Wrapping in (begin) is not neccesary but prevents the lambdas being printed when loading the file"
  
  (defun caar   (e) (car (car e)))
  (defun cadar  (e) (car (cdr (car e))))
  (defun caddar (e) (car (cdr (cdr (car e)))))
  (defun caddr  (e) (car (cdr (cdr e))))
  (defun cadr   (e) (car (cdr e)))
  (defun cdar   (e) (cdr (car e)))

  (defun null.  (x) (eq x '()))
  (defun and.   (x y)   (cond (x (cond (y 't) ('t '()))) ('t '())))
  (defun not.   (x)     (cond (x '()) ('t 't)))
  (defun append. (x y)  (cond ((null. x) y) ('t (cons (car x) (append. (cdr x) y)))))
  (defun pair.  (x y)   
    (cond ((and. (null. x) (null. y)) '())
          ((and. (not. (atom x)) (not. (atom y)))
          (cons (list (car x) (car y))
          (pair. (cdr x) (cdr y))))))
  (defun assoc. (x y) (cond ((eq (caar y) x) (cadar y)) ('t (assoc. x (cdr y)))))
  't
)