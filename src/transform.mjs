import jsont from 'json-transforms';

const BASE_URL = 'https://loqu.dev/';

const mappings = {
  Concept: { iri: 'Concept', type: 'skos:Concept' },
  Codelist: { iri: 'Concept', type: 'qb:HierarchicalCodeList' },
};

function getType(obj) {
  return mappings[obj.class].type;
}

// The following two functions require an agencyID on the input data
function createIRI(obj) {
  return BASE_URL + [obj.agencyID, mappings[obj.class].iri, obj.id].join('/');
}

function createTypedIRI(obj, type) {
  return BASE_URL + [obj.agencyID, type, obj.id].join('/');
}

// only requires id on obj
function createTypedIRI_NA(obj, type, agencyID) {
  return BASE_URL + [agencyID, type, obj.id].join('/');
}

export function transformDataStructure(input, agency) {
  const stages = [
    // {"@value": d.match.Name["#text"], "@lang": d.match.Name.lang}
    jsont.pathRule('.DataStructureComponents', (d) =>
      Object.assign(d.context, {
        DataStructureComponents: undefined,
        components: {
          attributes: d.match.AttributeList ? d.match.AttributeList.Attribute : undefined,
          dimensions: [].concat(
            d.match.DimensionList.Dimension,
            d.match.DimensionList.TimeDimension
          ),
          measures: [d.match.MeasureList.PrimaryMeasure],
        },
      })
    ),
    jsont.pathRule('.Name{."#text" && .lang}', (d) =>
      Object.assign(d.context, {
        Name: undefined,
        name: { '@value': d.match['#text'], '@language': d.match.lang },
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

    // For the following dimensions, attributes, and measures, we assume that the agency of the linked item
    // is the same as the DataStructureDefinition agency. Probably need to review to make sure this is correct.
    [
      jsont.pathRule('.dimensions{.id}', (d) =>
        Object.assign(d.context, { dimensions: d.runner() })
      ),
      jsont.pathRule('.{.id}', (d) =>
        Object.assign(d.match, {
          '@id': createTypedIRI_NA(d.match, 'Dimension', agency),
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
          '@id': createTypedIRI_NA(d.match, 'Attribute', agency),
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
          '@id': createTypedIRI_NA(d.match, 'Measure', agency),
          id: undefined,
        })
      ),
    ],
  ];

  let transformed = input;
  for (let rules of stages.map((s) => {
    let b = s;
    if (!Array.isArray(s)) {
      b = [s];
    }
    return [...b, jsont.identity];
  })) {
    transformed = jsont.transform(transformed, rules);
  }
  return transformed;
}
