import glob from 'glob';
import fs from 'fs';
import {parse} from "path";
import {transformDataStructure} from "./transform.mjs";

const work_dir = '/mnt/data/sdmx';

const context = JSON.parse(fs.readFileSync('./context.jsonld', 'utf-8'));

function transform_dsds() {
  glob(work_dir + '/**/DataStructures/*.json', function (err, files) {
    if (err) {
      console.error(err);
    } else {
      for (const file of files) {
        console.log(`Transforming file: ${file}`);
        const text = fs.readFileSync(file, 'utf-8');
        const json = JSON.parse(text);

        if (!json.agencyID) {
          console.error(`WARN: ${file} has no agencyID`);
          continue;
        }

        const transformed = transformDataStructure(json, json.agencyID);

        const out = {
          '@context': context['@context'],
          '@graph': transformed,
        };

        const p = parse(file)
        const outFile = p.dir + "/" + p.name + ".jsonld"

        fs.writeFileSync(outFile, JSON.stringify(out, undefined, 2));
      }
    }
  });
}

transform_dsds()