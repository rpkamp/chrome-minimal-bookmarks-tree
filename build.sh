#!/bin/bash

if [ -f mbt.zip ]; then
	rm -f mbt.zip
fi

zip -r mbt.zip css/ icons/ js/ _locales/ *.html *.json
