export default [
  {
    name: "environmentMapTexture",
    type: "cubeTexture",
    path: [
      "../textures/environmentMaps/0/px.jpg",
      "../textures/environmentMaps/0/nx.jpg",
      "../textures/environmentMaps/0/py.jpg",
      "../textures/environmentMaps/0/ny.jpg",
      "../textures/environmentMaps/0/pz.jpg",
      "../textures/environmentMaps/0/nz.jpg",
    ],
  },
  {
    name: "grassColorTexture",
    type: "texture",
    path: "../textures/dirt/color.jpg",
  },
  {
    name: "grassNormalTexture",
    type: "texture",
    path: "../textures/dirt/normal.jpg",
  },
  {
    name: "foxModel",
    type: "gltfLoader",
    path: "../models/Fox/glTF/Fox.gltf",
  },
  {
    name: "manModel",
    type: "gltfLoader",
    path: "../models/Man/man.gltf",
  },
];
