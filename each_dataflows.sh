#!/bin/bash

trap "echo Exited!; exit;" SIGINT SIGTERM

sources=$(cat sources.json | jq '[.[] | { id, url: ( .url + "/" ) }]')

work_dir="/mnt/data/sdmx"

# set -euxo

mkdir -p $work_dir/errors
mkdir -p $work_dir/timings

for source in $(echo "${sources}" | jq -r '.[] | @base64'); do
    _jq() {
        echo ${source} | base64 --decode | jq -r ${1}
    }

    id=$(_jq '.id')

    out_dir=$work_dir/$id
    mkdir -p $out_dir/

    base=$(_jq '.url')

    echo "$id DSDs"
    # | .[2:4]
    flows=$(cat $out_dir/Dataflows.json | jq '.Structure.Structures.Dataflows.Dataflow')

    for flow in $(echo "${flows}" | jq -r '.[] | @base64'); do
        _jqi() {
            echo ${flow} | base64 --decode | jq -r ${1}
        }

        mkdir -p $out_dir/DataStructures

        id=$(_jqi '."-id"')
        # echo $structure
        # $(_jq '.Structure.Ref')
        r=$(_jqi '.Structure.Ref' | jq '[."-agencyID",."-id",."-version"]')
        u=$(echo $r | jq -r 'join("/")')
        f=$(echo $r | jq -r 'join("_")')
        # did=$(_jqi '.Structure.Ref.[\"-id\"]')
        # v=$(_jqi '.Structure.Ref.[\"-version\"]')
        # echo $r
        url="${base}datastructure/$u"
        echo "Dataflow $id, Datastructure $f from $url"

        dl() {
            http GET "$url" >$out_dir/DataStructures/$f.xml
        }

        name="${id}_${f}"

        { time dl 2> $work_dir/errors/$name.log ; } 2> $work_dir/timings/$name.log

    done
    # .[0:10]
    # .Structure.Ref.-id

    # url="$(_jq '.url')dataflow/all/all/"
    # echo "Fetching from source $id using URL: $url"
    # http GET "$url" >$out_dir/Dataflows.xml
done
