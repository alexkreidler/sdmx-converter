import glob from "glob";
import fs from "fs";
const work_dir = "/mnt/data/sdmx";

function handleFile(name, contents) {
  let data = JSON.parse(contents);
  return data;
}

// function handleObject(obj) {

// }

let structures = [];

glob(work_dir + "/**/DataStructures/*.json", function (err, files) {
  if (err) {
    console.error(err);
  } else {
    for (const file of files) {
      let data = fs.readFileSync(file, "utf-8");

      structures.push(handleFile(file, data.toString()));
    }
    console.log(JSON.stringify(structures));
  }
});
