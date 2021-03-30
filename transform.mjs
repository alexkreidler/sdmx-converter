import fs from 'fs';
import jsont from 'json-transforms';

const file = './final-2.json';

const data = fs.readFileSync(file, 'utf-8');

const json = JSON.parse(data);

const stages = [
  // {"@value": d.match.Name["#text"], "@lang": d.match.Name.lang}
  jsont.pathRule('.DataStructureComponents', (d) =>
    Object.assign(d.context, {
      DataStructureComponents: undefined,
      Components: {
        Attributes: d.match.AttributeList.Attribute,
        Dimensions: [
          d.match.DimensionList.Dimension,
          d.match.DimensionList.TimeDimension,
        ],
        Measures: [d.match.MeasureList.PrimaryMeasure],
      },
    })
  ),
  jsont.pathRule('.Name{."#text" && .lang}', (d) => Object.assign(d.context, {Name: {"@value": d.match["#text"], "@lang": d.match.lang}})),
  jsont.pathRule('.AttributeRelationship{.None==""}', (d) => Object.assign(d.context, {AttributeRelationship: undefined})),
  // we just obliterate Ref. The JSON-LD context will pick up the ID hopefully
  // TODO: we may need to serialize this into an IRI. E.g. /{Agency}/{class}/{id} like /ABS/Concept/OBS_COMMENT
  jsont.pathRule('.Ref', (d) => d.match)
];

let transformed = json
for (let rules of stages.map((s) => [s, jsont.identity])) {
  transformed = jsont.transform(transformed, rules);
}


console.log(JSON.stringify(transformed));
