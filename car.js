import { TransformStream } from "@web-std/stream";
import * as UnixFS from "@ipld/unixfs";
import { CarWriter } from "@ipld/car";
import fs from "fs";
import { Readable } from "stream";

const pipe = async (source, writer) => {
  for await (const item of source) {
    writer.write(item);
  }
  return await writer.close();
};

const iterate = async function* (stream) {
  const reader = stream.getReader();
  while (true) {
    const next = await reader.read();
    if (next.done) {
      return;
    }

    yield next.value;
  }
};

const encodeCar = (name, roots, blocks) => {
  const { writer, out } = CarWriter.create(roots);

  Readable.from(out).pipe(fs.createWriteStream(`${name}.car`));

  pipe(iterate(blocks), {
    write: (block) =>
      writer.put({
        cid: block.cid,
        bytes: block.bytes,
      }),
    close: () => writer.close(),
  });
};

export const writeCarFile = async (name, bytes) => {
  const { readable, writable } = new TransformStream();
  const writer = UnixFS.createWriter({ writable });

  const file = UnixFS.createFileWriter(writer);
  await file.write(bytes);
  const link = await file.close();

  writer.close();

  encodeCar(name, [link.cid], readable);

  return link;
};

export const writeCarDir = async (name, files) => {
  const { readable, writable } = new TransformStream();
  const writer = UnixFS.createWriter({ writable });

  const dir = UnixFS.createDirectoryWriter(writer);
  for (const file of files) {
    dir.set(file.name, file.link);
  }

  const link = await dir.close();

  writer.close();

  encodeCar(name, [link.cid], readable);

  return link;
};
