import glob from "glob";
import fs from "fs";
const work_dir = "/mnt/data/sdmx";

function handleFile(name, contents) {
  let data = JSON.parse(contents);
  // handleObject(data);

  return data;
}

function compile_dsds() {
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
}

console.error("WARNING: This script will read all of the DataStructureDefinitions into memory and compile/concatenate them into one file. ");