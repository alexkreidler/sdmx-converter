Example: IMF

Getting all `Dataflow`s from IMF returns some from ESTAT.

Example:

```json
{
  "-agencyID": "ESTAT",
  "-id": "BPM6_BOP_M",
  "-isExternalReference": "false",
  "-isFinal": "false",
  "-structureURL": "https://registry.sdmx.org/ws/public/sdmxapi/rest/dataflow/ESTAT/BPM6_BOP_M/1.1",
  "-urn": "urn:sdmx:org.sdmx.infomodel.datastructure.Dataflow=ESTAT:BPM6_BOP_M(1.1)",
  "-version": "1.1",
  "Name": {
    "#text": "BPM6_BOP_M dataflow",
    "-lang": "en"
  },
  "Structure": {
    "Ref": {
      "-agencyID": "IMF",
      "-class": "DataStructure",
      "-id": "BOP",
      "-package": "datastructure",
      "-version": "1.14"
    }
  }
}
```

This is referencing an IMF datastructure but its an externally hosted dataflow.
