#!/bin/bash

if [ -f mbt.zip ]; then
	echo "mbt.zip found. deleting."
	rm -f mbt.zip
fi

(cd src && zip -r ../mbt.zip *)
