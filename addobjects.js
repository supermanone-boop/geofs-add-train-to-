"use strict";

const url =
  "https://raw.githubusercontent.com/supermanone-boop/models/main/genesis.glb";

// 📍 設置座標（指定された場所）
const LON = 135.439131;
const LAT = 34.784790;
const HEIGHT = 10;

function spawnModel() {
  const viewer = geofs.api.viewer;

  const pos = Cesium.Cartesian3.fromDegrees(
    LON,
    LAT,
    HEIGHT
  );

  const model = viewer.scene.primitives.add(
    Cesium.Model.fromGltf({
      url: url,
      modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(pos),
      scale: 1
    })
  );

  console.log("📦 GLBモデル設置完了");
  return model;
}

// ⏳ GeoFS読み込み待ち（コンソール実行でも安全）
const wait = setInterval(() => {
  if (window.geofs && geofs.api && window.Cesium) {
    clearInterval(wait);
    spawnModel();
  }
}, 500);