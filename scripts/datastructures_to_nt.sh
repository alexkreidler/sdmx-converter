#!/bin/bash

trap "echo Exited!; exit;" SIGINT SIGTERM

work_dir="/mnt/data/sdmx"

shopt -s globstar

for file in $work_dir/**/DataStructures/*.jsonld; do
    echo "Converting $file"
    rdf-converter convert $file "${file%.jsonld}.nt"
done
