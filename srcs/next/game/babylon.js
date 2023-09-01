function start()
{
	const canvas = document.getElementById("renderCanvas");
	const engine = new BABYLON.Engine(canvas, true);
	const scene = createScene(canvas, engine);

	render(engine, scene);
}

function render(engine, scene)
{
	createScene().then((scene) => {
		engine.runRenderLoop(function () {
			scene.render();
		});
	});

	window.addEventListener("resize", function () {
		engine.resize();
	});
}

async function createScene(canvas, engine)
{
	const scene = new BABYLON.Scene(engine);
	const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

	camera.setTarget(BABYLON.Vector3.Zero());
	camera.attachControl(canvas, true);

	const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

	const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 1, segments: 32 }, scene);
	sphere.position.y = 4;

	const ball = new BABYLON.PhysicsBody(sphere, BABYLON.PhysicsMotionType.DYNAMIC, false, scene);

	// const sphere2 = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 1, segments: 32 }, scene);
	// sphere2.position.y = 2;


	const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);

	const hk = new BABYLON.HavokPlugin(true, await HavokPhysics());
	scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

	// const sphereAggregate = new BABYLON.PhysicsAggregate(sphere, BABYLON.PhysicsShapeType.SPHERE, { mass: 1, restitution: 0.75 }, scene);
	// const groundAggregate = new BABYLON.PhysicsAggregate(ground, BABYLON.PhysicsShapeType.BOX, { mass: 0 }, scene);

	return scene;
}