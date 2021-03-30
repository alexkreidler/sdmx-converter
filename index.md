Steps

```
node ./index.mjs | jq > structures-2.json
cat structures-2.json | jq "[.[].Structure.Structures.DataStructures.DataStructure]" > fin-2.json

```
