#!/bin/bash

# set -euxo

trap "echo Exited!; exit;" SIGINT SIGTERM

sources=$(cat sources.json | jq '[.[] | { id, url: ( .url + "/" ) }]')

work_dir="/mnt/data/sdmx"

for source in $(echo "${sources}" | jq -r '.[] | @base64'); do
    _jq() {
        echo ${source} | base64 --decode | jq -r ${1}
    }

    id=$(_jq '.id')

    out_dir=$work_dir/$id
    mkdir -p $out_dir/

    base=$(_jq '.url')

    echo "$id DSDs"
    flows=$(cat $out_dir/Dataflows.json | jq '.Structure.Structures.Dataflows.Dataflow | .[0:2]')

    for flow in $(echo "${flows}" | jq -r '.[] | @base64'); do
        _jq() {
            echo ${flow} | base64 --decode | jq -r ${1}
        }

        id=$(_jq .[\"-id\"])
        structure=$(_jq '.Structure.Ref')
        # echo $structure
        aid=$(echo $structure | jq .[\"-agencyID\"])
        did=$(echo $structure | jq .[\"-id\"])
        v=$(echo $structure | jq .[\"-version\"])
        url="${base}datastructure/$aid/$did/$v"
        echo "Dataflow $id, fething datastructure from $url"

    done
    # .[0:10]
    # .Structure.Ref.-id

    # url="$(_jq '.url')dataflow/all/all/"
    # echo "Fetching from source $id using URL: $url"
    # http GET "$url" >$out_dir/Dataflows.xml
done
