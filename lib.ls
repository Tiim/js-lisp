(defun cadr   (e) (car (cdr e)))
(defun caddr  (e) (car (cdr (cdr e))))
(defun cdar   (e) (cdr (car e)))
(defun null.  (x) (eq x '()))

(defun and.   (x y) (cond (x (cond (y 't) ('t '()))) ('t '())))
