/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ···························  I M P O R T S  ······························*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
import { updateHP, shuffleArray, goTo, wait  } from "./helpers.js";
import { generateStoreItems } from "./store.js";
import { db, state } from "./db.js";


/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ··························  F U N C T I O N S  ···························*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/

/*===========================================================================*/
// Set level
/*===========================================================================*/
export async function setLevel(lvl, fast) {
	try {
		// Save new level
		state.currentLevel = lvl;

		// Get every path ready
		document.querySelectorAll(".path").forEach(path => {
			path.dataset.filled = false;
		});

		// Fade crossroad screen
		const crossroadEl = document.querySelector("#crossroad");
		crossroadEl.classList.add("fadedCrossroad");
		if (!fast) {
			await wait(3000); // Wait for animation to finish
		}

		// Functions to run
		await createLvlArray(lvl);
		await fillPaths();
		await setLevelUI(lvl);

		// Remove fade on crossroad screen
		crossroadEl.classList.remove("fadedCrossroad");

		// Go to crossroad screen
		goTo("crossroad");
	} catch (error) {
		console.error("An error occurred:", error);
	}
}

/////////////////
// Create array with every path in the level
/////////////////
function createLvlArray(lvl) {
	return new Promise((resolve, reject) => {
		try {
			const lvlData = db.levels[lvl];
			const arrayOfMobs = lvlData.spawns;

			const saferoomsArray = [
				...Array(lvlData.stores).fill({ type: "store" }),
				...Array(lvlData.chests).fill({ type: "chest" }),
				...lvlData.doors.map(door => ({ type: "door", level: door }))
			];

			const levelArray = [...arrayOfMobs, ...saferoomsArray];
			//shuffleArray(levelArray);

			state.currentLevelArray = levelArray;

			resolve();
		} catch (error) {
			reject(error);
		}
	});
}

/////////////////
// Fill the paths as they apear
/////////////////
export function fillPaths() {
	return new Promise((resolve, reject) => {
		try {
			const levelArray = state.currentLevelArray;
			const emptyPaths = document.querySelectorAll("#crossroad div[data-filled='false']");

			emptyPaths.forEach(async (path) => {
				if (levelArray.length > 0) {
					const mobOrRoom = levelArray[0];
					const roomName = path.querySelector(".pathTitle");
					const btnTxt = path.querySelector(".main-path-button");
					const lvlTxt = path.querySelector(".pathMobLvl");

					switch (mobOrRoom.type) {
						case "store":
							roomName.textContent = "Store";
							btnTxt.textContent = "Enter";
							path.dataset.pathtype = "store";
							path.dataset.skippable = true;
							let emptyStore = 1;
							while (state[`store${emptyStore}`]) {
								emptyStore++;
							}
							path.dataset.storeid = `store${emptyStore}`;
							generateStoreItems(emptyStore);
							break;

						case "chest":
							roomName.textContent = "Chest";
							btnTxt.textContent = "Open";
							path.dataset.pathtype = "chest";
							path.dataset.skippable = true;
							break;

						case "door":
							const lvl = mobOrRoom.level;
							const lvlName = db.levels[lvl].name;
							roomName.textContent = `Go to ${lvlName}`;
							btnTxt.textContent = "Exit";
							path.dataset.pathtype = "door";
							path.dataset.door = lvl;
							path.dataset.skippable = false;
							break;

						default:
							const mob = db.mobs[mobOrRoom];
							roomName.textContent = mob.name;
							btnTxt.textContent = "Fight";
							if (mob.name !== "Chest") {
								lvlTxt.innerHTML = `<span>·<·</span> Lvl ${mob.lvl} <span>·>·</span>`;
							}
							path.dataset.pathtype = "encounter";
							path.dataset.mobid = mobOrRoom;
							path.dataset.skippable = false;
							break;
					}

					setTimeout(() => {
						// Referring to the particle animation code
						path.style.transition = "0.6s";
						path.style.opacity = "1";
					}, 100);
					path.dataset.filled = true;
					path.style.visibility = "visible";
					levelArray.shift();
				} else {
					path.style.visibility = "hidden";
					path.dataset.filled = false;
				}
			});

			resolve();
		} catch (error) {
			reject(error);
		}
	});
}

/////////////////
// Set level UI elements (background, title, description...)
/////////////////
async function setLevelUI(lvl) {
	const lvlData = db.levels[lvl];

	// Background
	document.querySelector("#crossroadBg").src = `./assets/img/bg/${lvl}.png`;

	// Title and description
	const title = document.querySelector("#crossroad .level-title");
	const desc = document.querySelector("#crossroad .level-desc");
	title.textContent = lvlData.name;
	desc.textContent = lvlData.desc;

	updateHP();
}


/*===========================================================================*/
// Burn path
/*===========================================================================*/
export async function burnPath(path) {
	return new Promise(async (resolve, reject) => {
		try {
			const pathContent = path.querySelector(".path-content");
			const skipBtn = path.querySelector("[data-skip-path]")

			skipBtn.classList.add("hideSkip");

			let particlesOpts = {
				particlesAmountCoefficient: 3,
				direction: "bottom",
				color: "#fff"
			};

			particlesOpts.complete = () => {
				path.style.opacity = "0";
				path.style.transition = "0s";
				pathContent.style.transform = "unset";
				path.appendChild(pathContent);
				path.querySelector(".particles").remove();

				pathContent.querySelector(".pathTitle").textContent = "";
				pathContent.querySelector(".pathMobLvl").textContent = "";
				pathContent.querySelector(".main-path-button").textContent = "";

				path.dataset.filled = false;
				path.dataset.pathtype = "";
				path.dataset.mobid = "";
				path.dataset.skippable = true;

				skipBtn.classList.remove("hideSkip");

				if (path.dataset.storeid) {
					const storeid = "store" + path.dataset.storeid;
					delete state[storeid];
				}
				path.dataset.storeid = "";
				
				resolve();
			};

			const particles = new Particles(pathContent, particlesOpts);
			if (!particles.isAnimating()) {
				particles.disintegrate();
			}


		} catch (error) {
			console.log("An error occurred trying to remove a path: " + error.message);
			reject(error);
		}
	});
}


/*===========================================================================*/
// Take door
/*===========================================================================*/
export async function takeDoor(path) {
	const door = path.dataset.door;
	const crossroad = document.querySelector("#crossroad");

	crossroad.style.pointerEvents = "none";
	await burnPath(path);
	await setLevel(door);
	crossroad.style.pointerEvents = "auto";
}