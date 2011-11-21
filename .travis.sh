#!/bin/sh

curl -# https://raw.github.com/firejs/travis-ci-scripts/master/main.sh | bash

travis_build_name="fire-i18n"
. .travis_temp/runner.sh
. .travis_temp/$travis_build_name.sh
travis_runner
