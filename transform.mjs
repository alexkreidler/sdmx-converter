import fs from 'fs';
import jsont from 'json-transforms';

const file = './final-2.json';

const BASE_URL = "https://loqu.dev/"

const data = fs.readFileSync(file, 'utf-8');

const json = JSON.parse(data);

function createDataStructureIRI(obj) {
  return BASE_URL + [obj.agencyID, "DataStructure", obj.id].join("/")
}

const mappings = {
  "Concept": {"iri": "Concept", "type": "skos:Concept"},
  "Codelist": {"iri": "Concept", "type": "qb:HierarchicalCodeList"}
  }

function getType(obj) {
  return mappings[obj.class].type
}

function createIRI(obj) {
  return BASE_URL + [obj.agencyID, mappings[obj.class].iri, obj.id].join("/")
}

const stages = [
  // {"@value": d.match.Name["#text"], "@lang": d.match.Name.lang}
  jsont.pathRule('.DataStructureComponents', (d) =>
    Object.assign(d.context, {
      DataStructureComponents: undefined,
      components: {
        attributes: d.match.AttributeList.Attribute,
        dimensions: [
          d.match.DimensionList.Dimension,
          d.match.DimensionList.TimeDimension,
        ],
        measures: [d.match.MeasureList.PrimaryMeasure],
      },
    })
  ),
  jsont.pathRule('.Name{."#text" && .lang}', (d) => Object.assign(d.context, {Name: undefined, name: {"@value": d.match["#text"], "@lang": d.match.lang}})),
  jsont.pathRule('.AttributeRelationship{.None==""}', (d) => Object.assign(d.context, {AttributeRelationship: undefined})),
  // we just obliterate Ref. The JSON-LD context will pick up the ID hopefully
  // TODO: we may need to serialize this into an IRI. E.g. /{Agency}/{class}/{id} like /ABS/Concept/OBS_COMMENT
  jsont.pathRule('.Ref', (d) => d.match),
  // Select DSDs
  jsont.pathRule('.{.isFinal && .version}', (d) => Object.assign(d.context, {"@type": "qb:DataStructureDefinition", "@id": createDataStructureIRI(d.context), id: undefined})),
  jsont.pathRule('.{.class && .agencyID && .id}', (d) => Object.assign(d.context, {"@type": getType(d.match), "@id": createIRI(d.match), id: undefined})),
  // jsont.pathRule('.{.id}', d=> d)

//   agencyID
// class
// id
];

let transformed = json
for (let rules of stages.map((s) => [s, jsont.identity])) {
  transformed = jsont.transform(transformed, rules);
}


console.log(JSON.stringify(transformed));
