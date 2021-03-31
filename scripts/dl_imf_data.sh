#!/bin/bash

trap "echo Exited!; exit;" SIGINT SIGTERM

work_dir="/mnt/data/sdmx"

shopt -s globstar

mkdir -p $work_dir/IMF/Data

flows=$(cat $work_dir/IMF/Dataflows.json | jq -r '.Structure.Structures.Dataflows.Dataflow[]."-id"')

for flow in $flows; do
    echo "Downloading $flow"

    url="https://sdmxcentral.imf.org/ws/public/sdmxapi/rest/data/$flow/"
    http GET "$url" >$work_dir/IMF/Data/$flow.xml
done
