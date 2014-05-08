
SRC= $(wildcard index.js lib/*.js)
tests ?= *
BINS= node_modules/.bin
C= $(BINS)/component
TEST= http://localhost:4202
PHANTOM= $(BINS)/mocha-phantomjs \
	--setting local-to-remote-url-access=true \
	--setting web-security=false


build: node_modules components $(SRC)
	@$(C) build --dev

components: component.json
	@$(C) install --dev

kill:
	-@test -e test/pid.txt \
		&& kill `cat test/pid.txt` \
		&& rm -f test/pid.txt

node_modules: package.json
	@npm install

server: build kill
	@tests=$(tests) node test/server &
	@sleep 1

test: build server test-node
	@$(PHANTOM) $(TEST)

test-node-vagrant:
	vagrant up
	vagrant ssh -c "cd /vagrant && make test"
	vagrant halt

test-node: node_modules
	@node_modules/.bin/mocha -R spec test/node.js

test-browser: build server
	@open $(TEST)

test-coverage: build server
	@open $(TEST)/coverage

clean:
	rm -rf components build

.PHONY: clean server test test-browser
.PHONY: test-sauce test-coverage
