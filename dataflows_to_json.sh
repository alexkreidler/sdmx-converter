#!/bin/bash

trap "echo Exited!; exit;" SIGINT SIGTERM

sources=$(cat sources.json | jq '[.[] | { id, url: ( .url + "/" ) }]')

work_dir="/mnt/data/sdmx"

shopt -s globstar

for file in $work_dir/**/Dataflows.xml; do
    echo "Converting $file"
    cat $file | dasel -r xml -w json >${file%.xml}.json
done
