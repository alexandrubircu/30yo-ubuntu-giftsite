YARN = yarn
RM = rm -rf

.PHONY: install
install:
	$(YARN) install

.PHONY: start
start:
	$(YARN) start
