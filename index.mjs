import glob from "glob";
import fs from "fs";
const work_dir = "/mnt/data/sdmx";

function handleFile(name, contents) {
  let data = JSON.parse(contents);
  // handleObject(data);

  return data;
}

// function renameKey(obj, oldKey, newKey) {
//   console.error("rename", oldKey, newKey)
//   obj[newKey] = obj[oldKey];
//   delete obj[oldKey];
// }

// function handleObject(obj) {
//   let ks = Object.keys(obj).map((v) => ({
//     key: v,
//     bad: v.startsWith("-"),
//   }));
//   let badKeys = ks.filter((v) => v.bad)
//   console.error(badKeys)
//   if (badKeys.length > 0) {
//     badKeys.forEach((v) => renameKey(obj, v.key, v.key.substr(1)));
//   }
//   console.error("OBJ", obj)
//   for (const nk in obj) {
//     if (Object.hasOwnProperty.call(obj, nk)) {
//       const element = obj[nk];
//       if (typeof element == "object") {
//         handleObject(element);
//       }
//     }
//   }
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
