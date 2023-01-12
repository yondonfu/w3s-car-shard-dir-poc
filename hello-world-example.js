import { writeCarFile, writeCarDir } from "./car.js";

const main = async () => {
  const link1 = await writeCarFile("hello", new TextEncoder().encode("hello"));
  console.log(link1);

  const link2 = await writeCarFile("world", new TextEncoder().encode("world"));
  console.log(link2);

  const files = [
    {
      name: "hello.md",
      link: link1,
    },
    {
      name: "world.md",
      link: link2,
    },
  ];

  const rootLink = await writeCarDir("this-is-a-dir", files);
  console.log(rootLink);
};

main();
