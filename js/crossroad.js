/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ···························  I M P O R T S  ······························*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
import { updateHP, shuffleArray, goTo, wait, injectArrInArr } from "./helpers.js?v=0.12";
import { generateStoreItems } from "./store.js?v=0.12";
import { db, state, save } from "./db.js?v=0.12";


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
export async function setLevel(lvl, fast, fromSavedState = false) {
	try {
		// Save new level
		state.currentLevel = lvl;

		// Fade crossroad screen
		const crossroadEl = document.querySelector("#crossroad");
		crossroadEl.classList.add("fadedCrossroad");
		if (!fast) {
			await wait(2000); // Half of the fade-out
			// Get every path ready
			document.querySelectorAll(".path").forEach(path => {
				path.dataset.filled = false;
				path.style.visibility = "hidden";
			});
			await wait(1000); // Wait for fade-out to finish
		}

		// Functions to run
		if (!fromSavedState) {
			await createLvlArray(lvl);
		}
		await fillPaths(fromSavedState);
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

			const arrayOfMobs = [...lvlData.spawns.map(mob => ({ type: "mob", mobId: mob }))];

			const saferoomsArray = [
				...Array(lvlData.stores).fill({ type: "store" }),
				...Array(lvlData.chests).fill({ type: "chest" }),
				...lvlData.doors.map(door => ({ type: "door", level: door }))
			];

			const levelArray = injectArrInArr(arrayOfMobs, saferoomsArray);

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
export function fillPaths(fromSavedState = false) {
	return new Promise((resolve, reject) => {
		try {
			let levelArray = [];

			if (fromSavedState) {
				levelArray.push(state.paths.path1, state.paths.path2, state.paths.path3);
				console.log(levelArray);
			} else {
				if (state.endOfTheRoad === 1) {
					levelArray = [{ type: 'door', level: db.levels[state.currentLevel].doors[0] }];
					state.endOfTheRoad++;
				} else if (state.endOfTheRoad === 2) {
					levelArray = []
				} else {
					levelArray = state.currentLevelArray;
				}
			}


			const emptyPaths = document.querySelectorAll("#crossroad div[data-filled='false']");

			emptyPaths.forEach(async (path) => {
				if (levelArray[0] !== undefined) {
					const mobOrRoom = { ...levelArray[0] };
					const roomName = path.querySelector(".pathTitle");
					const btnTxt = path.querySelector(".main-path-button");
					const lvlTxt = path.querySelector(".pathMobLvl");

					switch (mobOrRoom.type) {
						case "store":
							roomName.textContent = "Store";
							btnTxt.textContent = "Enter";
							path.dataset.pathtype = "store";
							path.dataset.skippable = true;
							if (!fromSavedState) {
								let emptyStore = 1;
								while (state[`store${emptyStore}`]) {
									emptyStore++;
								}
								path.dataset.storeid = `store${emptyStore}`;
								mobOrRoom.storeId = `store${emptyStore}`;
								generateStoreItems(emptyStore);
							} else {
								path.dataset.storeid = mobOrRoom.storeId;
							}
							path.dataset.filled = true;
							path.style.visibility = "visible";
							break;

						case "chest":
							roomName.textContent = "Chest";
							btnTxt.textContent = "Open";
							path.dataset.pathtype = "chest";
							path.dataset.skippable = true;
							path.dataset.filled = true;
							path.style.visibility = "visible";
							break;

						case "door":
							const lvl = mobOrRoom.level;
							const lvlName = db.levels[lvl].name;
							roomName.textContent = `Go to ${lvlName}`;
							btnTxt.textContent = "Exit";
							path.dataset.pathtype = "door";
							path.dataset.door = lvl;
							path.dataset.skippable = state.endOfTheRoad > 0 ? false : true;
							path.dataset.filled = true;
							path.style.visibility = "visible";
							break;
						case "mob":
							const mob = db.mobs[mobOrRoom.mobId];
							roomName.textContent = mob.name;
							btnTxt.textContent = "Fight";
							if (mob.name !== "Chest") {
								lvlTxt.innerHTML = `<span>·<·</span> Lvl ${mob.lvl} <span>·>·</span>`;
							}
							path.dataset.pathtype = "encounter";
							path.dataset.mobid = mobOrRoom.mobId;
							path.dataset.skippable = true;
							path.dataset.filled = true;
							path.style.visibility = "visible";
							break;
						default:
							console.log('case false');
							path.style.visibility = "hidden";
							path.dataset.filled = false;
							break;
					}

					setTimeout(() => {
						// Referring to the particle animation code
						path.style.transition = "0.6s";
						path.style.opacity = "1";
					}, 100);
					state.paths[path.id] = mobOrRoom;
					levelArray.shift();
				} else {
					if (!state.endOfTheRoad) {
						state.endOfTheRoad = 1;
						fillPaths();
					} else {
						path.style.visibility = "hidden";
						path.dataset.filled = false;
					}

				}
			});

			save();

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
				path.querySelectorAll(".particles").forEach(el => {
					el.remove();
				});

				pathContent.querySelector(".pathTitle").textContent = "";
				pathContent.querySelector(".pathMobLvl").textContent = "";
				pathContent.querySelector(".main-path-button").textContent = "";

				path.dataset.filled = false;
				path.dataset.pathtype = "";
				path.dataset.mobid = "";
				path.dataset.skippable = true;
				state.paths[path.id] = false;

				skipBtn.classList.remove("hideSkip");

				if (path.dataset.storeid) {
					const cardsForSale = [...state.cardsForSale];
					const storeArr = [...state[path.dataset.storeid]];
					const filteredItems = cardsForSale.filter(item => !storeArr.includes(item));
					state.cardsForSale = filteredItems;

					delete state[path.dataset.storeid];
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

	// Reset saved paths
	state.paths = { path1: false, path2: false, path3: false }

	await setLevel(door);

	crossroad.style.pointerEvents = "auto";
}