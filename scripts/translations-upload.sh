#!/bin/bash

if [ "$ONESKY_API_SECRET" == "" ] || [ "$ONESKY_API_KEY" == "" ]; then
  echo "ONESKY_API_SECRET and ONESKY_API_KEY must be exported for this command to work."
  exit 1
fi

PROJECT_ID=$1
LOCALE=$2
FILENAME=$3

if [ "$PROJECT_ID" == "" ] || [ "$LOCALE" == "" ] || [ "$FILENAME" == "" ]; then
	echo "Usage: $0 <project id> <locale> <source filename> <destination filename>"
	exit 2
fi

TIMESTAMP=$(date +"%s")
DEV_HASH=$(echo -n "${TIMESTAMP}${ONESKY_API_SECRET}" | md5sum | cut -d" " -f1)

URL="https://platform.api.onesky.io/1/projects/$PROJECT_ID/files?api_key=${ONESKY_API_KEY}&timestamp=$TIMESTAMP&dev_hash=$DEV_HASH"

curl -s \
  -F "file=@\"$FILENAME\"" \
  -F "locale=en" \
  -F "file_format=HIERARCHICAL_JSON" \
  "$URL"
