
#
# args
#

COMPONENT = $(BINS)/component
TEST = http://localhost:4202
BINS = node_modules/.bin
SRC = $(wildcard index.js lib/*.js)
PHANTOM = $(BINS)/mocha-phantomjs $(IS_REMOTE) $(IS_SECURE)
IS_REMOTE = --setting local-to-remote-url-access=true
IS_SECURE = --setting web-security=false
PID = test/pid.txt
tests ?= *

#
# build
#

build: build-node build-browser $(SRC)

#
# build node
#

build-node: install-node

#
# build browser
#

build-browser:
	@$(COMPONENT) build --dev

#
# clean
#

clean: clean-node clean-browser

#
# clean node
#

clean-node:
	@-rm -rf node_modules
	@npm cache clean

#
# clean browser
#

clean-browser:
	@-rm -rf components build

#
# install
#

install: install-node install-browser

#
# install node
#

install-node: package.json
	@npm install

#
# install browser
#

install-browser: component.json
	@$(COMPONENT) install --dev

#
# kill
#

kill:
	@-test -e $(PID) \
		&& kill `cat $(PID)` \
		&& rm -f $(PID) \
		||:

#
# test
#

test: build test-server test-node
	@$(PHANTOM) $(TEST)

#
# test node
#

test-node: build-node
	@node_modules/.bin/mocha -R spec test/node.js

#
# test browser
#

test-browser: build test-server
	@open $(TEST)

#
# test coverage
#

test-coverage: build test-server
	@open $(TEST)/coverage

#
# test server
#

test-server: build kill
	@tests=$(tests) node test/server &
	@sleep 1

#
# meta targets
#

.PHONY: clean
.PHONY: kill
.PHONY: test
.PHONY: test-browser
.PHONY: test-server