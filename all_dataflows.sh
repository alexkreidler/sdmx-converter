#!/bin/bash

trap "echo Exited!; exit;" SIGINT SIGTERM

sources=$(cat sources.json | jq '[.[] | { id, url: ( .url + "/" ) }]')

work_dir="/mnt/data/sdmx"

for row in $(echo "${sources}" | jq -r '.[] | @base64'); do
    _jq() {
        echo ${row} | base64 --decode | jq -r ${1}
    }

    id=$(_jq '.id')

    out_dir=$work_dir/$id
    mkdir -p $out_dir/

    url="$(_jq '.url')dataflow/all/all/"
    echo "Fetching from source $id using URL: $url"
    http GET "$url" >$out_dir/Dataflows.xml
    cat $out_dir/Dataflows.xml | dasel -r xml -w json >$out_dir/Dataflows.json
done
