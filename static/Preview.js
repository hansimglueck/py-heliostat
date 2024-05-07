let scene, camera, renderer, controls, sun, heliostat;
let beamTubeGeometry, beamTube, target, intersection;

function init() {
  /////// SCENE
  /////////////////////
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xdddddd);

  /////// CAMERA
  /////////////////////
  camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    1,
    5000
  );
  camera.rotation.y = (45 / 180) * Math.PI;
  camera.position.x = 800;
  camera.position.y = 100;
  camera.position.z = 1000;

  /////// RENDERER
  /////////////////////
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth * 0.75, window.innerHeight * 0.75); // Größe anpassen, falls notwendig
  document.getElementById("preview").appendChild(renderer.domElement);

  /////// OrbitControls
  /////////////////////
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // optional: Dämpfung / Trägheit
  controls.dampingFactor = 0.25;
  controls.enableZoom = true;

  /////// PLAIN
  /////////////////////
  const planeGeometry = new THREE.CircleGeometry(1000, 32); // Breite und Höhe der Ebene
  const planeMaterial = new THREE.MeshBasicMaterial({
    color: 0xcccccc, // Farbe der Ebene
    side: THREE.DoubleSide, // Beide Seiten der Ebene sollen sichtbar sein
  });

  // Erstelle das Mesh-Objekt
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);

  // Setze die Rotation der Ebene, damit sie horizontal liegt
  plane.rotation.x = Math.PI / 2;

  // Setze die Position der Ebene (z = 0)
  plane.position.y = -100;

  // Füge die Ebene der Szene hinzu
  scene.add(plane);

  /////// LIGHTING
  /////////////////////
  const light = new THREE.PointLight(0x9999ff, 1.5, 1000);
  light.position.set(400, 300, 300);
  scene.add(light);
  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  /////// TARGET
  /////////////////////
  // Textur mit Canvas generieren
  const size = 512; // Die Größe des Canvas
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const context = canvas.getContext("2d");

  // Schachbrett-Muster zeichnen
  const step = size / 8; // Größe eines Schachfeldes
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      context.fillStyle = (i + j) % 2 === 0 ? "#FFFFFF" : "#000000";
      context.fillRect(i * step, j * step, step, step);
    }
  }

  // Canvas als Textur verwenden
  const texture = new THREE.CanvasTexture(canvas);
  const cubeGeometry = new THREE.BoxGeometry(100, 100, 100);
  const cubeMaterial = new THREE.MeshPhongMaterial({
    map: texture, // Textur auf das Material anwenden
  });

  // Würfel erstellen
  target = new THREE.Mesh(cubeGeometry, cubeMaterial);
  target.position.set(400, 0, 300);
  scene.add(target);

  /////// INTERSECTION
  /////////////////////
  const sphereGeometry = new THREE.SphereGeometry(5, 32, 32); // Radius 5, feinere Unterteilung für Glätte
  const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  intersection = new THREE.Mesh(sphereGeometry, sphereMaterial);
  //   intersection.position.copy(intersectionPoint);
  scene.add(intersection);

  /////// HELIOSTAT
  /////////////////////
  let heliostatGeometry = new THREE.BoxGeometry(100, 10, 100);
  let heliostatMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
  heliostat = new THREE.Mesh(heliostatGeometry, heliostatMaterial);
  scene.add(heliostat);

  /////// SUN
  /////////////////////
  let sunGeometry = new THREE.SphereGeometry(50, 32, 32);
  let sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  sun = new THREE.Mesh(sunGeometry, sunMaterial);
  sun.position.set(1000, 200, 1000);
  scene.add(sun);

  /////// SUN-BEAM
  /////////////////////
  const beamCurve = new THREE.LineCurve3(sun.position, heliostat.position);
  beamTubeGeometry = new THREE.TubeGeometry(beamCurve, 20, 2, 8, false);
  const beamTubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  beamTube = new THREE.Mesh(beamTubeGeometry, beamTubeMaterial);

  scene.add(beamTube);

  /////// REFLECTION
  /////////////////////
  const reflectionCurve = new THREE.LineCurve3(
    sun.position,
    heliostat.position
  );
  reflectionTubeGeometry = new THREE.TubeGeometry(
    reflectionCurve,
    20,
    2,
    8,
    false
  );
  const reflectionTubeMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff00,
  });
  reflectionTube = new THREE.Mesh(
    reflectionTubeGeometry,
    reflectionTubeMaterial
  );

  scene.add(reflectionTube);

  animate();
}

