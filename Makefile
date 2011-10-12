all: run-tests

install-dev-dependencies:
	npm install priest
	npm install vows

remove-dev-dependencies:
	npm uninstall priest
	npm uninstall vows

run-tests:
	node_modules/.bin/vows test/test.js

run-tests-spec:
	node_modules/.bin/vows test/test.js --spe

update-priest:
	rm -rf node_modules/priest
	git clone git://github.com/firebaseco/priest.git node_modules/priest
	echo "Use 'make update-priest' to update priest with latest git sources" > "node_modules/priest/README_BEFORE_CHANGING.txt" 