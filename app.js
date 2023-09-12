/* ··········································································*/
/* ··········································································*/
/* ···························  I M P O R T S  ······························*/
/* ··········································································*/
/* ··········································································*/
import { goTo, shuffleArray } from "./helpers.js";
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

displayFate();


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
		el.textContent = state.player.fateLeft;
	});
}


/*==========================================*/
// Set level
/*==========================================*/
function createLvlArray(lvl) {
	return new Promise((resolve, reject) => {
		try {
			// Get mob array
			const mobArray = db.mobs.filter((x) => x.spawn.includes(lvl));

			// Create saferooms array
			const lvlData = db.levels.find((x) => x.name === lvl);
			const saferoomsArray = [
				...Array(lvlData.stores).fill({ type: "store" }),
				...Array(lvlData.chests).fill({ type: "chest" }),
				...lvlData.doors.map((door) => ({ type: "door", level: door })),
			];

			// Combine mob and saferoom arrays and shuffle them
			const levelArray = [...mobArray, ...saferoomsArray];
			shuffleArray(levelArray);

			resolve(levelArray);
		} catch (error) {
			reject(error);
		}
	});
}

// Function to generate paths
function generatePaths(levelArray) {
	return new Promise((resolve, reject) => {
		try {
			const crossroads = document.querySelector("#crossroad");
			crossroads.innerHTML = "";

			// Path builder
			for (let i = 0; i < 3; i++) {
				let path = document.createElement("div");
				path.id = "path" + (i + 1);
				path.classList.add("path");

				let roomName;
				let btnTxt;

				//MOB
				if (levelArray[0].type === "mob") {
					roomName = levelArray[0].name;
					btnTxt = "Fight";
					path.dataset.pathtype = "encounter";
					path.dataset.mobname = roomName;
				
				//STORE
				} else if (levelArray[0].type === "store") {
					roomName = "Store";
					btnTxt = "Enter";
					path.dataset.pathtype = "store";

				//CHEST
				} else if (levelArray[0].type === "chest") {
					roomName = "Chest";
					btnTxt = "Open";
					path.dataset.pathtype = "chest";

				//DOOR
				} else if (levelArray[0].type === "door") {
					let lvl = levelArray[0].level;
					let lvlName = db.levels.find((x) => x.name === lvl).name;
					roomName = "Go to " + lvlName;
					btnTxt = "Exit";
					path.dataset.pathtype = "door";
					path.dataset.door = lvlName;
				}

				const roomTitle = /*html*/`
					<p class="pathTitle">${roomName}</p>
					<button>${btnTxt}</button>
					<button data-skip-path>Skip</button>
				`;

				path.insertAdjacentHTML('beforeend', roomTitle);
				crossroads.appendChild(path);

				levelArray.shift();
			}
			resolve();
		} catch (error) {
			reject(error);
		}
	});
}

