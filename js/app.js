/* ··········································································*/
/* ··········································································*/
/* ···························  I M P O R T S  ······························*/
/* ··········································································*/
/* ··········································································*/
import { goTo, shuffleArray, wait, updateHP, generateStoreItems, generateStore, buy, checkIfAbleToBuy, generateInventory, rand } from "./helpers.js";
import { useitem, applyDiscsEffects, calculateEffects } from "./items.js";
import { db, state } from "./db.js";
import { generateDisc, spin } from "./soul.js";

/* ··········································································*/
/* ··········································································*/
/* ·························  V A R I A B L E S ·····························*/
/* ··········································································*/
/* ··········································································*/

/* ··········································································*/
/* ··········································································*/
/* ·························  F I R S T   L O A D  ··························*/
/* ··········································································*/
/* ··········································································*/
window.addEventListener("resize", widthBasedFontSize);
function widthBasedFontSize() {
	const root = document.querySelector(':root');
	const main = document.querySelector("main");
	root.style.setProperty('--width-based-font', main.clientWidth / 40 + "px");
	
	// to get css variable from :root
	//const color = getComputedStyle(root).getPropertyValue('--width-based-font'); //
}
widthBasedFontSize();

displayFate();
displayCoins();


/* ··········································································*/
/* ··········································································*/
/* ··························  F U N C T I O N S  ···························*/
/* ··········································································*/
/* ··········································································*/

/*==========================================*/
// Display current fate left
/*==========================================*/
function displayFate() {
	document.querySelectorAll(".fate-left").forEach(el => {
		el.textContent = state.player.fate;
	});
}

function displayCoins() {
	document.querySelectorAll(".coins-left").forEach(el => {
		el.textContent = state.player.coins;
	});
}


/*==========================================*/
// Set level
/*==========================================*/
function createLvlArray(lvl) {
	return new Promise((resolve, reject) => {
		try {
			// Data
			const lvlData = db.levels.find((x) => x.name === lvl);

			// Get mob array
			let mobArray = lvlData.spawns;

			// Create saferooms array
			const saferoomsArray = [
				...Array(lvlData.stores).fill({ type: "store" }),
				...Array(lvlData.chests).fill({ type: "chest" }),
				...lvlData.doors.map((door) => ({ type: "door", level: door })),
			];

			// Combine mob and saferoom arrays and shuffle them
			const levelArray = [...mobArray, ...saferoomsArray];
			shuffleArray(levelArray);

			state.currentLevelArray = levelArray;

			resolve();
		} catch (error) {
			reject(error);
		}
	});
}

