makers = $(shell cd scripts; echo */1-*.ts | xargs dirname | sort -u)

broken = mint prodigy

all: pdga $(filter-out $(broken),$(makers))

.PHONY: pdga
pdga:
	mkdir -p assets/pdga
	curl https://www.pdga.com/technical-standards/equipment-certification/discs/export > assets/pdga/discs.csv.new
	file assets/pdga/discs.csv.new | grep -q 'CSV text'
	dos2unix assets/pdga/discs.csv.new
	head -n1 assets/pdga/discs.csv.new > assets/pdga/discs.csv
	tail -n+2 assets/pdga/discs.csv.new | sort >> assets/pdga/discs.csv

.PHONY: $(makers)
$(makers):
	@for x in scripts/$@/[0-9]*.ts; do (set -x; pnpm tsx $$x) || break; done
