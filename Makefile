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



