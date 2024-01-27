TSX = pnpm ts-node
MAKERS = $(shell cd scripts; echo */1-*.ts | xargs dirname | sort -u)
BROKEN = mint prodigy
STAGE = ''

all: $(filter-out $(BROKEN),$(MAKERS))
	$(MAKE) generate

.PHONY: $(MAKERS)
$(MAKERS):
	@for x in scripts/$@/[0-9]*$(STAGE)*.ts; do (set -x; $(TSX) $$x) || exit; done

.PHONY: generate
generate:
	$(TSX) scripts/generate.ts
