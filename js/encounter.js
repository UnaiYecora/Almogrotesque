/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ···························  I M P O R T S  ······························*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
import { goTo, updateHP, updateFate, updateMana, updateCoins, wait, removeSuccessDiscStates, secondaryAction, getSlotShortDesc, rand, heartPulse } from "./helpers.js";
import { db, state } from "./db.js";
import { generatePlayingDisc, spin, checkDiscsForMana } from "./discs.js";


/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ···················  E N C O U N T E R   S C R E E N  ····················*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/

/*===========================================================================*/
// Load encounter
/*===========================================================================*/
export async function loadEncounter(mobId) {
	try {
		// Reset player state
		state.player.cardsInUse = [];
		state.player.cardsManaPaid = [];
		state.player.mana = state.player.startingMana;
		state.player.shield = 0;
		state.player.poison = 0;
		state.fatePrice = 1;
		state.player.cardsThisEncounter = [...state.player.cards];

		// Generate the encounter card
		await generateEncounterCard(mobId);

		// Navigate to the encounter screen
		goTo("encounter");

		// Toggle the player's turn
		toggleTurn(true);
	} catch (error) {
		console.error("An error occurred when trying to load the encounter: " + error);
	}
}

/*===========================================================================*/
// Generate encounter UI
/*===========================================================================*/
async function generateEncounterCard(mobId) {
	return new Promise((resolve, reject) => {
		try {

			// Mob data
			const mobData = db.mobs[mobId];
			state.mob = { ...mobData, mana: 0, shield: 0, poison: 0, maxHp: mobData.hp, mobid: mobId };

			// Reset secondary action defaults
			const changeFateButton = document.querySelector(".change-fate");
			const secondaryAction = document.querySelector(".secondary-action");
			const fatePriceElement = document.querySelector(".fate-price");

			changeFateButton.disabled = true;
			secondaryAction.style.display = "none";
			fatePriceElement.textContent = state.fatePrice;

			// Player Slots
			const playerSlots = document.querySelector("#playerDiscs");
			playerSlots.innerHTML = "";
			for (let i = 0; i < state.player.slots; i++) {
				let newSlot = document.createElement("div");
				newSlot.classList.add("slot");
				playerSlots.append(newSlot);
			}
			playerSlots.style.display = "flex";

			// Mob slots
			const mobSlots = document.querySelector("#mobDiscs");
			mobSlots.innerHTML = "";
			for (let i = 0; i < mobData.slots; i++) {
				let newSlot = document.createElement("div");
				newSlot.classList.add("slot");
				mobSlots.append(newSlot);
			}
			mobDiscs.style.display = "none";

			// Random mob image and text rotations
			document.querySelector(".mob-image-wrapper").dataset.rotate = mobData.img_rotation;
			document.querySelector(".mob-info-wrapper").dataset.rotate = mobData.desc_rotation;

			// Mob image and description
			const encounter = document.querySelector("#encounter");
			encounter.querySelector(".mob-image").src = "./assets/img/mobs/" + mobId + ".png";
			encounter.querySelector(".mobName").textContent = mobData.name;
			encounter.querySelector(".mobDesc").textContent = mobData.desc;
			const skillsEl = encounter.querySelector(".mobSkills");
			skillsEl.innerHTML = mobData.skills.map(skill => `<p>+ ${skill}</p>`).join('');

			// Update HP
			updateHP();

			resolve();
		} catch (error) {
			console.log("An error occurred generating the encounter: " + error.message);
			reject(error);
		}
	})
}