// Function to fill/generate paths
function fillPaths() {
	return new Promise((resolve, reject) => {
		try {
			const levelArray = state.currentLevelArray;
			let emptyPaths = document.querySelectorAll("#crossroad div[data-filled='false']");

			emptyPaths.forEach(async path => {
				if (levelArray.length > 0) {

					const roomName = path.querySelector(".pathTitle");
					const btnTxt = path.querySelector(".main-path-button");
					const lvlTxt = path.querySelector(".pathMobLvl");


					//STORE
					if (levelArray[0].type === "store") {
						roomName.textContent = "Store";
						btnTxt.textContent = "Enter";
						path.dataset.pathtype = "store";
						path.dataset.skippable = true;
						
						let emptyStore = 1;
						while (state[`store${emptyStore}`]) {
							emptyStore++;
						}
						
						path.dataset.storeid = "store"+emptyStore;
						generateStoreItems(emptyStore);
					}

					//CHEST
					else if (levelArray[0].type === "chest") {
						roomName.textContent = "Chest";
						btnTxt.textContent = "Open";
						path.dataset.pathtype = "chest";
						path.dataset.skippable = true;
					}

					//DOOR
					else if (levelArray[0].type === "door") {
						let lvl = levelArray[0].level;
						let lvlName = db.levels.find((x) => x.name === lvl).name;
						roomName.textContent = "Go to " + lvlName;
						btnTxt.textContent = "Exit";
						path.dataset.pathtype = "door";
						path.dataset.door = lvlName;
						path.dataset.skippable = false;
					}

					//MOB
					else {
						const mob = db.mobs[levelArray[0]];
						roomName.textContent = mob.name;
						btnTxt.textContent = "Fight";
						if (mob.name !== "Chest") {
							lvlTxt.innerHTML = "<span>·<·</span> Lvl " + mob.lvl + " <span>·>·</span>";
						}
						path.dataset.pathtype = "encounter";
						path.dataset.mobid = levelArray[0];
						path.dataset.skippable = true;
					}

					setTimeout(() => {
						//This comes from the particle animation
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

async function setLevelUI(lvl) {
	//Background
	const lvlData = db.levels.find((x) => x.name === lvl);
	const img = lvlData.bg;
	document.querySelector("#crossroadBg").src = "./assets/img/bg/"+img+".png"

	//Title and description
	const title = document.querySelector("#crossroad .level-title");
	const desc = document.querySelector("#crossroad .level-desc");
	title.textContent = lvlData.name;
	desc.textContent = lvlData.desc;

	await updateHP();
}

async function setLevel(lvl, fast) {
    try {

		//Save new level
		state.currentLevel = lvl;

		//Get every path ready
		document.querySelectorAll(".path").forEach(path => {
			path.dataset.filled = false;
		});

		// Fade crossroad screen
		const crossroadEl = document.querySelector("#crossroad");
		crossroadEl.classList.add("fadedCrossroad");
		if (!fast) { await wait(3000); } //wait for animation to finish
		
		// Functions to run
		await createLvlArray(lvl);
		await fillPaths();
		await setLevelUI(lvl);

		// Remove fade on crossroad screen
		crossroadEl.classList.remove("fadedCrossroad");

		//Go to crossroad screen
        goTo("crossroad");
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

/*==========================================*/
// Load encounter
/*==========================================*/
async function generateEncounterCard(mobId) {
	return new Promise((resolve, reject) => {
		try {

			//Secondary action defaults
			document.querySelector(".change-fate").disabled = true;
			document.querySelector(".secondary-action").style.display = "none";
			state.fatePrice = 1;
			document.querySelector(".fate-price").textContent = state.fatePrice;

			//TO-DO: Image rotations
			const mobCardImgRotation = Math.floor(Math.random()*3);
			const mobCardTxtRotation = Math.floor(Math.random()*3);
			document.querySelector(".mob-image-wrapper").dataset.rotate = mobCardImgRotation;
			document.querySelector(".mob-info-wrapper").dataset.rotate = mobCardTxtRotation;

			//Player Slots
			const playerSlots = document.querySelector("#playerDiscs");
			playerSlots.innerHTML = "";
			for (let i = 0; i < state.player.slots; i++) {
				let newSlot = document.createElement("div");
				newSlot.classList.add("slot");
				playerSlots.append(newSlot);
			}
			playerDiscs.style.display = "flex";


			//MOB
			const mobject = db.mobs[mobId];
			state.currentMob = JSON.parse(JSON.stringify(mobject));
			state.currentMob.soul = mobject.soul;
			state.currentMob.hp = mobject.hp;
			state.currentMob.maxHp = mobject.hp;
			state.currentMob.mobid = mobId;
			const encounter = document.querySelector("#encounter");
			const imgEl = encounter.querySelector(".mob-image");
			const nameEl = encounter.querySelector(".mobName");
			const descEl = encounter.querySelector(".mobDesc");
			const skillsEl = encounter.querySelector(".mobSkills");

			imgEl.src = "./assets/img/mobs/" + mobject.img;
			nameEl.textContent = mobject.name;
			skillsEl.innerHTML = "";
			let skills = "";
			for (let i = 0; i < mobject.skills.length; i++) {
				skills += "<p>+ ";
				skills += mobject.skills[i];
				skills += "</p>";
			}
			skillsEl.innerHTML = skills;
			descEl.textContent = mobject.desc;

			//Mob slots
			const mobSlots = document.querySelector("#mobDiscs");
			mobSlots.innerHTML = "";
			for (let i = 0; i < mobject.slots; i++) {
				let newSlot = document.createElement("div");
				newSlot.classList.add("slot");
				mobSlots.append(newSlot);
			}
			mobDiscs.style.display = "none";

			// Update HP
			updateHP();

			//Remove previous discs
			document.querySelectorAll("#playerDiscs .additional-disc").forEach(el => {
				el.remove();
			});

			
			resolve();
		} catch (error) {
			console.log("An error occurred generating the encounter: " + error.message);
			reject(error);
		}
	})
}

async function loadEncounter(mobId) {
    try {
		state.player.itemsInUse = [];
        await generateEncounterCard(mobId);
        goTo("encounter");
		toggleTurn(true);
    } catch (error) {
        console.error("An error occurred when trying to load the encounter: " + error);
    }
}

/*==========================================*/
// Turn System
/*==========================================*/
async function toggleTurn(start) {
	//Elements
	const mainAction = document.querySelector("#playerBoard .main-action");
	const secondaryAction = document.querySelector("#playerBoard .secondary-action");
	const noAction = document.querySelector("#playerBoard .no-action");
	const playerDiscs = document.querySelector("#playerDiscs");
	const mobDiscs = document.querySelector("#mobDiscs");

	//Toggle
	if (!start) {
		state.turn = state.turn === "player" ? "mob" : "player";
	}

	//Remove un/successful states
	document.querySelectorAll(".slot.successful, .slot.unsuccessful").forEach(slot => {
		slot.classList.remove("successful", "unsuccessful");
	});

	//Reset turn data
	state.turnDamage = 0;
	state.turnHeal = 0;

	//Reset UI
	if (state.turn === "player" || start) {
		mainAction.style.display = "flex";
		secondaryAction.style.display = "none";
		noAction.style.display = "none";
		state.fatePrice = 1;
		document.querySelector(".fate-price").textContent = state.fatePrice;
		playerDiscs.style.display = "flex";
		mobDiscs.style.display = "none";
	}

	else if (state.turn === "mob") {
		mainAction.style.display = "none";
		secondaryAction.style.display = "none";
		noAction.style.display = "flex";
		playerDiscs.style.display = "none";
		mobDiscs.style.display = "flex";
		document.querySelectorAll("#mobDiscs .slot").forEach(slot => {
			slot.innerHTML = "";
			slot.classList.remove("charged");
		});
		await wait(200);
		await enemyAttack();
	}
}

async function secondaryAction() {
	if (state.player.fate >= state.fatePrice) {
		document.querySelector(".change-fate").disabled = false;
	}
	document.querySelector("#playerBoard .secondary-action").style.display = "flex";
}

/*==========================================*/
// Attack
/*==========================================*/
async function attack() {
	return new Promise(async(resolve, reject) => {
		try {
			document.querySelector("#playerBoard .main-action").style.display = "none";
			await spinDiscs();
			secondaryAction();
			resolve();
		} catch (error) {
			console.log("An error occurred during attack: " + error.message);
			reject(error);
		}
	});
}

/*==========================================*/
// Spin discs
/*==========================================*/
async function spinDiscs() {
	return new Promise(async(resolve, reject) => {
		try {

			let discs;

			if (state.turn === "player") {
				discs = document.querySelectorAll("#playerDiscs .slot.charged");
			} else if (state.turn === "mob") {
				discs = document.querySelectorAll("#mobDiscs .slot.charged");
			}
			for (let i = 0; i < discs.length; i++) {
				const disc = discs[i].querySelector(".disc");
				let result = await spin(disc.id);
				await calculateEffects(disc.id, result);
			}

			resolve();
		} catch (error) {
			console.log("An error occurred during attack: " + error.message);
			reject(error);
		}
	});
}


/*==========================================*/
// Change fate
/*==========================================*/
async function changeFate() {
	const fateBtn = document.querySelector(".change-fate");
	const endBtn = document.querySelector(".end-turn");

	//Remove un/successful states
	document.querySelectorAll(".slot.successful, .slot.unsuccessful").forEach(slot => {
		slot.classList.remove("successful", "unsuccessful");
	});
	
	//Remove calculated effects
	state.turnDamage = 0;
	state.turnHeal = 0;
	document.querySelector("#encounter .enemy-hp .progress .damage-bar").style.width = "0%";
	document.querySelectorAll(".heal-bar").forEach(el => { el.style.width = "0%"; });
	
	await wait (450);

	//Temporarily disable button
	fateBtn.disabled = true;
	endBtn.disabled = true;

	//Subtract fate
	state.player.fate = state.player.fate - state.fatePrice;

	//Update fate
	displayFate();

	//Double the price
	state.fatePrice = state.fatePrice * 2;

	//Update fate button
	document.querySelector(".fate-price").textContent = state.fatePrice;

	//Spin
	await spinDiscs();

	//Enable buttons back
	if (state.player.fate >= state.fatePrice) {
		fateBtn.disabled = false;
	}

	endBtn.disabled = false;
}

/*==========================================*/
// Damage to mob
/*==========================================*/
async function damageToEnemy() {
	state.currentMob.hp--;
	state.currentMob.soul[0] = state.currentMob.soul[0] + (state.currentMob.lvl * 2.3);
	generateDisc([state.currentMob.soul], "mobSoul");
	const hearts = document.querySelectorAll('.enemy-hp > .full > .heart');
	const lastHeart = hearts[hearts.length - 1];
	
	let particlesOpts = {
		particlesAmountCoefficient: 1,
		direction: "bottom",
		color: "red"
	};
	particlesOpts.complete = () => {
		lastHeart.style.opacity = "0";
		lastHeart.style.transform = "unset";
		lastHeart.parentElement.style.transform = "unset";
		lastHeart.parentElement.style.visibility = "unset";
		updateHP();
	};
	const particles = new Particles(lastHeart, particlesOpts);
	if ( !particles.isAnimating() ) {
		particles.disintegrate();
	}

	if (state.currentMob.hp > 0) {
		toggleTurn();
	} else {
		victory();
	}
}

/*==========================================*/
// Victory
/*==========================================*/
async function victory() {
	document.querySelector("#xpscreen").style.display = "flex";
	generateXpScreen();
}

/*==========================================*/
// Generate XP screen
/*==========================================*/
async function generateXpScreen() {
	return new Promise(async(resolve, reject) => {
		try {

			// Select elements
			const xpscreen = document.querySelector("#xpscreen");
			const lvl = xpscreen.querySelector(".lvl span");
			const [toTargetElement, targetElement] = xpscreen.querySelectorAll(".bar span");
			const bar = xpscreen.querySelector(".progress");
			const reward = document.querySelector("#xpscreen .reward span");
			const lvlUpReward = document.querySelectorAll(".lvl-up-reward");

			
			// Update player's coins and display reward
			const coinsReward = state.currentMob.lvl; // TO-DO: Rewards per mob
			state.player.coins += coinsReward;
			reward.textContent = "+" + coinsReward;
			await displayCoins();

			// Fetch XP data
			const lvlArr = db.xpTiers;
			let lvlIndex = state.player.lvl - 1;
			let target = lvlArr[lvlIndex + 1];
			const gainedXP = state.currentMob.lvl;
			const oldTotalXP = state.player.xp;
			const newTotalXP = oldTotalXP + gainedXP;

			// Display current level and progress bar
			lvlUpReward.forEach(el => {
				el.style.display = "none";
			});
			lvl.textContent = state.player.lvl;
			targetElement.textContent = target - lvlArr[lvlIndex];
			toTargetElement.textContent = Math.min(oldTotalXP - lvlArr[lvlIndex], target - lvlArr[lvlIndex]);
			bar.style.width = ((oldTotalXP - lvlArr[lvlIndex]) * 100 / (target - lvlArr[lvlIndex])) + "%";

			// Update player's XP
			state.player.xp = newTotalXP;

			// Update stats
			await wait(500);
			toTargetElement.textContent = Math.min(newTotalXP - lvlArr[lvlIndex], target - lvlArr[lvlIndex]);
			bar.style.width = ((newTotalXP - lvlArr[lvlIndex]) * 100 / (target - lvlArr[lvlIndex])) + "%";
			await wait(1000);
			
			if (newTotalXP >= target) {
				state.player.lvl++;
				bar.style.transition = "0s";
				bar.style.width = "0%";
				lvl.textContent = state.player.lvl;
				const newLvlIndex = state.player.lvl - 1;
				target = lvlArr[newLvlIndex + 1];
				targetElement.textContent = target - lvlArr[newLvlIndex];
				toTargetElement.textContent = Math.min(newTotalXP - lvlArr[newLvlIndex], target - lvlArr[newLvlIndex]);

				// Level up reward
				// TO-DO
				lvlUpReward.forEach(el => {
					el.style.display = "flex";
				});
				state.player.maxHp++;
				state.player.hp = state.player.maxHp;
				state.player.fate += 5;
				displayFate();

				// Update stats again
				await wait(500);
				bar.style.transition = "1s";
				bar.style.width = ((newTotalXP - lvlArr[newLvlIndex]) * 100) / (target - lvlArr[newLvlIndex]) + "%";
			}

			resolve();

		} catch (error) {
			console.log("An error occurred displaying XP screen: " + error.message);
			reject(error);
		}
	});
}

/*==========================================*/
// Damage to player
/*==========================================*/
async function damageToPlayer() {
	state.player.hp--;
	const hearts = document.querySelectorAll('.player-hp > .full > .heart');
	const lastHeart = hearts[hearts.length - 1];

	let particlesOpts = {
		particlesAmountCoefficient: 1,
		direction: "bottom",
		color: "red"
	};
	particlesOpts.complete = () => {
		lastHeart.style.opacity = "0";
		lastHeart.style.transform = "unset";
		lastHeart.parentElement.style.transform = "unset";
		lastHeart.parentElement.style.visibility = "unset";
		updateHP();
	};
	const particles = new Particles(lastHeart, particlesOpts);
	if ( !particles.isAnimating() ) {
		particles.disintegrate();
	}
	
	if (state.player.hp > 0) {
		toggleTurn();
	} else {
		location.reload();
	}
}

/*==========================================*/
// Enemy's turn
/*==========================================*/
async function enemyAttack() {
	return new Promise(async(resolve, reject) => {
		try {

			const pattern = state.currentMob.patterns[Math.floor(Math.random() * state.currentMob.patterns.length)];
			const slots = document.querySelectorAll("#mobDiscs .slot");

			for (let i = 0; i < slots.length; i++) {
				const slot = slots[i];
				slot.classList.add("target-slot");
				
				await wait(await rand(200, 1200));

				await useitem(pattern[i]);
			}
			
			await spinDiscs();
			
			await wait(800);
			await applyDiscsEffects();

			toggleTurn();


			resolve();
		} catch (error) {
			console.log("An error occurred during the enemy's attack: " + error.message);
			reject(error);
		}
	});
}

/*==========================================*/
// Burn path
/*==========================================*/
async function burnPath(pathToBurn) {
	return new Promise(async(resolve, reject) => {
		try {
			const path = pathToBurn;
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
			if ( !particles.isAnimating() ) {
				particles.disintegrate();
			}


		} catch (error) {
			console.log("An error occurred trying to remove a path: " + error.message);
			reject(error);
		}
	});
}

/*==========================================*/
// Take door
/*==========================================*/
async function takeDoor(path) {
	const door = path.dataset.door;
	const crossroad = document.querySelector("#crossroad");

	crossroad.style["pointer-events"] = "none";
	await burnPath(path);
	await setLevel(door);
	crossroad.style["pointer-events"] = "auto";
}

/* ··········································································*/
/* ··········································································*/
/* ··························  EVENT LISTENERS  ·····························*/
/* ··········································································*/
/* ··········································································*/

/*==========================================*/
// Start button
/*==========================================*/
document.querySelector("#start #newGame").addEventListener("click", function () {
	//TO-DO: Activar el fullscreen cuando no me toque la polla
	//document.documentElement.requestFullscreen();
	setLevel("Crossroad", true);
});

/*==========================================*/
// Path buttons
/*==========================================*/
document.querySelector("#crossroad").addEventListener("click", async function (e) {
	const path = e.target.closest(".path");
	if (path) {
		const type = path.dataset.pathtype;
		
		// Main button
		if (e.target.classList.contains("main-path-button")) {
			
			// Mob encounter
			if (type === "encounter") {
				const mob = path.dataset.mobid;
				loadEncounter(mob);
			}

			// Door
			if (type === "door") {
				takeDoor(path);
			}

			// Store
			if (type === "store") {
				const storeid = path.dataset.storeid;
				await generateStore(storeid);
				await checkIfAbleToBuy();
				document.querySelector("#store").style.display = "flex";
			}
		}
	}

});

/*==========================================*/
// Go-to buttons
/*==========================================*/
document.querySelectorAll("[data-goto]").forEach(el => {
	el.addEventListener("click", function () {
		goTo(el.dataset.goto);
	});
});

/*==========================================*/
// Attack button
/*==========================================*/
document.querySelector("#attackBtn").addEventListener("click", function () {
	attack();
});

/*==========================================*/
// Change fate button
/*==========================================*/
document.querySelector(".change-fate").addEventListener("click", function () {
	changeFate();
});

/*==========================================*/
// End turn
/*==========================================*/
document.querySelector(".end-turn").addEventListener("click", async function () {
	await applyDiscsEffects();
	if (state.currentMob.hp <= 0) {
		victory();
	} else {
		toggleTurn();
	}
});

/*==========================================*/
// Skip path
/*==========================================*/
document.querySelectorAll("[data-skip-path]").forEach(el => {
	
	el.addEventListener("click", async function() {
		await burnPath(el.parentElement);
		await fillPaths();
    })
});

/*==========================================*/
// XP Screen
/*==========================================*/
document.querySelector("#xpscreen button").addEventListener("click", async function () {
	const path = document.querySelector('#crossroad [data-mobid="'+ state.currentMob.mobid +'"]');
	await updateHP();
	document.querySelector("#xpscreen").style.display = "none";
	await goTo("crossroad");
	await burnPath(path);
	await fillPaths();
});

/*==========================================*/
// Close store
/*==========================================*/
document.querySelector(".close-store").addEventListener("click", async function () {
	document.querySelector("#store").style.display = "none";
});

/*==========================================*/
// Buy items
/*==========================================*/
document.querySelector("#store").addEventListener("click", async function (e) {
	if (e.target.matches(".buy-item, .buy-item > *")) {
		const storeItemEL = e.target.closest(".store-item");
		
		//Data
		const group = storeItemEL.dataset.group;
		const item = storeItemEL.dataset.item;
		const store = storeItemEL.dataset.store;
		const position = storeItemEL.dataset.position;
		
		await buy(group, item);
		await checkIfAbleToBuy();
		displayCoins();
		displayFate();
		updateHP();
		state[store][position] = "";

		storeItemEL.style.visibility = "hidden";

		//If it's the last item, burn path
		if (state[store][0] == "" && state[store][1] == "" && state[store][2] == "") {
			document.querySelector("#store").style.display = "none";
			await burnPath(document.querySelector('.path[data-storeid="' + store + '"'));
			fillPaths();
		}

	}
});


/*==========================================*/
// Open/Close inventory
/*==========================================*/
document.querySelector(".close-inventory").addEventListener("click", function() {
	document.querySelector(".inventory").style.display = "none";
	document.querySelector(".target-slot").classList.remove("target-slot");
});

document.querySelector("#soulbar").addEventListener("click", async function(e) {
	if (e.target.matches(".slot") && !e.target.matches(".locked-slot")) {
		e.target.classList.add("target-slot")
		await generateInventory();
		document.querySelector(".inventory").style.display = "flex";
	}
})

/*==========================================*/
// Use item
/*==========================================*/
document.querySelector(".inventory").addEventListener("click", async function(e) {

	if (e.target.closest(".inventory-item")) {
		const itemId = e.target.closest(".inventory-item").dataset.item;
		await useitem(itemId);
		document.querySelector(".inventory").style.display = "none";
	}
})