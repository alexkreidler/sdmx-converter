#!/bin/bash

trap "echo Exited!; exit;" SIGINT SIGTERM

sources=$(cat sources.json | jq '[.[] | { id, url: ( .url + "/" ) }]')

work_dir="/mnt/data/sdmx"

# set -euxo

mkdir -p $work_dir/errors
mkdir -p $work_dir/timings

mkdir -p $work_dir/errors/Data
mkdir -p $work_dir/timings/Data

for source in $(echo "${sources}" | jq -r '.[] | @base64'); do
    _jq() {
        echo ${source} | base64 --decode | jq -r ${1}
    }

    id=$(_jq '.id')

    out_dir=$work_dir/$id
    mkdir -p $out_dir/

    base=$(_jq '.url')

    echo "$id Datasets"
    # | .[2:4]
    flows=$(cat $out_dir/Dataflows.json | jq '.Structure.Structures.Dataflows.Dataflow')

    for flow in $(echo "${flows}" | jq -r '.[] | @base64'); do
        _jqi() {
            echo ${flow} | base64 --decode | jq -r ${1}
        }

        mkdir -p $out_dir/Data

        id=$(_jqi '."-id"')
        
        url="${base}data/$id"
        echo "Dataflow $id, Data from $url"

        dl() {
            wget -O $out_dir/DataStructures/$f.xml "$url"
        }

        name="${id}"

        { time dl 2> $work_dir/errors/Data/$name.log ; } 2> $work_dir/timings/Data/$name.log

    done
    
done
