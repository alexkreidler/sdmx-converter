
# SDMX Scraper

A bunch of scripts and programs to download, scrape and convert SDMX XML into RDF and CSV.

The following are some interesting things I found or issues I encountered during the project.

## Cross-organization dataflows
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

## Metadata-only/unofficial APIs

Example: IMF

The IMF [documentation](https://datahelp.imf.org/knowledgebase/articles/667678-using-sdmx-2-1-web-service) indicates that developers should use a web service that mimics the OECD, and is also nonstandard.

However, the IMF also runs a `sdmxcentral.imf.org` instance called IMF SDMX Central, which appears to be based on software called Fusion Registry by Metadata Technology.

This exposes a standard SDMX endpoint: `https://sdmxcentral.imf.org/ws/public/sdmxapi/rest`, but it only supports metadata queries.

This is unfortunate. It seems that in the web interface, the user needs to login with IMF credentials to view the data.

## Very large data responses

The `BKN` dataflow from the ECB, for example, is 33MB on disk. It is 1,160,602 lines long.

Using HTTPie, that thread went to 100% CPU usage, and took a long time, so I interrupted it. Using curl, it took about 3 seconds pulling 9.8MB/s at its highest.

This shouldn't be an issue for downloading, and I think even parsing in Python would be fine (although we may need to investigate other langs, like Go, which seems to have good XML support unlike Rust) to CSVs.

The issue is if many endpoint put restrictions on the data because it is too big.

`WB_WITS` did this with a response: `413 Client Error: Request Entity Too Large for url: http://wits.worldbank.org/API/V1/SDMX/V21/rest/data/TRADESTATS/`

We need to survey the endpoints to determine if this will be an issue.

## Queries from interfaces

UNData:

`https://data.un.org/ws/rest/data/UIS,DF_UNData_UIS,1.1/all/ALL/?detail=full&dimensionAtObservation=TIME_PERIOD`

Other interfaces: `https://data.un.org/SDMXBrowser/download/excel/tabular/csv`