/*===========================================================================*/
// Turn System
/*===========================================================================*/
export async function toggleTurn(start) {
	// Get elements
	const playerBoard = document.querySelector("#playerBoard");
	const mainAction = playerBoard.querySelector(".main-action");
	const secondaryAction = playerBoard.querySelector(".secondary-action");
	const noAction = playerBoard.querySelector(".no-action");
	const playerDiscs = document.querySelector("#playerDiscs");
	const mobDiscs = document.querySelector("#mobDiscs");
	const encounter = document.querySelector("#encounter");

	// Reset turn data
	await resetTemporalEffects();

	// Toggle turn
	if (!start) {
		state.turn = state.turn === "player" ? "mob" : "player";
	} else {
		state.turn = "player";
	}

	let turnCharacter;
	if (state.turn === "player") {
		turnCharacter = state.player;
	} else {
		turnCharacter = state.mob;
	}

	// Deal poison damage
	if (state.turn) {
		const poisonWrapper = encounter.querySelector(`.${state.turn}-hp .poison-wrapper`);
		const poisonAmountElement = poisonWrapper.querySelector(".poison-amount");
		turnCharacter.hp = Math.max(turnCharacter.hp - turnCharacter.poison, 0);
		turnCharacter.poison = Math.max(turnCharacter.poison - 1, 0);
		poisonAmountElement.textContent = turnCharacter.poison;
		await updateHP();
		if (state.mob.hp <= 0) {
			victory();
		}
	}

	// Hide poison if is at 0
	if (state.player.poison === 0) {
		document.querySelector("#encounter .player-hp .poison-wrapper").style.display = "none";
	}
	if (state.mob.poison === 0) {
		document.querySelector("#encounter .mob-hp .poison-wrapper").style.display = "none";
	}

	// Hide shield if is at 0
	if (state.player.shield === 0) {
		document.querySelector("#encounter .player-hp .shield-wrapper").style.display = "none";
	}
	if (state.mob.shield === 0) {
		document.querySelector("#encounter .mob-hp .shield-wrapper").style.display = "none";
	}

	// Remove un/successful states
	removeSuccessDiscStates();

	// Heart pulse
	heartPulse();

	// Check discs for mana
	checkDiscsForMana();

	// Reset UI
	if (state.turn === "player") {
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


/*===========================================================================*/
// Victory
/*===========================================================================*/
export async function victory() {
	state.turn = false;
	state.player.poison = 0;
	state.player.shield = 0;
	state.player.mana = 0;
	document.querySelector("#xpscreen").style.display = "flex";
	generateXpScreen();
}

/*===========================================================================*/
// Generate XP screen
/*===========================================================================*/
async function generateXpScreen() {
	return new Promise(async (resolve, reject) => {
		try {

			// Get elements
			const xpscreen = document.querySelector("#xpscreen");
			const lvl = xpscreen.querySelector(".lvl span");
			const [toTargetElement, targetElement] = xpscreen.querySelectorAll(".bar span");
			const bar = xpscreen.querySelector(".progress");
			const reward = document.querySelector("#xpscreen .reward span");
			const lvlUpReward = document.querySelectorAll(".lvl-up-reward");


			// Update player's coins and display reward
			// TO-DO: Rewards per mob, or standar reward for each mob (with rand variation)
			const coinsReward = state.mob.lvl;
			state.player.coins += coinsReward;
			reward.textContent = "+" + coinsReward;
			updateCoins();

			// Fetch XP data
			const lvlArr = db.xpTiers;
			let lvlIndex = state.player.lvl - 1;
			let target = lvlArr[lvlIndex + 1];
			const gainedXP = state.mob.lvl;
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
				state.player.maxHp += 5;
				state.player.hp = state.player.maxHp;
				state.player.fate += 10;
				updateFate();

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



/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ·························  F U N C T I O N S  ····························*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/

/*===========================================================================*/
// Reset temporal damage/heal/shield
/*===========================================================================*/
async function resetTemporalEffects() {
	return new Promise(async (resolve, reject) => {
		try {

			// Reset damage, piercing damage, heal, shield, and poison
			state.turnDamage = 0;
			state.turnDamage_self = 0;
			state.turnPiercingDamage = 0;
			state.turnPiercingDamage_self = 0;
			state.turnFireDamage = 0;
			state.turnHeal = 0;
			state.turnShield = 0;
			state.turnPoison = 0;
			state.turnFate = 0;
			state.turnMana = 0;
			state.turnManaToConsume = 0;
			state.turnRemoveAllShield = false;
			state.player.cardsToBanish = [];
			state.player.discsToEmpty = [];

			// Reset temporal damage and temporal heal bars
			document.querySelectorAll("#encounter .progress .damage-bar, .heal-bar").forEach(el => {
				el.style.width = "0%";
			});

			// Reset shields
			document.querySelector("#encounter .player-hp .shield-amount").textContent = state.player.shield;
			document.querySelector("#encounter .mob-hp .shield-amount").textContent = state.mob.shield;
			document.querySelectorAll("#encounter .shield-wrapper").forEach(el => {
				el.classList.remove("healed", "damaged");
			});

			// Reset poison
			document.querySelector("#encounter .player-hp .poison-amount").textContent = state.player.poison;
			document.querySelector("#encounter .mob-hp .poison-amount").textContent = state.mob.poison;

			// Reset mana
			updateMana();

			// Reset fate
			updateFate();

			resolve();
		} catch (error) {
			console.log("An error occurred during attack: " + error.message);
			reject(error);
		}
	});
}

/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ················  C A R D S,   S L O T S,   D I S C S  ···················*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/

/*===========================================================================*/
// Place card disc in slot
/*===========================================================================*/
export async function placeCardInSlot(cardId) {
	return new Promise(async (resolve, reject) => {
		try {

			// Get Elements
			const slot = document.querySelector(".target-slot");
			const disc = slot.querySelector(".disc");

			if (state.turn === "player") {

				// Remove old card from cards in use
				if (disc && disc.dataset.cardid) {
					state.player.cardsInUse = state.player.cardsInUse.filter(x => x !== disc.dataset.cardid);
				}

				// Add card to cards in use
				state.player.cardsInUse.push(cardId);
			}


			// Generate disc
			let newDisc = document.createElement("div");
			const randomID = "id-" + crypto.randomUUID();
			newDisc.id = randomID;

			// Add class
			newDisc.classList.add("disc");

			// Insert disc in slot
			slot.innerHTML = "";
			slot.append(newDisc);

			// Display short description
			const shortDesc = document.createElement("div");
			shortDesc.classList.add("slot-short-desc");
			shortDesc.innerHTML = getSlotShortDesc(cardId);
			slot.appendChild(shortDesc);

			// Modify classes
			slot.classList.remove("target-slot");
			slot.classList.add("charged");

			generatePlayingDisc(cardId, randomID);

			resolve();
		} catch (error) {
			console.log("An error occurred trying to place a card in a slot: " + error.message);
			reject(error);
		}
	})
};


/*===========================================================================*/
// Stop using card
/*===========================================================================*/
export async function stopUsingCard() {
	return new Promise(async (resolve, reject) => {
		try {

			// Get data
			const slot = document.querySelector(".target-slot");
			const cardId = document.querySelector(".target-slot .disc").dataset.cardid;

			// Remove from used cards
			state.player.cardsInUse = state.player.cardsInUse.filter(x => x !== cardId);

			// Remove element
			slot.classList.remove("charged");
			slot.innerHTML = "";

			resolve();
		} catch (error) {
			console.log("An error occurred trying to stop using a card: " + error.message);
			reject(error);
		}
	})
};



/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ····························  C O M B A T  ·······························*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/

/*===========================================================================*/
// Attack
/*===========================================================================*/
/////////////////
// Normal attack
/////////////////
export async function attack() {
	return new Promise(async (resolve, reject) => {
		try {
			// Hide main action
			const mainActionElement = document.querySelector("#playerBoard .main-action");
			mainActionElement.style.display = "none";

			// Spin discs
			await spinDiscs();

			// Display secondary action
			secondaryAction();

			resolve();
		} catch (error) {
			console.log("An error occurred during attack: " + error.message);
			reject(error);
		}
	});
}


/////////////////
// Change fate
/////////////////
export async function changeFate() {
	const fateBtn = document.querySelector(".change-fate");
	const endBtn = document.querySelector(".end-turn");

	// Clear disc states and reset effects
	removeSuccessDiscStates();
	await resetTemporalEffects();
	await wait(450);

	// Temporarily disable buttons
	fateBtn.disabled = true;
	endBtn.disabled = true;

	// Subtract fate and update it
	state.player.fate -= state.fatePrice;
	updateFate();

	// Double the price and update the button text
	state.fatePrice *= 2;
	document.querySelector(".fate-price").textContent = state.fatePrice;

	// Spin discs
	await spinDiscs();

	// Re-enable buttons if there's enough fate
	if (state.player.fate >= state.fatePrice) {
		fateBtn.disabled = false;
	}

	endBtn.disabled = false;
}

/////////////////
// Enemy attack
/////////////////
async function enemyAttack() {
	return new Promise(async (resolve, reject) => {
		try {

			let patternsArray = [];

			const matchingPatterns = state.mob.patterns.filter(pattern => pattern.condition(state.mob, state.player));

			if (matchingPatterns.length > 0) {
				matchingPatterns.forEach(pattern => {
					patternsArray = [...patternsArray, ...pattern.attacks];
				});
			} else {
				patternsArray = [...patternsArray, ...state.mob.patterns[0].attacks];
			}

			const pattern = patternsArray[Math.floor(Math.random() * patternsArray.length)];
			const slots = document.querySelectorAll("#mobDiscs .slot");

			for (let i = 0; i < slots.length; i++) {
				const slot = slots[i];

				slot.classList.add("target-slot");
				await wait(await rand(200, 1200));
				await placeCardInSlot(pattern[i]);
			}

			await wait(1200);
			await spinDiscs();
			await wait(1200);
			await applyDiscsEffects();

			toggleTurn();

			resolve();
		} catch (error) {
			console.log("An error occurred during the enemy's attack: " + error.message);
			reject(error);
		}
	});
}

/*===========================================================================*/
// Spin discs and call the effects of each one
/*===========================================================================*/
async function spinDiscs() {
	return new Promise(async (resolve, reject) => {
		try {

			const turnCharacter = state.turn;
			const discSelector = `#${turnCharacter}Discs .slot.charged`;
			const discs = document.querySelectorAll(discSelector);

			for (const disc of discs) {
				// Get elements
				const discId = disc.querySelector(".disc").id;
				const discElement = document.getElementById(discId);

				// Spin if anough mana
				if (!discElement.classList.contains("requires-mana")) {

					// Spin the disc
					const result = await spin(discId);

					// Dynamically call the effect method based on cardId
					const cardId = discElement.dataset.cardid;
					const effects = new Effects(result, cardId, discElement);
					if (effects[cardId] && typeof effects[cardId] === 'function') {
						await effects[cardId]();
					} else {
						console.error(`Unknown card ID: ${cardId}`);
					}

				}

				discElement.classList.add("spun");

				// Check for mana
				await checkDiscsForMana(discId);
			}

			resolve();
		} catch (error) {
			console.log("An error occurred during attack: " + error.message);
			reject(error);
		}
	});
}


/*===========================================================================*/
// Apply discs' effects
/*===========================================================================*/
export async function applyDiscsEffects() {
	return new Promise(async (resolve, reject) => {
		try {

			/////////////////
			// Get turn targets
			/////////////////
			const isPlayerTurn = state.turn === "player";
			const self = isPlayerTurn ? state.player : state.mob;
			const target = isPlayerTurn ? state.mob : state.player;


			/////////////////
			// Deal damage
			/////////////////

			// Apply shield to reduce damage
			const shield = target.shield;
			const remainingDamage = Math.max(0, state.turnDamage - shield);
			target.shield = Math.max(0, shield - state.turnDamage);

			// Calculate the total damage
			const totalDamage = state.turnPiercingDamage + state.turnFireDamage + remainingDamage;

			// Deal damage to the target
			target.hp = Math.max(target.hp - totalDamage, 0);

			// Reset health bars
			document.querySelectorAll(".damage-bar").forEach(el => {
				el.style.width = "0%";
			});

			// Log damage
			console.log("Initial damage: " + (state.turnDamage + state.turnPiercingDamage + state.turnFireDamage) + ". Dealt: " + totalDamage + ".");


			/////////////////
			// Take self damage
			/////////////////

			// Apply shield to reduce damage
			const selfShield = self.shield;
			const remainingSelfDamage = Math.max(0, state.turnDamage_self - selfShield);
			self.shield = Math.max(0, selfShield - state.turnDamage_self);

			// Calculate the total damage
			const totalSelfDamage = state.turnPiercingDamage_self + remainingSelfDamage;

			// Deal damage to the target
			self.hp = Math.max(self.hp - totalSelfDamage, 0);

			// Reset health bars
			document.querySelectorAll(".damage-bar").forEach(el => {
				el.style.width = "0%";
			});


			/////////////////
			// Heals
			/////////////////
			self.hp = Math.min(self.hp + state.turnHeal, self.maxHp);
			document.querySelectorAll(".heal-bar").forEach(el => { el.style.width = "0%"; });


			/////////////////
			// Shield
			/////////////////
			if (state.turnRemoveAllShield) {
				self.shield = 0;
			}
			self.shield = self.shield + state.turnShield;
			state.turnShield = 0;


			/////////////////
			// Poison
			/////////////////
			target.poison = target.poison + state.turnPoison;
			state.turnPoison = 0;


			/////////////////
			// Gain/Consume mana
			/////////////////
			const finalMana = self.mana + state.turnMana - state.turnManaToConsume;
			self.mana = finalMana;
			state.turnMana = 0;
			state.turnManaToConsume = 0;
			updateMana();


			/////////////////
			// Gain fate
			/////////////////
			if (state.turnFate && state.turnFate > 0) {
				state.player.fate += state.turnFate;
				state.turnFate = 0;
			}
			updateFate();

			/////////////////
			// Banish
			/////////////////
			state.player.cardsThisEncounter = state.player.cardsThisEncounter.filter(item => !state.player.cardsToBanish.includes(item));
			state.player.cardsToBanish = [];
			state.player.discsToEmpty.forEach(disc => {
				const slot = disc.parentElement;
				slot.innerHTML = "";
				slot.classList.remove("charged");
			});

			await updateHP();

			resolve();
		} catch (error) {
			console.log("An error occurred during attack: " + error.message);
			reject(error);
		}
	});
}


/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ······················  C A R D   E F F E C T S  ·························*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
class Effects {

	/////////////////
	// Constructor
	/////////////////
	constructor(result, cardId, disc) {
		this.result = result;
		this.cardId = cardId;
		this.disc = disc;
	}

	/////////////////
	// Helper functions
	/////////////////
	successful() {
		this.disc.parentElement.classList.add("successful");

		// Consume mana
		const manaCost = db.cards[this.cardId].mana_cost;
		if (manaCost > 0) {
			state.turnManaToConsume += manaCost;
			this.mana();
		}
	}
	unsuccessful() {
		this.disc.parentElement.classList.add("unsuccessful");
	}

	/////////////////
	// Common effects
	/////////////////
	damage(amount) {
		let target;
		let tempBar;
		let shield;
		let shieldEl;
		if (state.turn === "player") {
			target = state.mob;
			tempBar = document.querySelector("#encounter .mob-hp .progress .damage-bar");
			shieldEl = document.querySelector("#encounter .mob-hp .shield-wrapper");
		} else {
			target = state.player;
			tempBar = document.querySelector("#encounter .player-hp .progress .damage-bar");
			shieldEl = document.querySelector("#encounter .player-hp .shield-wrapper");
		}

		shield = target.shield;

		// Get damage of this card
		let damageAmount = (amount === undefined) ? (db.cards[this.cardId].damage || 0) : amount;

		// Add damage to this turn's previous damage
		state.turnDamage += damageAmount;

		// Display damaged shield
		state.turnDamage > 0 ? shieldEl.classList.add("damaged") : shieldEl.classList.remove("damaged");

		// Subtract damage from shield
		if (shield > 0) {
			shieldEl.querySelector(".shield-amount").textContent = Math.max(shield - state.turnDamage, 0);
		}

		// Get remaining damage after shield
		let remainingDamage;
		if (shield >= state.turnDamage) {
			remainingDamage = 0;
		} else {
			remainingDamage = state.turnDamage - shield;
		}

		const totalDamage = state.turnPiercingDamage + state.turnFireDamage + remainingDamage;

		// Display damage on health bar
		tempBar.style.width = totalDamage / target.hp * 100 + "%";
	}

	selfDamage(amount){
		let target;
		let tempBar;
		let shield;
		let shieldEl;
		if (state.turn === "player") {
			target = state.mob;
			tempBar = document.querySelector("#encounter .player-hp .progress .damage-bar");
			shieldEl = document.querySelector("#encounter .player-hp .shield-wrapper");
		} else {
			target = state.player;
			tempBar = document.querySelector("#encounter .mob-hp .progress .damage-bar");
			shieldEl = document.querySelector("#encounter .mob-hp .shield-wrapper");
		}

		shield = target.shield;

		// Get damage of this card
		let damageAmount = (amount === undefined) ? (db.cards[this.cardId].damage || 0) : amount;

		// Add damage to this turn's previous damage
		state.turnDamage_self += damageAmount;

		// Display damaged shield
		state.turnDamage_self > 0 ? shieldEl.classList.add("damaged") : shieldEl.classList.remove("damaged");

		// Subtract damage from shield
		if (shield > 0) {
			shieldEl.querySelector(".shield-amount").textContent = Math.max(shield - state.turnDamage_self, 0);
		}

		// Get remaining damage after shield
		let remainingDamage;
		if (shield >= state.turnDamage_self) {
			remainingDamage = 0;
		} else {
			remainingDamage = state.turnDamage_self - shield;
		}

		// Display damage on health bar
		tempBar.style.width = (state.turnPiercingDamage_self + remainingDamage) / target.hp * 100 + "%";
	}

	piercingDamage(amount) {
		let target;
		let tempBar;
		let shield;
		if (state.turn === "player") {
			target = state.mob;
			tempBar = document.querySelector("#encounter .mob-hp .progress .damage-bar");
		} else {
			target = state.player;
			tempBar = document.querySelector("#encounter .player-hp .progress .damage-bar");
		}
		
		shield = target.shield;

		// Get damage of this card
		let damageAmount = (amount === undefined) ? (db.cards[this.cardId].damage || 0) : amount;

		// Add damage to this turn's previous damage
		state.turnPiercingDamage += damageAmount;

		// Get non-piercing damage to add it up
		// Get remaining damage after shield
		let remainingDamage;
		if (shield >= state.turnDamage) {
			remainingDamage = 0;
		} else {
			remainingDamage = state.turnDamage - shield;
		}

		const totalDamage = state.turnPiercingDamage + state.turnFireDamage + remainingDamage;

		// Display damage on health bar
		tempBar.style.width = totalDamage / target.hp * 100 + "%";
	}

	selfPiercingDamage(amount) {
		let target;
		let tempBar;
		let shield;
		if (state.turn === "player") {
			target = state.player;
			tempBar = document.querySelector("#encounter .player-hp .progress .damage-bar");
		} else {
			target = state.mob;
			tempBar = document.querySelector("#encounter .mob-hp .progress .damage-bar");
		}
		
		shield = target.shield;

		// Get damage of this card
		let damageAmount = (amount === undefined) ? (db.cards[this.cardId].damage || 0) : amount;

		// Add damage to this turn's previous damage
		state.turnPiercingDamage_self += damageAmount;

		// Get non-piercing damage to add it up
		// Get remaining damage after shield
		let remainingDamage;
		if (shield >= state.turnDamage_self) {
			remainingDamage = 0;
		} else {
			remainingDamage = state.turnDamage_self - shield;
		}

		// Display damage on health bar
		tempBar.style.width = (state.turnPiercingDamage_self + remainingDamage) / target.hp * 100 + "%";
	}

	fireDamage(amount){
		let target;
		let tempBar;
		let shield;
		if (state.turn === "player") {
			target = state.mob;
			tempBar = document.querySelector("#encounter .mob-hp .progress .damage-bar");
		} else {
			target = state.player;
			tempBar = document.querySelector("#encounter .player-hp .progress .damage-bar");
		}
		
		shield = target.shield;

		// Get damage of this card
		let fireDamageAmount = (amount === undefined) ? (db.cards[this.cardId].fire_damage || 0) : amount;

		// Add damage to this turn's previous damage
		state.turnFireDamage += fireDamageAmount + Math.floor(fireDamageAmount * target.fire / 100);

		// Get non-piercing damage to add it up
		// Get remaining damage after shield
		let remainingDamage;
		if (shield >= state.turnDamage) {
			remainingDamage = 0;
		} else {
			remainingDamage = state.turnDamage - shield;
		}

		const totalDamage = state.turnFireDamage + state.turnPiercingDamage + remainingDamage;

		// Display damage on health bar
		tempBar.style.width = totalDamage / target.hp * 100 + "%";
	}

	heal(amount) {
		let tempBar;
		let self;
		if (state.turn === "player") {
			self = state.player;
			tempBar = document.querySelector("#encounter .player-hp .heal-bar");
		} else {
			self = state.mob;
			tempBar = document.querySelector("#encounter .mob-hp .heal-bar");
		}

		let maxHP = self.maxHp;
		let lostHP = maxHP - self.hp;
		let maxHealBarSize = lostHP / maxHP * 100;

		let healAmount = (amount === undefined) ? (db.cards[this.cardId].heal || 0) : amount;
		state.turnHeal += healAmount;

		tempBar.style.width = Math.min(state.turnHeal / self.maxHp * 100, maxHealBarSize) + "%";
	}

	shield(amount) {
		let shieldEl;
		let previousShield;
		if (state.turn === "player") {
			shieldEl = document.querySelector("#encounter .player-hp .shield-wrapper");
			previousShield = state.turnRemoveAllShield ? 0 : state.player.shield;
		} else {
			shieldEl = document.querySelector("#encounter .mob-hp .shield-wrapper");
			previousShield = state.turnRemoveAllShield ? 0 : state.mob.shield;
		}

		let shieldAmount = (amount === undefined) ? (db.cards[this.cardId].shield || 0) : amount;
		state.turnShield += shieldAmount;

		shieldEl.style.display = "flex";

		shieldEl.querySelector(".shield-amount").textContent = previousShield + state.turnShield;
		shieldEl.classList.add("healed");
	}

	poison(amount) {
		let target;
		let poisonEl;
		if (state.turn === "player") {
			target = state.mob;
			poisonEl = document.querySelector("#encounter .mob-hp .poison-wrapper");
		} else {
			target = state.player;
			poisonEl = document.querySelector("#encounter .player-hp .poison-wrapper");
		}

		let poisonAmount = (amount === undefined) ? (db.cards[this.cardId].poison || 0) : amount;
		state.turnPoison += poisonAmount;

		poisonEl.style.display = "flex";

		poisonEl.querySelector(".poison-amount").textContent = target.poison + state.turnPoison;
	}

	banish() {
		state.player.cardsToBanish.push(this.cardId);
		state.player.discsToEmpty.push(this.disc);
	}

	fate(amount) {

		let fateAmount = (amount === undefined) ? (db.cards[this.cardId].fate || 0) : amount;
		state.turnFate += fateAmount;

		document.querySelector("#encounter .fate-left").textContent = state.player.fate + state.turnFate;
	}

	mana(amount) {
		let target;
		let manaLeftElement;
		if (state.turn === "player") {
			target = state.player;
			manaLeftElement = document.querySelector("#encounter .bottombar .mana-left");
		} else {
			target = state.mob;
			state.mob.mana = state.mob.mana ? state.mob.mana : 0;
			manaLeftElement = document.querySelector("#encounter .topbar .mana-left");
		}

		let manaAmount = (amount === undefined) ? (db.cards[this.cardId].mana || 0) : amount;
		state.turnMana += manaAmount;

		manaLeftElement.textContent = target.mana + state.turnMana - state.turnManaToConsume;
	}

	/////////////////
	// Effecs by card
	/////////////////
	basic_attack_1() {
		let amount;
		switch (this.result) {
			case 1:
				amount = db.cards[this.cardId].damage;
				this.successful();
				this.damage(amount);
				break;
			case 2:
				amount = db.cards[this.cardId].damage2;
				this.successful();
				this.damage(amount);
				break;
			case 3:
				amount = db.cards[this.cardId].damage3;
				this.successful();
				this.damage(amount);
				break;
		}
	}
	basic_attack_2() {
		let amount;
		switch (this.result) {
			case 1:
				this.unsuccessful();
				break;
			case 2:
				this.successful();
				this.piercingDamage();
				break;
			case 3:
				amount = db.cards[this.cardId].damage2;
				this.successful();
				this.piercingDamage(amount);
				break;
		}
	}
	heal_1() {
		let amount;
		switch (this.result) {
			case 1:
				this.unsuccessful();
				break;
			case 2:
				amount = db.cards[this.cardId].heal;
				this.heal(amount);
				this.successful();
				break;
			case 3:
				amount = db.cards[this.cardId].heal2;
				this.heal(amount);
				this.successful();
				break;
		}
	}
	double_damage() {
		switch (this.result) {
			case 1:
				state.turnDamage = state.turnDamage * 2;
				state.turnPiercingDamage = state.turnPiercingDamage * 2;
				this.damage();
				this.successful();
				break;
			case 2:
				state.turnDamage = 0;
				state.turnPiercingDamage = 0;
				this.damage();
				this.successful();
				break;
		}
	}
	attack_heal() {
		switch (this.result) {
			case 1:
				this.unsuccessful();
				break;
			case 2:
				this.damage();
				this.successful();
				break;
			case 3:
				this.heal();
				this.successful();
				break;
		}
	}
	eldertide_timepiece() {
		switch (this.result) {
			case 1:
				this.unsuccessful();
				break;
			case 2:
				this.fate();
				this.successful();
				break;
		}
	}
	mana1() {
		switch (this.result) {
			case 1:
				this.unsuccessful();
				break;
			case 2:
				this.mana();
				this.successful();
				break;
		}
	}
	bat_bite() {
		switch (this.result) {
			case 1:
				this.unsuccessful();
				break;
			case 2:
				this.damage();
				this.successful();
				break;
		}
	}
	shield1() {
		switch (this.result) {
			case 1:
				this.unsuccessful();
				break;
			case 2:
				this.shield();
				this.successful();
				break;
		}
	}
	poison1() {
		switch (this.result) {
			case 1:
				this.unsuccessful();
				break;
			case 2:
				this.poison();
				this.successful();
				break;
		}
	}
	poison2() {
		let amount;
		switch (this.result) {
			case 1:
				this.unsuccessful();
				break;
			case 2:
				amount = db.cards[this.cardId].poison;
				this.poison(amount);
				this.successful();
				break;
			case 3:
				amount = db.cards[this.cardId].poison2;
				this.poison(amount);
				this.successful();
				break;
		}
	}
	shield_attack() {
		switch (this.result) {
			case 1:
				this.unsuccessful();
				break;
			case 2:
				let shieldEl;
				let previousShield;
				if (state.turn === "player") {
					shieldEl = document.querySelector("#encounter .player-hp .shield-wrapper");
					previousShield = state.player.shield;
				} else {
					shieldEl = document.querySelector("#encounter .mob-hp .shield-wrapper");
					previousShield = state.mob.shield;
				}

				if (!state.turnRemoveAllShield) {
					state.turnDamage += previousShield + state.turnShield;
				} else {
					state.turnDamage += state.turnShield;
				}
				state.turnRemoveAllShield = true;
				state.turnShield = 0;
				shieldEl.querySelector(".shield-amount").textContent = 0;
				shieldEl.classList.add("damaged");

				this.damage();
				this.successful();
				break; 0
		}
	}
	damage_to_piercing() {
		switch (this.result) {
			case 1:
				this.unsuccessful();
				break;
			case 2:
				state.turnPiercingDamage += state.turnDamage;
				state.turnDamage = 0;
				this.damage();
				this.successful();
				break;
		}
	}
	hp_loss_to_damage() {
		switch (this.result) {
			case 1:
				this.unsuccessful();
				break;
			case 2:
				const hp = state.turn === "player" ? state.player.hp : state.mob.hp;
				const maxhp = state.turn === "player" ? state.player.maxHp : state.mob.maxHp;
				const hplost = maxhp - hp;
				const damageToMultiply = db.cards.hp_loss_to_damage.damage;
				const hpLostToMultiply = db.cards.hp_loss_to_damage.hploss;

				const damage = Math.floor(hplost / hpLostToMultiply) * damageToMultiply;
				this.damage(damage);
				this.successful();
				break;
		}
	}
	affliction_advantage() {
		switch (this.result) {
			case 1:
				this.unsuccessful();
				break;
			case 2:
				const poison = state.turn === "player" ? state.mob.poison : state.player.poison;
				if (poison <= 0) {
					this.damage(db.cards.affliction_advantage.damage)
				} else {
					this.piercingDamage(db.cards.affliction_advantage.damage2);
				}
				this.successful();
				break;
		}
	}
	deffensive_stance() {
		switch (this.result) {
			case 1:
				this.unsuccessful();
				break;
			case 2:
				if (state.turnDamage || state.turnPiercingDamage || state.turnFireDamage) {
					this.shield();
				}
				this.successful();
				break;
		}
	}
	plague() {
		switch (this.result) {
			case 1:
				this.unsuccessful();
				break;
			case 2:
				state.turn === "player" ? this.poison(state.mob.poison + state.turnPoison) : this.poison(state.player.poison + state.turnPoison);
				this.banish();
				this.successful();
				break;
		}
	}
	exasperater() {
		switch (this.result) {
			case 1:
				this.unsuccessful();
				break;
			case 2:
				state.turn === "player" ? state.mob.mana = 0 : state.player.mana = 0;
				const targetManaEl = state.turn === "player" ? document.querySelector("#encounter .topbar .mana-left") : document.querySelector("#encounter .bottombar .mana-left");
				targetManaEl.textContent = 0;
				this.successful();
				break;
		}
	}
	rotten_soul() {
		switch (this.result) {
			case 1:
				this.unsuccessful();
				break;
			case 2:
				let target;
				let damageAmount;
				target = state.turn === "player" ? state.mob : state.player;
				damageAmount = target.mana;
				target.mana = 0;
				const targetManaEl = state.turn === "player" ? document.querySelector("#encounter .topbar .mana-left") : document.querySelector("#encounter .bottombar .mana-left");
				targetManaEl.textContent = 0;
				this.damage(damageAmount);
				this.successful();
				break;
		}
	}
	aggressive_stance(){
		switch (this.result) {
			case 1:
				this.selfPiercingDamage(db.cards.aggressive_stance.self_damage, true);
				this.piercingDamage(db.cards.aggressive_stance.damage);
				this.successful();
				break;
				case 2:
				this.selfPiercingDamage(db.cards.aggressive_stance.self_damage, true);
				this.piercingDamage(db.cards.aggressive_stance.damage2);
				this.successful();
				break;
				case 3:
				this.selfPiercingDamage(db.cards.aggressive_stance.self_damage, true);
				this.piercingDamage(db.cards.aggressive_stance.damage3);
				this.successful();
				break;
		}
	}
	pyreburst(){
		switch (this.result) {
			case 1:
				this.unsuccessful();
				break;
			case 2:
				this.fireDamage();
				this.successful();
				break;
		}
	}
	embersteel(){
		switch (this.result) {
			case 1:
				this.unsuccessful();
				break;
			case 2:
				const previousDamage = state.turnDamage + state.turnPiercingDamage;
				const target = state.turn === "player" ? state.mob : state.player;
				state.turnFireDamage += previousDamage + Math.floor(previousDamage * target.fire / 100);
				state.turnPiercingDamage = 0;
				state.turnDamage = 0;
				this.fireDamage();
				this.successful();
				break;
		}
	}
	fireseal(){
		switch (this.result) {
			case 1:
				this.unsuccessful();
				break;
			case 2:
				this.shield();
				this.successful();
				break;
			case 3:
				this.shield();
				this.fireDamage();
				this.successful();
				break;
		}
	}
	drinkin(){
		switch (this.result) {
			case 1:
				this.unsuccessful();
				break;
			case 2:
				this.heal();
				this.damage();
				this.successful();
				break;
		}
	}
}