function calculateReflectedRay(sun, heliostat) {
  // Einfallsvektor berechnen: Vektor von Sonne zu Heliostat
  const incomingRay = new THREE.Vector3().subVectors(
    heliostat.position,
    sun.position
  );

  // Normalenvektor des Heliostats bestimmen, abhängig von seiner Rotation
  const normalVector = new THREE.Vector3(0, 1, 0); // Annahme: Heliostat normal zeigt nach oben, bevor er rotiert wird
  normalVector.applyEuler(heliostat.rotation);

  // Reflektierten Strahl berechnen
  const dotProduct = incomingRay.dot(normalVector);
  const reflection = new THREE.Vector3().subVectors(
    incomingRay,
    normalVector.multiplyScalar(2 * dotProduct)
  );

  return reflection; // Dies ist der Vektor des reflektierten Strahls
}

// Füge die Berechnung in deine Animationsloop oder eine relevante Funktion ein
function updateScene() {
  const reflectedRay = calculateReflectedRay(sun, heliostat);

  // Weitere Updates...
  // update for incoming beam
  if (beamTubeGeometry) {
    beamTubeGeometry.dispose();
  }
  const path = new THREE.LineCurve3(sun.position, heliostat.position);

  // Neue TubeGeometry erstellen
  beamTubeGeometry = new THREE.TubeGeometry(path, 20, 1, 8, false);
  beamTube.geometry = beamTubeGeometry;

  // update reflected beam
  if (reflectionTubeGeometry) {
    reflectionTubeGeometry.dispose();
  }
  // Neue Path-Kurve mit aktualisierten Punkten
  const path2 = new THREE.LineCurve3(reflectedRay, heliostat.position);
  // Neue TubeGeometry erstellen
  reflectionTubeGeometry = new THREE.TubeGeometry(path2, 20, 1, 8, false);
  reflectionTube.geometry = reflectionTubeGeometry;

  const raycaster = new THREE.Raycaster(
    heliostat.position,
    reflectedRay.normalize()
  );
  // Überprüfe den Schnittpunkt mit dem Würfel
  const intersects = raycaster.intersectObject(target);
  if (intersects.length > 0) {
    // Schnittpunkt gefunden
    const intersectionPoint = intersects[0].point;

    intersection.position.copy(intersectionPoint);
  } else {
    intersection.position.x = 0;
    intersection.position.y = 0;
    intersection.position.z = 0;
  }
}

function animate() {
  updateScene();
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

init();

document.addEventListener("DOMContentLoaded", function () {
  const socket = io();

  function sphericalToCartesian(azimuth, elevation, distance) {
    const phi = (90 - elevation) * (Math.PI / 180);
    const theta = (azimuth + 180) * (Math.PI / 180);

    return {
      x: distance * Math.sin(phi) * Math.cos(theta),
      y: distance * Math.cos(phi),
      z: distance * Math.sin(phi) * Math.sin(theta),
    };
  }

  function updateSunPosition(azimuth, elevation) {
    const position = sphericalToCartesian(azimuth, elevation, 500); // Angenommen, die Sonne ist 1000 Einheiten entfernt
    sun.position.set(position.x, position.y, position.z);
  }

  socket.on("solar_position", function (data) {
    updateSunPosition(data.azimuth, data.elevation);
  });

  heliostat.rotation.order = "YXZ"; // Ändere die Reihenfolge, wenn notwendig

  socket.on("update_heliostat", function (data) {
    heliostat.position.set(0, 0, 0);
    heliostat.rotation.set(
      (90 - data.elevation) * (Math.PI / 180), // Rotation um X-Achse
      -data.azimuth * (Math.PI / 180), // Rotation um Y-Achse
      0 // Rotation um Z-Achse (normalerweise nicht benötigt für Heliostat)
    );
  });
});
