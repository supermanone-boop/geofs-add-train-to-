(function () {
  "use strict";

  const url =
    "https://raw.githubusercontent.com/supermanone-boop/models/main/genesis.glb";

  // 🚆 路線（折り返し区間）
  const P = [
    [135.498457, 34.705282],
    [135.497476, 34.708041],
    [135.495894, 34.709116],
    [135.489578, 34.710846],
    [135.482322, 34.720132],
    [135.482381, 34.721604],
    [135.482609, 34.722619]
  ];

  const SPEED = 18;
  const HEIGHT = 10;

  const TRAINS = [];

  // --------------------------
  // 🚆 列車生成（方向付き）
  // --------------------------
  function spawnTrain(dir) {
    const viewer = geofs.api.viewer;

    const start = dir === 1 ? 0 : P.length - 1;

    const pos = Cesium.Cartesian3.fromDegrees(
      P[start][0],
      P[start][1],
      HEIGHT
    );

    const model = viewer.scene.primitives.add(
      Cesium.Model.fromGltf({
        url,
        modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(pos),
        scale: 1
      })
    );

    TRAINS.push({
      model,
      i: start,
      t: 0,
      dir,
      last: performance.now()
    });

    console.log(dir === 1 ? "🚆 上り発車" : "🚆 下り発車");
  }

  // --------------------------
  // ⏱ 3分ごとに上下線発車
  // --------------------------
  setInterval(() => {
    spawnTrain(1);
    spawnTrain(-1);
  }, 3 * 60 * 1000);

  // --------------------------
  // 🚆 更新ループ
  // --------------------------
  function update() {
    const now = performance.now();

    for (const tr of TRAINS) {
      const dt = (now - tr.last) / 1000;
      tr.last = now;

      const next = tr.i + tr.dir;

      const a = P[tr.i];
      const b = P[next];

      if (!b) continue;

      const dx = (a[0] - b[0]) * 111000;
      const dy = (a[1] - b[1]) * 111000;
      const d = Math.sqrt(dx * dx + dy * dy);

      const step = (SPEED * dt) / d;
      tr.t += step;

      if (tr.t >= 1) {
        tr.t = 0;
        tr.i = next;

        // 🔁 折り返し
        if (tr.i >= P.length - 1) tr.dir = -1;
        if (tr.i <= 0) tr.dir = 1;
      }

      const lon = a[0] + (b[0] - a[0]) * tr.t;
      const lat = a[1] + (b[1] - a[1]) * tr.t;

      const pos = Cesium.Cartesian3.fromDegrees(lon, lat, HEIGHT);

      // 🧭 進行方向
      const heading = Math.atan2(
        b[0] - a[0],
        b[1] - a[1]
      );

      const hpr = Cesium.Matrix3.fromHeadingPitchRoll(
        new Cesium.HeadingPitchRoll(heading, 0, 0)
      );

      const m = Cesium.Transforms.eastNorthUpToFixedFrame(pos);

      Cesium.Matrix4.multiplyByMatrix3(m, hpr, m);

      tr.model.modelMatrix = m;
    }
  }

  setInterval(update, 50);

  // --------------------------
  // ⏳ GeoFS待機
  // --------------------------
  const wait = setInterval(() => {
    if (window.geofs && geofs.api && window.Cesium) {
      clearInterval(wait);

      console.log("🚆 ダイヤシステム起動");
      spawnTrain(1);
      spawnTrain(-1);
    }
  }, 500);
})();
