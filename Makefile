#
# Binaries.
#

DUO = node_modules/.bin/duo
DUOT = node_modules/.bin/duo-test
ESLINT = node_modules/.bin/eslint

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

BROWSER ?= chrome
INTEGRATION ?= *

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
	@$(DUO) --development test/index.js > $@
.DEFAULT_GOAL = build.js

# Build a list of all current integrations and the path to their index.js.
integrations.js: node_modules $(SRCS)
	@node bin/integrations

# Build a list of all current integration tests and the path to their test.js.
test/tests.js: node_modules $(TESTS)
	@node bin/tests
.PHONY: test/tests.js

#
# Test tasks.
#

# Lint JavaScript source.
lint: node_modules
	@$(ESLINT) $(SRCS) $(TESTS)
.PHONY: lint

# Test locally in PhantomJS.
test: node_modules lint build.js test/tests.js
	@$(DUOT) phantomjs $(TESTS_DIR) args: \
		--setting local-to-remote-url-access=true \
		--setting web-security=false \
		--path node_modules/.bin/phantomjs
.PHONY: test

# Test locally in the browser.
test-browser: node_modules lint build.js test/tests.js
	@$(DUOT) browser --commands "make build.js" $(TESTS_DIR)
.PHONY: test-browser

# Test in Sauce Labs. Note that you must set the SAUCE_USERNAME and
# SAUCE_ACCESS_KEY environment variables using your Sauce Labs credentials.
test-sauce: node_modules lint build.js test/tests.js
	@$(DUOT) saucelabs $(TESTS_DIR) \
		--name analytics.js-integrations \
		--browser $(BROWSER) \
		--user $(SAUCE_USERNAME) \
		--key $(SAUCE_ACCESS_KEY)
.PHONY: test-sauce
