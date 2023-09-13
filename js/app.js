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

			emptyPaths.forEach(path => {
				if (levelArray.length > 0) {

					const roomName = path.querySelector(".pathTitle");
					const btnTxt = path.querySelector(".main-path-button");

					//MOB
					if (levelArray[0].type === "mob") {
						roomName.textContent = levelArray[0].name;
						btnTxt.textContent = "Fight";
						path.dataset.pathtype = "encounter";
						path.dataset.mobname = levelArray[0].name;
						path.dataset.skippable = true;
					}

					//STORE
					else if (levelArray[0].type === "store") {
						roomName.textContent = "Store";
						btnTxt.textContent = "Enter";
						path.dataset.pathtype = "store";
						path.dataset.skippable = true;
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

					path.dataset.filled = true;

					levelArray.shift();
					
				} else {
					path.style.visibility = "hidden";
				}
			});

			resolve();
		} catch (error) {
			reject(error);
		}
	});
}

async function setLevel(lvl) {
    try {
        await createLvlArray(lvl);
        await fillPaths();
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

			//Enemy HP
			const mobHpEl = document.querySelector(".enemy-hp");
			const mobHpFull = mobHpEl.querySelector(".full");
			const mobHpEmpty = mobHpEl.querySelector(".empty");
			mobHpFull.innerHTML = "";
			mobHpEmpty.innerHTML = "";
			for (let i = 0; i < state.currentMob.hp; i++) {
				let fullHeart = document.createElement("span");
				fullHeart.classList.add("heart");
				mobHpFull.appendChild(fullHeart);
				let emptyHeart = document.createElement("span");
				emptyHeart.classList.add("empty-heart");
				mobHpEmpty.appendChild(emptyHeart);
			}

			//Player HP
			const playerHpEl = document.querySelector(".player-hp");
			const playerHpFull = playerHpEl.querySelector(".full");
			const playerHpEmpty = playerHpEl.querySelector(".empty");
			playerHpFull.innerHTML = "";
			playerHpEmpty.innerHTML = "";
			for (let i = 0; i < state.player.hp; i++) {
				let heart = document.createElement("span");
				heart.classList.add("heart");
				playerHpFull.appendChild(heart);
			}
			for (let i = 0; i < (state.player.maxHp); i++) {
				let heart = document.createElement("span");
				heart.classList.add("empty-heart");
				playerHpEmpty.appendChild(heart);
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
	const hearts = document.querySelectorAll('.enemy-hp > .full > .heart');
	const lastHeart = hearts[hearts.length - 1];
	
	let particlesOpts = {
		particlesAmountCoefficient: 1,
		direction: "bottom",
		color: "red"
	};
	particlesOpts.complete = () => {
		lastHeart.classList.remove("heart");
		lastHeart.classList.add("empty-heart");
		lastHeart.style.transform = "unset";
		lastHeart.parentElement.style.transform = "unset";
		lastHeart.parentElement.style.visibility = "unset";
	};
	const particles = new Particles(lastHeart, particlesOpts);
	if ( !particles.isAnimating() ) {
		particles.disintegrate();
	}

	if (state.currentMob.hp > 0) {
		toggleTurn("mob");
	} else {
		killMob();
	}
}

/*==========================================*/
// Kill mob
/*==========================================*/
function killMob() {
	const mob = state.currentMob;
	const path = document.querySelector('#crossroad [data-mobname="'+ mob.name +'"]');
	goTo("crossroad");
	burnPath(path);
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
		lastHeart.classList.remove("heart");
		lastHeart.classList.add("empty-heart");
		lastHeart.style.transform = "unset";
		lastHeart.parentElement.style.transform = "unset";
		lastHeart.parentElement.style.visibility = "unset";
	};
	const particles = new Particles(lastHeart, particlesOpts);
	if ( !particles.isAnimating() ) {
		particles.disintegrate();
	}
	
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

/*==========================================*/
// Burn path
/*==========================================*/
function burnPath(pathToBurn) {
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
			path.classList.add("pathHide");
			pathContent.style.transform = "unset";
			path.appendChild(pathContent);
			path.querySelector(".particles").remove();
			pathContent.querySelector(".pathTitle").textContent = "";
			pathContent.querySelector(".main-path-button").textContent = "";
			path.dataset.filled = false;
			path.dataset.pathtype = "";
			path.dataset.mobname = "";
			path.dataset.door = "true";
			path.dataset.skippable = true;
			fillPaths();
			skipBtn.classList.remove("hideSkip")
			setTimeout(() => {
				path.classList.remove("pathHide");
			}, 100);
		};
		const particles = new Particles(pathContent, particlesOpts);
		if ( !particles.isAnimating() ) {
			particles.disintegrate();
		}
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
	setLevel("home");
});

/*==========================================*/
// Path buttons
/*==========================================*/
document.querySelector("#crossroad").addEventListener("click", function (e) {
	const path = e.target.closest(".path");
	if (path) {
		const type = path.dataset.pathtype;
		
		// Main button
		if (e.target.classList.contains("main-path-button")) {
			
			// Mob encounter
			if (type === "encounter") {
				const mob = path.dataset.mobname;
				loadEncounter(mob);
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
	console.log("clickity");
});

/*==========================================*/
// End turn
/*==========================================*/
document.querySelector(".end-turn").addEventListener("click", function () {
	toggleTurn("mob");
});

/*==========================================*/
// Skip path
/*==========================================*/
document.querySelectorAll("[data-skip-path]").forEach(el => {
	
	el.addEventListener("click", function() {
		burnPath(el.parentElement);
    })
});