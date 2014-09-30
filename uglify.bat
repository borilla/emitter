@echo off
set input=development\emitter.js
set output=production\emitter.min.js
uglifyjs %input% -o %output% -c -m --screw-ie8
