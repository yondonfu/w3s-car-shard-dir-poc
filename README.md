# w3s-car-shard-dir-poc

This repo contains POC code that demonstrates how to:

- Use [js-unixfs](https://github.com/ipld/js-unixfs) and [js-car](https://github.com/ipld/js-car) to generate [CAR files](https://ipld.io/specs/transport/car/carv1/) for individual files and CAR files for directories that contain links (i.e. CIDs) to files without the actual blocks
- Use [w3cli](https://github.com/web3-storage/w3cli) to store CAR files with the `store/add` capability invocation and to add an upload for a root CID that links multiple CAR shards to form a full DAG with the `upload/add` capability invocation

The motivation for this POC is to explore the possibility of uploading individual files to web3.storage and then creating a directory for the files that is identified by root CID as an alternative to uploading an entire directory at once. The benefits of uploading individual files and then creating a directory later on include minimizing storage requirements for a service when copying a directory from a source storage location to web3.storage and when "iteratively" creating a directory in web3.storage as data is being computed.

The basic idea explored here (as suggested by @yusefnapora) is to:

- Create CAR files for each individual file
- Store the CAR files with `store/add` which will be treated as "CAR shards"
- Create a CAR file for a UnixFS directory that links to the CID of each individual file, but without the actual blocks for the CIDs
- Store the CAR file for the UnixFS directory with `store/add`
- Add an upload using `upload/add` to register the root CID of the CAR directory and to link with the CAR shards for the individual files

## Install

```
npm install
```

You will also need the following tools:

- [w3cli](https://github.com/web3-storage/w3cli)
- [ipfs-car](https://github.com/web3-storage/ipfs-car)
- [ffmpeg](https://ffmpeg.org/) (only required for the m3u8 playlist example)

## Hello World Example

First, we can generate the CAR shards.

```bash
node hello-world-example.js
```

The following CAR shards should be created:

```
hello.car
world.car
this-is-a-dir.car
```

- `hello.car` contains a file with the text "hello".
- `world.car` contains a file with the text "world".
- `this-is-a-dir.car` contains a directory with links (CIDs) to the above files without the actual blocks

Then, we can use `w3` to store the individual CAR shards and then link the CAR shards together into a single upload identified by the root CID of the directory:

```bash
w3 can store add hello.car
# ⠏ Storingbagbaieraryp54uvfvxrpedxmmoms36g2hfanxuimvzk3i4l54ndaylz67voa
# ⁂ Stored bagbaieraryp54uvfvxrpedxmmoms36g2hfanxuimvzk3i4l54ndaylz67voa
w3 can store add world.car
# ⠦ Storingbagbaierawb5xbb5dj2776hmvu7bwzkuor6ynbpkuiqdpqsvsnvaixga5thma
# ⁂ Stored bagbaierawb5xbb5dj2776hmvu7bwzkuor6ynbpkuiqdpqsvsnvaixga5thma
w3 can store add this-is-a-dir.car
# ⠼ Storingbagbaierahsxnqk22qbifvlcc7rzvksda4qz46dskxulj2btb65ovdb33mirq
# ⁂ Stored bagbaierahsxnqk22qbifvlcc7rzvksda4qz46dskxulj2btb65ovdb33mirq

ipfs-car --list-roots this-is-a-dir.car
# bafybeib2btbd5w6fd5evfaa3hkud5kdsf3gpkhijnfnnqz37kao5f4grm4

# bafybeib2btbd5w6fd5evfaa3hkud5kdsf3gpkhijnfnnqz37kao5f4grm4 should be the root CID of the directory DAG
# bagbaierahsxnqk22qbifvlcc7rzvksda4qz46dskxulj2btb65ovdb33mirq should be the CID of the this-is-a-dir.car CAR shard
# bagbaieraryp54uvfvxrpedxmmoms36g2hfanxuimvzk3i4l54ndaylz67voa should be the CID of the hello.car CAR shard
# bagbaierawb5xbb5dj2776hmvu7bwzkuor6ynbpkuiqdpqsvsnvaixga5thma should be the CID of the world.car CAR shard
w3 can upload add bafybeib2btbd5w6fd5evfaa3hkud5kdsf3gpkhijnfnnqz37kao5f4grm4 bagbaierahsxnqk22qbifvlcc7rzvksda4qz46dskxulj2btb65ovdb33mirq bagbaierawb5xbb5dj2776hmvu7bwzkuor6ynbpkuiqdpqsvsnvaixga5thma bagbaieraryp54uvfvxrpedxmmoms36g2hfanxuimvzk3i4l54ndaylz67voa
```

The directory should be accessible at `https://w3s.link/ipfs/bafybeib2btbd5w6fd5evfaa3hkud5kdsf3gpkhijnfnnqz37kao5f4grm4` and `bafybeib2btbd5w6fd5evfaa3hkud5kdsf3gpkhijnfnnqz37kao5f4grm4` should be listed when running `w3 ls`.

## m3u8 Playlist Example

First, we generate a playlist for a test video.

```bash
ffmpeg -f lavfi -i testsrc=duration=16:size=1280x720:rate=30 -hls_time 2 -hls_playlist_type vod -hls_segment_type mpegts -hls_segment_filename %01d.ts index.m3u8
```

The following files should be created:

```
0.ts
1.ts
index.m3u8
```

Then, we can generate the CAR shards.

```bash
node m3u8-playlist-example.js
```

The following CAR shards should be created:

```
0.car
1.car
index.car
playlist-dir.car
```

- `0.car` contains the first segment file.
- `1.car` contains the second segment file.
- `index.car` contains the m3u8 playlist that points to the segment files.
- `playlist-dir.car` contains a directory with links (CIDs) to the above files without the actual blocks.

Then, we can use `w3` to store the individual CAR shards and then link the CAR shards together into a single upload identified by the root CID of the directory:

```bash
w3 can store add 0.car
# ⠋ Storingbagbaierasoiqpvsm4cp3ylebpypgf7ovyclx4nmql6f3jqzocrxhnbhuhnwq
# ⁂ Stored bagbaierasoiqpvsm4cp3ylebpypgf7ovyclx4nmql6f3jqzocrxhnbhuhnwq
w3 can store add 1.car
# ⠏ Storingbagbaieraz3vifi7yap7g77ahh6mlxxsecajtzfwldg23jz7madapcnmmfazq
# ⁂ Stored bagbaieraz3vifi7yap7g77ahh6mlxxsecajtzfwldg23jz7madapcnmmfazq
w3 can store add index.car
# ⠇ Storingbagbaierawegh57xlogc2lrti2pzdjqnrsvv7tt7xsanjs3j5fpsqiah2mzeq
# ⁂ Stored bagbaierawegh57xlogc2lrti2pzdjqnrsvv7tt7xsanjs3j5fpsqiah2mzeq
w3 can store add playlist-dir.car
# ⠴ Storingbagbaieraa2nxtlb7a5jcgi2dqcq5zbkpafjkj6hyxo2gczgts3qn2aocvdxq
# ⁂ Stored bagbaieraa2nxtlb7a5jcgi2dqcq5zbkpafjkj6hyxo2gczgts3qn2aocvdxq

ipfs-car --list-roots playlist-dir.car
# bafybeigy6qwyjq4f6bx5uhfzfrohr7rxexq6ybbv7r3727v3dekqm7vh5a

# bafybeigy6qwyjq4f6bx5uhfzfrohr7rxexq6ybbv7r3727v3dekqm7vh5a should be the root CID of the directory DAG
# bagbaieraa2nxtlb7a5jcgi2dqcq5zbkpafjkj6hyxo2gczgts3qn2aocvdxq should be the CID of the playlist-dir.car CAR shard
# bagbaierasoiqpvsm4cp3ylebpypgf7ovyclx4nmql6f3jqzocrxhnbhuhnwq should be the CID of the 0.car CAR shard
# bagbaieraz3vifi7yap7g77ahh6mlxxsecajtzfwldg23jz7madapcnmmfazq should be the CID of the 1.car CAR shard
# bagbaierawegh57xlogc2lrti2pzdjqnrsvv7tt7xsanjs3j5fpsqiah2mzeq should be the CID of the index.car CAR shard
w3 can upload add bafybeigy6qwyjq4f6bx5uhfzfrohr7rxexq6ybbv7r3727v3dekqm7vh5a bagbaieraa2nxtlb7a5jcgi2dqcq5zbkpafjkj6hyxo2gczgts3qn2aocvdxq bagbaierasoiqpvsm4cp3ylebpypgf7ovyclx4nmql6f3jqzocrxhnbhuhnwq bagbaieraz3vifi7yap7g77ahh6mlxxsecajtzfwldg23jz7madapcnmmfazq bagbaierawegh57xlogc2lrti2pzdjqnrsvv7tt7xsanjs3j5fpsqiah2mzeq
```

The directory should be accessible at `https://w3s.link/ipfs/bafybeigy6qwyjq4f6bx5uhfzfrohr7rxexq6ybbv7r3727v3dekqm7vh5a` and ``should be listed when running`w3 ls`.

The m3u8 playlist can be used for HLS playback:

- Via the [Livepeer player](https://lvpr.tv/?url=https://w3s.link/ipfs/bafybeigy6qwyjq4f6bx5uhfzfrohr7rxexq6ybbv7r3727v3dekqm7vh5a/index.m3u8)
- Via the [Bitmovin player](https://bitmovin.com/demos/stream-test?format=hls&manifest=https%3A%2F%2Fw3s.link%2Fipfs%2Fbafybeigy6qwyjq4f6bx5uhfzfrohr7rxexq6ybbv7r3727v3dekqm7vh5a%2Findex.m3u8)
