all: run-tests

run-tests:
	node_modules/.bin/vows test/test.js

run-tests-spec:
	node_modules/.bin/vows test/test.js --spe 

travis:
	sh .travis.sh
