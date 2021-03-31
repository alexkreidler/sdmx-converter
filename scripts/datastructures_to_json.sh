#!/bin/bash

set -o pipefail

trap "echo Exited!; exit;" SIGINT SIGTERM

sources=$(cat sources.json | jq '[.[] | { id, url: ( .url + "/" ) }]')

work_dir="/mnt/data/sdmx"
tmp_dir="$work_dir/tmp"
mkdir -p $tmp_dir

shopt -s globstar

for file in $work_dir/**/DataStructures/*.xml; do
    echo "Converting $file"
    outfile="${file%.xml}.json"
    
    uuid=$(uuidgen)
    tmpfile="$tmp_dir/$uuid"

    trap "rm -f '$tmpfile'; exit 1" 0 1 2 3 13 15

    if cat $file | dasel -r xml -w json -s ".Structure.Structures.DataStructures.DataStructure" | sed -e 's/-\([^"]*\)/\1/g' > "$tmpfile"
    then mv "$tmpfile" "$outfile"
    else rm "$tmpfile"
    fi

    trap 0


    # dasel -p json -s ".Structure.Structures.DataStructures.DataStructure" | sed -e 's/-\([^"]*\)/\1"/g'
done

