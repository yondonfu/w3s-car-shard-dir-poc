import { writeCarFile, writeCarDir } from "./car.js";
import fs from "fs";

const main = async () => {
  const file1 = fs.readFileSync("0.ts");
  const link1 = await writeCarFile("0", file1);
  console.log(link1);

  const file2 = fs.readFileSync("1.ts");
  const link2 = await writeCarFile("1", file2);
  console.log(link2);

  const file3 = fs.readFileSync("index.m3u8");
  const link3 = await writeCarFile("index", file3);
  console.log(link3);

  const files = [
    {
      name: "0.ts",
      link: link1,
    },
    {
      name: "1.ts",
      link: link2,
    },
    {
      name: "index.m3u8",
      link: link3,
    },
  ];

  const rootLink = await writeCarDir("playlist-dir", files);
  console.log(rootLink);
};

main();
