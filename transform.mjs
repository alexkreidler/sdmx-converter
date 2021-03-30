import fs from 'fs';
import jsont from 'json-transforms';

const file = './final-2.json';

const BASE_URL = 'https://loqu.dev/';

const data = fs.readFileSync(file, 'utf-8');

const json = JSON.parse(data);

function createTypedIRI(obj, type) {
  return BASE_URL + [obj.agencyID, type, obj.id].join('/');
}

// only requires id on obj
function createTypedIRI_NA(obj, type, agencyID) {
  return BASE_URL + [agencyID, type, obj.id].join('/');
}

const mappings = {
  Concept: { iri: 'Concept', type: 'skos:Concept' },
  Codelist: { iri: 'Concept', type: 'qb:HierarchicalCodeList' },
};

function getType(obj) {
  return mappings[obj.class].type;
}

function createIRI(obj) {
  return BASE_URL + [obj.agencyID, mappings[obj.class].iri, obj.id].join('/');
}

const stages = [
  // {"@value": d.match.Name["#text"], "@lang": d.match.Name.lang}
  jsont.pathRule('.DataStructureComponents', (d) =>
    Object.assign(d.context, {
      DataStructureComponents: undefined,
      components: {
        attributes: d.match.AttributeList.Attribute,
        dimensions: [
          ...d.match.DimensionList.Dimension,
          d.match.DimensionList.TimeDimension,
        ],
        measures: [d.match.MeasureList.PrimaryMeasure],
      },
    })
  ),
  jsont.pathRule('.Name{."#text" && .lang}', (d) =>
    Object.assign(d.context, {
      Name: undefined,
      name: { '@value': d.match['#text'], '@lang': d.match.lang },
    })
  ),
  jsont.pathRule('.AttributeRelationship{.None==""}', (d) =>
    Object.assign(d.context, { AttributeRelationship: undefined })
  ),
  // we just obliterate Ref. The JSON-LD context will pick up the ID hopefully
  // TODO: we may need to serialize this into an IRI. E.g. /{Agency}/{class}/{id} like /ABS/Concept/OBS_COMMENT
  jsont.pathRule('.Ref', (d) => d.match),
  // Select DSDs
  jsont.pathRule('.{.isFinal && .version}', (d) =>
    Object.assign(d.context, {
      '@type': 'qb:DataStructureDefinition',
      '@id': createTypedIRI(d.context, 'DataStructure'),
      id: undefined,
    })
  ),
  jsont.pathRule('.{.class && .agencyID && .id}', (d) =>
    Object.assign(d.context, {
      '@type': getType(d.match),
      '@id': createIRI(d.match),
      id: undefined,
      'skos:notation': d.match.id,
    })
  ),
  jsont.pathRule('.components', (d) =>
    Object.assign(d.context, { ...d.match, components: undefined })
  ),
  jsont.pathRule('.LocalRepresentation{.Enumeration}', (d) =>
    Object.assign(d.context, {
      'qb:codeList': d.match.Enumeration,
      LocalRepresentation: undefined,
    })
  ),

  [
    jsont.pathRule('.dimensions{.id}', (d) =>
      Object.assign(d.context, { dimensions: d.runner() })
    ),
    jsont.pathRule('.{.id}', (d) =>
      Object.assign(d.match, {
        '@id': createTypedIRI_NA(d.match, 'Dimension', 'NOAG'),
        id: undefined,
      })
    ),
  ],

  [
    jsont.pathRule('.attributes{.id}', (d) =>
      Object.assign(d.context, { attributes: d.runner() })
    ),
    jsont.pathRule('.{.id}', (d) =>
      Object.assign(d.match, {
        '@id': createTypedIRI_NA(d.match, 'Attribute', 'NOAG'),
        id: undefined,
      })
    ),
  ],

  [
    jsont.pathRule('.measures{.id}', (d) =>
      Object.assign(d.context, { measures: d.runner() })
    ),
    jsont.pathRule('.{.id}', (d) =>
      Object.assign(d.match, {
        '@id': createTypedIRI_NA(d.match, 'Measure', 'NOAG'),
        id: undefined,
      })
    ),
  ],
];

let transformed = json;
for (let rules of stages.map((s) => {
  let b = s;
  if (!Array.isArray(s)) {
    b = [s];
  }
  return [...b, jsont.identity];
})) {
  transformed = jsont.transform(transformed, rules);
}

const transformFile = './ts.json';
const withContext = './withContext.json';
fs.writeFileSync(transformFile, JSON.stringify(transformed, undefined, 2));

let context = JSON.parse(fs.readFileSync('./context2.jsonld', 'utf-8'));

let out = {
  '@context': context["@context"],
  '@graph': transformed.slice(1, 4),
};

fs.writeFileSync(withContext, JSON.stringify(out, undefined, 2));