async function setLevel(lvl) {
    try {
        const levelArray = await createLvlArray(lvl);
        await generatePaths(levelArray);
        goTo("crossroad");
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

/*==========================================*/
// Load encounter
/*==========================================*/
async function generateEncounterCard(mobname) {
	return new Promise((resolve, reject) => {
		try {

			//UI & data
			document.querySelector(".change-fate").disabled = true;
			document.querySelector(".secondary-action").style.display = "none";
			state.fatePrice = 1;
			document.querySelector(".fate-price").textContent = state.fatePrice;
			
			//MOB
			const mobject = db.mobs.find(mob => mob.name == mobname);
			state.currentMob = mobject;
			state.currentMob.soul = mobject.soul;
			state.currentMob.hp = mobject.lvl;
			const encounter = document.querySelector("#encounter");
			const nameEl = encounter.querySelector(".mobName");
			const descEl = encounter.querySelector(".mobDesc");
			const skillsEl = encounter.querySelector(".mobSkills");
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

			//HPs
			const mobHpEl = document.querySelector(".enemy-hp");
			const playerHpEl = document.querySelector(".player-hp");
			mobHpEl.innerHTML = "";
			for (let i = 0; i < state.currentMob.hp; i++) {
				let heart = document.createElement("span");
				heart.classList.add("heart");
				mobHpEl.appendChild(heart);
			}
			playerHpEl.innerHTML = "";
			for (let i = 0; i < state.player.hp; i++) {
				let heart = document.createElement("span");
				heart.classList.add("heart");
				playerHpEl.appendChild(heart);
			}

			//Discs
			generateDisc(mobject.soul, "#mobSoul");
			generateDisc(state.player.soul, "#playerSoul");
			document.querySelectorAll(".arrow").forEach(arrow => {
				arrow.style.transform = "translate(-50%, -100%) rotate(0deg)";
			});

			
			resolve();
		} catch (error) {
			console.log("An error occurred generating the encounter: " + error.message);
			reject(error);
		}
	})
}

async function loadEncounter(mobname) {
    try {
        await generateEncounterCard(mobname);
        goTo("encounter");
		toggleTurn("player")
    } catch (error) {
        console.error("An error occurred when trying to load the encounter: " + error);
    }
}

/*==========================================*/
// Turn System
/*==========================================*/
async function toggleTurn(whosTurn) {
	if (whosTurn === "player") {
		document.querySelector("#playerBoard .main-action").style.display = "flex";
		document.querySelector("#playerBoard .secondary-action").style.display = "none";
		document.querySelector("#playerBoard .no-action").style.display = "none";
	}

	if (whosTurn === "mob") {
		document.querySelector("#playerBoard .main-action").style.display = "none";
		document.querySelector("#playerBoard .secondary-action").style.display = "none";
		document.querySelector("#playerBoard .no-action").style.display = "flex";
		enemyAttack();
	}
}

async function secondaryAction() {
	if (state.player.fateLeft >= state.fatePrice) {
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
			const attackResult = await spin("mobSoul");
			if (attackResult === 1) {
				secondaryAction();
			} else {
				damageToEnemy();
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

	//Temporarily disable button
	fateBtn.disabled = true;
	endBtn.disabled = true;

	//Subtract fate
	state.player.fateLeft = state.player.fateLeft - state.fatePrice;

	//Update fate
	displayFate();

	//Double the price
	state.fatePrice = state.fatePrice * 2;

	//Update fate button
	document.querySelector(".fate-price").textContent = state.fatePrice;

	//Spin
	const attackResult = await spin("mobSoul");
	if (attackResult === 1) {
		//Enable buttons back
		if (state.player.fateLeft >= state.fatePrice) {
			fateBtn.disabled = false;
		}
	} else {
		damageToEnemy();
	}
	endBtn.disabled = false;
}

/*==========================================*/
// Damage to mob
/*==========================================*/
async function damageToEnemy() {
	state.currentMob.hp--;
	const hearts = document.querySelectorAll('.enemy-hp > .heart');
	const lastHeart = hearts[hearts.length - 1];
	lastHeart.classList.remove("heart");
	lastHeart.classList.add("empty-heart");
	if (state.currentMob.hp > 0) {
		toggleTurn("mob");
	} else {
		goTo("crossroad");
	}
}

/*==========================================*/
// Damage to player
/*==========================================*/
async function damageToPlayer() {
	state.player.hp--;
	const hearts = document.querySelectorAll('.player-hp > .heart');
	const lastHeart = hearts[hearts.length - 1];
	lastHeart.classList.remove("heart");
	lastHeart.classList.add("empty-heart");
	if (state.player.hp > 0) {
		toggleTurn("player");
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
			const attackResult = await spin("playerSoul");
			if (attackResult === 1) {
				toggleTurn("player");
			} else {
				damageToPlayer();
			}
			resolve();
		} catch (error) {
			console.log("An error occurred during attack: " + error.message);
			reject(error);
		}
	});
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
	setLevel("home");
});

/*==========================================*/
// Path buttons
/*==========================================*/
document.querySelector("#crossroad").addEventListener("click", function (e) {
	const type = e.target.parentNode.dataset.pathtype;

	if (type === "encounter") {
		const mob = e.target.parentNode.dataset.mobname;
		loadEncounter(mob);
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
	console.log("clickity");
});

/*==========================================*/
// End turn
/*==========================================*/
document.querySelector(".end-turn").addEventListener("click", function () {
	toggleTurn("mob");
});