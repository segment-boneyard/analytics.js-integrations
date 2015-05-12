#
# Binaries.
#

NPM_BINS_DIR = ./node_modules/.bin
DUO = $(NPM_BINS_DIR)/duo
DUOT = $(NPM_BINS_DIR)/duo-test
JSCS = $(NPM_BINS_DIR)/jscs
MOCHA = $(NPM_BINS_DIR)/mocha

#
# Files.
#

SRCS_DIR = lib
SRCS = index.js $(wildcard $(SRCS_DIR)/*/index.js)
TESTS_DIR = test
TESTS = $(wildcard $(SRCS_DIR)/*/test.js)

#
# Task config.
#

# TODO: Can't we replace this with GREP?
integration ?= *
browser ?= ie10
INTEGRATION ?= $(integration)
BROWSER ?= $(browser)

#
# Chore tasks.
#

# Install node dependencies.
node_modules: package.json $(wildcard node_modules/*/package.json)
	@npm install

# Remove temporary files and build artifacts.
clean:
	@rm -rf build.js integrations.js test/tests.js
.PHONY: clean

# Remove temporary files, build artifacts, and vendor dependencies.
distclean: clean
	@rm -rf components node_modules
.PHONY: distclean

#
# Build tasks.
#

# Build all integrations, tests, and dependencies together for testing.
build.js: node_modules component.json test/tests.js integrations.js $(SRCS)
	@$(DUO) --stdout --development test/index.js > $@

# Build a list of all current integrations and the path to their index.js.
integrations.js: node_modules $(SRCS)
	@node bin/integrations

# Build a list of all current integration tests and the path to their test.js.
test/tests.js: node_modules $(TESTS)
	@node bin/tests

#
# Test tasks.
#

# Lint JavaScript source.
lint:
	@$(JSCS) lib
.PHONY: lint

# Test locally in PhantomJS.
test: lint build.js test/tests.js
	@$(DUOT) phantomjs $(TESTS_DIR) args: \
		local-to-remote-url-access=true \
		web-security=false
.PHONY: test
.DEFAULT_GOAL = test

# Test locally in the browser.
test-browser: build.js test/tests.js
	@$(DUOT) browser chrome --commands "make build.js"
.PHONY: test-browser

# Test in Sauce Labs.
test-sauce: node_modules build.js test/tests.js
	@$(DUOT) saucelabs $(TESTS_DIR) \
		--name analytics.js-integrations \
		--browser $(BROWSER)
.PHONY: test-sauce
