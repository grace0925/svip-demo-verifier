#
#
#

.PHONY: start
demo-start: generate-keys
	@scripts/demo-start.sh

.PHONY: stop
demo-stop:
	@chmod +x scripts/demo-stop.sh
	@scripts/demo-stop.sh

.PHONY: debug
demo-debug: generate-keys
	@chmod +x scripts/demo-debug.sh
	@scripts/demo-debug.sh

.PHONY: generate-keys
generate-keys:
	@chmod +x scripts/generate-certs.sh
	@scripts/generate-certs.sh

.PHONY: generate-test-config
generate-test-config:
	@scripts/generate_test_config.sh

.PHONY: demo-local-setup
demo-local-setup: clean generate-test-config
	@scripts/demo_local_setup.sh

.PHONE: clean
clean:
	@rm -Rf ./images/consortium-configs/consortium/config
	@rm -Rf ./images/consortium-configs/stakeholder/config
