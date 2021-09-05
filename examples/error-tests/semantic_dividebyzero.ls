	(defun dec (x) (cond ((eq x 0) (/ 1 x)) ('t (dec (- x 1)))))
	(dec 5) 
