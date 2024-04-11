/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ···························  I M P O R T S  ······························*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
import { goTo, shuffleArray, updateHP, updateFate, updateMana, updateCoins, wait, removeSuccessDiscStates, secondaryAction, rand, heartPulse, cardManaCheck, checkAttackAvailability, changeMusic, iconify } from "./helpers.js?v=0.27";
import { db, state, save, global, saveGlobal } from "./db.js?v=0.27";
import { generatePlayingDisc, spin, checkDiscsForMana } from "./discs.js?v=0.27";
import { generateCard } from "./inventory.js?v=0.27";
import { burnPath, fillPaths } from "./crossroad.js?v=0.27";
import { Draggable } from "./lib/drag.js?v=0.27";


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
		state.player.mana = state.player.startingMana;
		if (state.player.skills.includes("skillshield1")) {
			state.player.shield = 8;
			document.querySelector("#encounter .bottombar .shield-wrapper").style.display = "flex";
		} else {
			state.player.shield = 0;
		}
		if (state.player.skills.includes("skillfate1")) {
			state.player.fate += 3;
			updateFate();
		}
		state.fatePrice = state.startingFatePrice;
		state.player.poison = 0;
		state.player.hand = [];
		state.player.cemetery = [];
		state.player.deck = [];

		// Set deck
		state.player.deck = [...state.player.cards];
		shuffleArray(state.player.deck);

		// Generate the encounter card
		await generateEncounterCard(mobId);

		// Navigate to the encounter screen
		goTo("encounter");

		// Change music
		//changeMusic("crossroad", "battle1");

		// Save places visited stat
		if (!global.mobsSeen.includes(mobId)) {
			global.mobsSeen.push(mobId);
		}
		saveGlobal();

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

			// Get elements
			const changeFateButton = document.querySelector(".change-fate");
			const secondaryAction = document.querySelector(".secondary-action");
			const fatePriceElement = document.querySelector(".fate-price");
			const playerSlots = document.querySelector("#playerDiscs");
			const mobSlots = document.querySelector("#mobDiscs");
			const encounter = document.querySelector("#encounter");
			const conversation = encounter.querySelector("#conversation");
			const hand = document.querySelector("#playerBoard .hand");

			// Reset secondary action defaults
			changeFateButton.disabled = true;
			secondaryAction.style.display = "none";
			fatePriceElement.textContent = state.fatePrice;

			// Player Slots
			playerSlots.innerHTML = "";
			for (let i = 0; i < state.player.slots; i++) {
				let newSlot = document.createElement("div");
				newSlot.classList.add("slot");
				playerSlots.append(newSlot);
			}
			playerSlots.style.display = "flex";

			// Empty hand
			hand.innerHTML = "";

			// Mob slots
			mobSlots.innerHTML = "";
			for (let i = 0; i < mobData.slots; i++) {
				let newSlot = document.createElement("div");
				newSlot.classList.add("slot");
				mobSlots.append(newSlot);
			}
			mobDiscs.style.display = "none";

			// Update HP
			updateHP();

			// Mob image and name
			encounter.querySelector(".mob-image").src = "./assets/img/mobs/" + mobId + ".png";
			encounter.querySelector(".mobName").textContent = mobData.name;

			// Conversation mode
			conversation.querySelector(".message").innerHTML = "";
			conversation.querySelector(".options").innerHTML = "";
			if (mobData.dialog) {
				encounter.classList.add("on-conversation");
				conversation.classList.remove("hidden");
				startConversation();
			} else {
				encounter.classList.remove("on-conversation");
				conversation.classList.add("hidden");
			}

			resolve();
		} catch (error) {
			console.log("An error occurred generating the encounter: " + error.message);
			reject(error);
		}
	})
}

/*===========================================================================*/
// Conversations
/*===========================================================================*/
function startConversation() {
	const dialog = state.mob.dialog;
	display_message(dialog[0].m);
	display_options(dialog[0].a);
}

function display_message(m) {
	const messageElement = document.querySelector("#encounter #conversation .message");
	messageElement.innerHTML = iconify(m, false);
}

function display_options(a) {
	const optionsElement = document.querySelector("#encounter #conversation .options");
	optionsElement.innerHTML = "";

	a.forEach(answer => {
		let newBtn = document.createElement("button");
		newBtn.classList.add("btn");
		newBtn.innerHTML = iconify(answer.o);
		newBtn.addEventListener("click", function () {
			optionsElement.innerHTML = "";
			newBtn = null;

			const { end, m = "" } = answer;
			const type = end ? "end" : "next";
			let next = answer.next;
			if (next) {
				next = next.constructor === Array
					? next[Math.floor(Math.random() * next.length)]
					: next;
			}
			if (answer.run) {
				answer.run(state.mob, state.player);
				updateCoins();
			}
			continueConversation(type, next || end, m);
		})
		optionsElement.append(newBtn);
	});
}

async function continueConversation(type, next, m) {
	const dialog = state.mob.dialog;

	if (type === "next") {
		const current_line = dialog[find_label(next)];
		display_message(current_line.m);

		if (current_line.a) {
			display_options(current_line.a);
		}

		else if (current_line.end) {
			transitionConversation(current_line.end);
		}
	}

	else if (type === "end") {
		display_message(m);
		transitionConversation(next);
	}
}

async function transitionConversation(end) {
	await wait(2000);

	// Exit (no rewards)
	if (end === "exit") {
		const path = document.querySelector('#crossroad [data-mobid="' + state.mob.mobid + '"]');
		await goTo("crossroad");
		await burnPath(path);
		await fillPaths();

		// Win (rewards)
	} else if (end === "win") {
		victory();

		// Combat
	} else if (end === "combat") {
		document.querySelector("#encounter #conversation").classList.add("fade-out");
		document.querySelector("#encounter").classList.remove("on-conversation");

		setTimeout(() => {
			document.querySelector("#encounter #conversation .message").innerHTML = "";
			document.querySelector("#encounter #conversation .options").innerHTML = "";
			document.querySelector("#encounter #conversation").classList.remove("fade-out");
			document.querySelector("#encounter #conversation").classList.add("hidden");
		}, 800);

		// Store // TO-DO
	} else if (end === "store") {

		// Error
	} else {
		console.error("Type of conversation end not valid.")
	}
}

function find_label(label) {
	const dialog = state.mob.dialog;

	for (let i = 0; i < dialog.length; i++) {
		if (dialog[i].label === label) {
			return i;
		}
	}
	return -1;
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

	// End-of-turn passives
	if (!start && state.turn === "mob") {
		await passives(state.mob.mobid, "end");
	}
	if (!start && state.turn === "player") {
		if (state.player.skills.includes("skillshield2")) {
			state.player.shield += 2;
			document.querySelector("#encounter .bottombar .shield-wrapper").style.display = "flex";
			document.querySelector("#encounter .bottombar .shield-wrapper .shield-amount").textContent = state.player.shield;
		}
		if (state.player.skills.includes("skillshield3")) {
			state.player.shield += 3;
			document.querySelector("#encounter .bottombar .shield-wrapper").style.display = "flex";
			document.querySelector("#encounter .bottombar .shield-wrapper .shield-amount").textContent = state.player.shield;
		}
		if (state.player.skills.includes("skillheal1")) {
			state.player.hp += 5;
			state.player.hp = Math.min(state.player.hp + 5, state.player.maxHp);
			updateHP();
		}
		if (state.player.skills.includes("skillheal2")) {
			const lostHP = state.player.maxHp - state.player.hp;
			state.player.hp = Math.min(Math.ceil(state.player.hp + (lostHP * 10 / 100)), state.player.maxHp);
			updateHP();
		}
		if (state.player.skills.includes("skillmana4") && state.player.mana == 0) {
			state.player.mana = 1;
			updateMana();
		}
	}

	// Card hand limit
	if (!start && state.turn === "player") {
		await enforceHandLimit();
	}

	// Toggle turn
	if (!start) {
		state.turn = state.turn === "player" ? "mob" : "player";
	} else {
		state.turn = "player";
	}

	if (state.turn === "player") {
		document.querySelector("#encounter").classList.remove("midturn");
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
		if (state.player.hp <= 0) {
			death();
		} else if (state.mob.hp <= 0) {
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

	// Check if player is alive
	if (state.player.hp <= 0) {
		death();
	}

	if (state.turn === "mob") {
		//Move cards to cemetery
		document.querySelectorAll("#playerDiscs .slot.charged > .disc").forEach(usedCard => {
			let usedCardId = usedCard.dataset.cardid;
			state.player.cemetery.push(usedCardId);
		});
	}

	//Draw cards
	if (state.turn === "player") {
		for (let i = 0; i < state.player.slots; i++) {
			if (!state.player.deck[0] && state.player.cemetery[0]) {
				let cardsFromCemetery = [...state.player.cemetery];
				state.player.cemetery = [];
				shuffleArray(cardsFromCemetery);
				state.player.deck = [...cardsFromCemetery];
			}

			if (state.player.deck[0]) {
				state.player.hand.push(state.player.deck[0]);
				state.player.deck.shift();
			}
		}
		drawCards();
		state.player.hand = [];
	}

	// Heart pulse
	heartPulse();

	// Check discs for mana
	checkDiscsForMana();

	// Reset UI
	if (state.turn === "player") {
		mainAction.style.display = "flex";
		secondaryAction.style.display = "none";
		noAction.style.display = "none";
		state.fatePrice = state.startingFatePrice;
		document.querySelector(".fate-price").textContent = state.fatePrice;
		playerDiscs.style.display = "flex";
		mobDiscs.style.display = "none";
		document.querySelector(".main-action button").disabled = true;
	}

	else if (state.turn === "mob") {
		mainAction.style.display = "none";
		secondaryAction.style.display = "none";
		noAction.style.display = "flex";
		playerDiscs.style.display = "none";
		mobDiscs.style.display = "flex";
	}

	// Clear slots
	document.querySelectorAll("#discobar .slot").forEach(slot => {
		slot.innerHTML = "";
		slot.classList.remove("charged");
	});

	// Start-of-turn passives
	if (state.turn === "mob") {
		await passives(state.mob.mobid, "start");
	}

	// If mob turn, make them play
	if (state.turn === "mob") {
		await wait(200);
		await enemyAttack();
	}
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
			let coinsReward = db.coinTiers[state.mob.lvl];
			if (state.player.skills.includes("skilleco1")) {
				coinsReward += Math.ceil(coinsReward * 25 / 100);
			}
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
				global.maxLvl = global.maxLvl > state.player.lvl ? global.maxLvl : state.player.lvl;
				saveGlobal();
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
/* ················  C A R D S,   S L O T S,   D I S C S  ···················*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/

/*===========================================================================*/
// Draw cards
/*===========================================================================*/
async function drawCards() {
	const hand = [...state.player.hand];
	const mat = document.querySelector(".hand");
	for (const card of hand) {
		let newCard = await generateCard(card);
		let tempDiv = document.createElement('div');
		tempDiv.innerHTML = newCard;
		let newCardElement = tempDiv.firstElementChild;
		newCardElement.style.transform = "translateX(500rem) rotate(0deg) translateY(0rem)";
		newCardElement.addEventListener('touchstart mousedown', function (e) {
			card.classList.add("cardOnDragStart");
		});
		mat.append(newCardElement);
		cardPositions();
	}
}

/*===========================================================================*/
// Place card disc in slot
/*===========================================================================*/
export async function placeCardInSlot(cardId) {
	return new Promise(async (resolve, reject) => {
		try {

			// Get Elements
			const slot = document.querySelector(".target-slot");

			let randomID;


			// Generate disc
			let newDisc = document.createElement("div");
			randomID = "id-" + crypto.randomUUID();
			newDisc.id = randomID;


			// Add class
			newDisc.classList.add("disc");

			// Clear slot
			slot.innerHTML = "";

			// Append card
			slot.innerHTML += await generateCard(cardId);

			// Insert disc in slot
			slot.append(newDisc);


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
// Card positions
/*===========================================================================*/
var dragInstances = [];
var currentSlot = null;
function cardPositions() {
	dragInstances.forEach(({ instance }) => {
		instance.destroy();
	});

	const cards = document.querySelectorAll('.hand .card');
	const totalCards = cards.length;
	const maxNumberOfCards = 20;
	const minMargin = -1;
	const maxMargin = -5.5;
	const fraction = Math.min(totalCards, maxNumberOfCards) / maxNumberOfCards;
	const margin = minMargin + (maxMargin - minMargin) * fraction;
	const antiMargin = margin * -0.5;

	cards.forEach((card, i) => {
		let stuck = false;
		let deadzone = { width: 16, height: 7 };
		if (document.querySelector("#encounter").classList.contains("midturn")) {
			stuck = true;
			deadzone = { width: 99, height: 99 };
		}
		const dragInstance = new Draggable(card, {
			onDragEnd: (data) => {
				card.classList.remove("cardOnDrag");
				card.classList.remove("cardOnDragStart");
				if (currentSlot) {
					// If a slot is currently being hovered over, call onDrop
					onDrop({ target: currentSlot, detail: data });
					currentSlot = null;
					card.remove();
				};
				dragInstance.destroy();
				cardPositions();
			},
			onDragStart: async (data) => {
				let scale = 3;
				card.classList.remove("cardOnDrag");
				card.classList.remove("neodrag-dragging");
				card.classList.add("cardOnDragStart");

				// Sound
				soundEffects.card.play();

				let parent = document.querySelector("main");

				const cardRect = card.getBoundingClientRect();
				const parentRect = parent.getBoundingClientRect();

				let scaledChildWidth = cardRect.width * scale;
				let scaledChildLeft = cardRect.left - (scaledChildWidth - cardRect.width) / 2;
				let scaledChildRight = scaledChildLeft + scaledChildWidth;

				let overflowLeft = Math.max(0, parentRect.left - scaledChildLeft);
				let overflowRight = Math.max(0, scaledChildRight - parentRect.right);

				if (overflowLeft > 0) {
					card.style.transform = `translateX(${overflowLeft / 3}px)`;
				} else if (overflowRight > 0) {
					card.style.transform = `translateX(-${overflowRight / 3}px)`;
				} else {
					card.style.transform = "";
				}
			},
			onDrag: (data) => {
				card.classList.add("cardOnDrag");
				card.classList.remove("cardOnDragStart");

				// Get the position of the center of the draggable element
				let rect = data.currentNode.getBoundingClientRect();
				let x = rect.left + rect.width / 2;
				let y = rect.top + rect.height / 2;

				// Check if the draggable element is over a slot
				const slots = document.querySelectorAll('#encounter:not(.midturn) #playerDiscs .slot:not(.charged)');
				slots.forEach((slot) => {
					let slotRect = slot.getBoundingClientRect();
					if (isPointInsideRect(x, y, slotRect)) {
						// The draggable element is over this slot
						if (slot !== currentSlot) {
							// It's a different slot than before, so remove the class from the previous slot
							if (currentSlot) {
								currentSlot.classList.remove('hover');
							}

							// Add the class to the new slot
							slot.classList.add('hover');

							// Update the current slot
							currentSlot = slot;
						}
					} else if (slot === currentSlot) {
						// The draggable element is no longer over the current slot
						currentSlot.classList.remove('hover');
						currentSlot = null;
					}
				});
			},
			bounds: 'main',
			legacyTranslate: true,
			stuck: stuck,
			deadzone: deadzone,
		});
		dragInstances.push({
			element: card,
			instance: dragInstance,
		});

		const tiltFactor = (i - (totalCards - 1) / 2) * 5;
		const tiltValue = `rotate(${tiltFactor}deg)`;
		const verticalOffsetFactor = Math.abs(i - (totalCards - 1) / 2) * (0.03 * cards.length);
		const verticalOffsetValue = `translateY(${verticalOffsetFactor}rem)`;

		card.style.marginLeft = margin + "rem";
		card.style.transform = "translateX(" + antiMargin + "rem) " + tiltValue + " " + verticalOffsetValue;
	});

	//Check cards for mana
	cardManaCheck();
}

// Function to check if a point is inside a rectangle
function isPointInsideRect(x, y, rect) {
	return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

async function onDrop(event) {
	// This function will be called when the dragged element is dropped on the slot element
	// event.target will be the slot element
	// event.detail.currentNode will be the dragged element
	let cardId = event.detail.currentNode.querySelector(".inventory-card").dataset.cardid;
	if (event.cardBackToHand) {
		state.player.hand.push(cardId);
		drawCards();
		state.player.hand = [];
	} else {
		event.target.classList.add("target-slot");
		await placeCardInSlot(cardId);
		event.target.classList.remove("hover");

		// Sound
		soundEffects.slot.play();
	}
	if (event.slotToEmpty) {
		event.slotToEmpty.innerHTML = "";
		event.slotToEmpty.classList.remove("charged");
	}
	makeSlotsDraggable();
	cardPositions();
	checkAttackAvailability();
}


var slotDragInstances = [];
function makeSlotsDraggable() {
	const slots = document.querySelectorAll("#playerDiscs .slot.charged .card");

	slotDragInstances.forEach(({ instance }) => {
		instance.destroy();
	});

	let deadzone = { width: 3, height: 5 };
	if (document.querySelector("#encounter").classList.contains("midturn")) {
		deadzone = { width: 99, height: 99 };
	}

	slots.forEach((slot) => {
		let stuck = false;
		if (document.querySelector("#encounter").classList.contains("midturn")) {
			stuck = true;
		}
		const slotDragInstance = new Draggable(slot, {
			onDragEnd: (data) => {
				slot.classList.remove("cardOnDrag");
				slot.classList.remove("cardOnDragStart");

				slot.style.transform = "none";
				if (!document.querySelector("#encounter").classList.contains("midturn")) {
					if (currentSlot) {
						// If a slot is currently being hovered over, call onDrop
						if (currentSlot === slot.parentElement) {
							onDrop({ target: currentSlot, detail: data });
						} else {
							onDrop({ target: currentSlot, detail: data, slotToEmpty: slot.parentElement });
						}
					} else {
						onDrop({ cardBackToHand: true, detail: data, slotToEmpty: slot.parentElement });
					};
					currentSlot = null;
					slot.remove();
				}
				currentSlot = null;
				slotDragInstance.destroy();
				makeSlotsDraggable();
			},
			onDragStart: async (data) => {
				slot.style.transition = "none";
				await wait(0);
				slot.style.removeProperty("transition");

				let scale = 3;
				slot.classList.remove("cardOnDrag");
				slot.classList.add("cardOnDragStart");

				currentSlot = slot.parentElement;

				// Sound
				soundEffects.card.play();

				let parent = document.querySelector("main");

				const slotRect = slot.getBoundingClientRect();
				const parentRect = parent.getBoundingClientRect();

				let scaledChildWidth = slotRect.width * scale;
				let scaledChildLeft = slotRect.left - (scaledChildWidth - slotRect.width) / 2;
				let scaledChildRight = scaledChildLeft + scaledChildWidth;

				let overflowLeft = Math.max(0, parentRect.left - scaledChildLeft);
				let overflowRight = Math.max(0, scaledChildRight - parentRect.right);

				if (overflowLeft > 0) {
					slot.style.transform = `translateX(${overflowLeft / 3}px)`;
				}
				if (overflowRight > 0) {
					slot.style.transform = `translateX(-${overflowRight / 3}px)`;
				}

			},
			onDrag: (data) => {

				if (!document.querySelector("#encounter").classList.contains("midturn")) {
					slot.classList.add("cardOnDrag");
					slot.classList.remove("cardOnDragStart");

					if (slot.nextSibling) {
						slot.nextSibling.remove();
						slot.parentElement.classList.remove("charged");
					}


					// Get the position of the center of the draggable element
					let rect = data.currentNode.getBoundingClientRect();
					let x = rect.left + rect.width / 2;
					let y = rect.top + rect.height / 2;

					// Check if the draggable element is over a slot
					const unchargedSlots = document.querySelectorAll('#encounter:not(.midturn) #playerDiscs .slot:not(.charged)');
					unchargedSlots.forEach((unchargedSlot) => {
						let slotRect = unchargedSlot.getBoundingClientRect();
						if (isPointInsideRect(x, y, slotRect)) {
							// The draggable element is over this slot
							if (unchargedSlot !== currentSlot) {
								// It's a different slot than before, so remove the class from the previous slot
								if (currentSlot) {
									currentSlot.classList.remove('hover');
								}

								// Add the class to the new slot
								unchargedSlot.classList.add('hover');

								// Update the current slot
								currentSlot = unchargedSlot;
							}
						} else if (unchargedSlot === currentSlot) {
							// The draggable element is no longer over the current slot
							currentSlot.classList.remove('hover');
							currentSlot = null;
						}
					});
				}
			},
			bounds: 'main',
			legacyTranslate: true,
			stuck: stuck,
			deadzone: deadzone,
		});
		slotDragInstances.push({
			element: slot,
			instance: slotDragInstance,
		});
	});
}


var mobSlotDragInstances = [];
function makeMobSlotsDraggable(slot) {
	const mobSlotDragInstance = new Draggable(slot, {
		onDragEnd: async () => {
			slot.classList.remove("cardOnDragStart");
			slot.style.transform = "none";
		},
		onDragStart: async () => {
			slot.style.transition = "none";
			await wait(0);
			slot.style.removeProperty("transition");

			let scale = 3;
			slot.classList.add("cardOnDragStart");

			// Sound
			soundEffects.card.play();

			let parent = document.querySelector("main");

			const slotRect = slot.getBoundingClientRect();
			const parentRect = parent.getBoundingClientRect();

			let scaledChildWidth = slotRect.width * scale;
			let scaledChildLeft = slotRect.left - (scaledChildWidth - slotRect.width) / 2;
			let scaledChildRight = scaledChildLeft + scaledChildWidth;

			let overflowLeft = Math.max(0, parentRect.left - scaledChildLeft);
			let overflowRight = Math.max(0, scaledChildRight - parentRect.right);

			if (overflowLeft > 0) {
				slot.style.transform = `translateX(${overflowLeft / 3}px)`;
			}
			if (overflowRight > 0) {
				slot.style.transform = `translateX(-${overflowRight / 3}px)`;
			}

		},
		onDrag: () => { },
		bounds: 'main',
		legacyTranslate: true,
		stuck: true,
		deadzone: {
			width: 99,
			height: 99,
		},
	});
	mobSlotDragInstances.push({
		element: slot,
		instance: mobSlotDragInstance,
	});
}

function destroyAllMobSlotDraggableInstances() {
	mobSlotDragInstances.forEach(({ instance }) => {
		instance.destroy();
	});
}

/*===========================================================================*/
// Hand limit
/*===========================================================================*/
function enforceHandLimit() {
	return new Promise(async (resolve, reject) => {
		try {
			const modal = document.querySelector(".card-scroller");
			const container = document.querySelector(".card-scroller .modal-content .card-list");
			const hand = document.querySelector("#playerBoard .hand");
			const confirmBtn = document.querySelector(".card-scroller button");
			const amountToRemoveElement = document.querySelector(".amount-to-remove");
			const maxHandLimitElement = document.querySelector(".max-hand-limit");
			const amountOfCards = hand.childElementCount;
			const cardLimit = state.player.slots;
			const amountToRemove = amountOfCards - cardLimit;

			// If hand over limit
			if (amountOfCards > cardLimit) {

				let selectedCards = [];

				// Reset container
				container.innerHTML = "";
				const confirm = confirmBtn.cloneNode(true);
				confirmBtn.parentNode.replaceChild(confirm, confirmBtn);
				confirm.disabled = true;

				// Clone hand into modal
				for (const child of hand.children) {
					const clonedChild = child.cloneNode(true);
					clonedChild.removeAttribute('style');
					clonedChild.classList.remove("neodrag");
					container.appendChild(clonedChild);

					// Add event listener to toggle selection
					clonedChild.addEventListener("click", function (event) {
						if (!event.currentTarget.closest('.card-scroller .card-list').classList.contains('scrolling')) {
							const selectedCount = container.querySelectorAll(".selectedToBeRemoved").length;
							if (!clonedChild.classList.contains("selectedToBeRemoved") && selectedCount < amountToRemove) {
								clonedChild.classList.add("selectedToBeRemoved");
								selectedCards.push(clonedChild.firstElementChild.dataset.cardid);
								updateButtonState();
							} else if (clonedChild.classList.contains("selectedToBeRemoved")) {
								clonedChild.classList.remove("selectedToBeRemoved");
								selectedCards = selectedCards.filter(item => item !== clonedChild.firstElementChild.dataset.cardid);
								updateButtonState();
							}
						}
					});
				}

				function updateButtonState() {
					const selectedCount = container.querySelectorAll(".selectedToBeRemoved").length;
					confirm.disabled = selectedCount !== amountToRemove;
				}

				// Update text
				amountToRemoveElement.innerHTML = amountToRemove;
				maxHandLimitElement.innerHTML = cardLimit;

				// Display modal
				modal.style.display = "flex";
				container.scrollLeft = 0;

				// Click to confirm
				confirm.addEventListener("click", function () {
					const cardsInHand = document.querySelectorAll("#playerBoard .hand .card");
					for (const selectedCard of selectedCards) {
						cardsInHand.forEach(card => {
							if (card.firstElementChild.dataset.cardid === selectedCard) {
								card.remove();
								state.player.cemetery.push(selectedCard);
							}
						});
					}
					cardPositions();
					modal.style.display = "none";
					resolve();
				});
			} else {
				resolve();
			}

		} catch (error) {
			console.log("An error occurred enforcing the hand limit: " + error.message);
			reject(error);
		}
	});
}


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

			// Reset card positions
			makeSlotsDraggable();
			cardPositions();


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

	// Subtract fate and update it
	state.player.fate -= state.fatePrice;
	updateFate();

	// Double the price and update the button text
	state.fatePrice = Math.max(state.fatePrice *= 2, 1)
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
				makeMobSlotsDraggable(slot.querySelector(".card"));
			}

			await wait(1200);
			await spinDiscs();
			await wait(1200);
			await applyDiscsEffects();

			toggleTurn();

			destroyAllMobSlotDraggableInstances();

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
				cardManaCheck();
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

			await updateHP();

			resolve();
		} catch (error) {
			console.log("An error occurred during attack: " + error.message);
			reject(error);
		}
	});
}

/*===========================================================================*/
// Victory
/*===========================================================================*/
export async function victory() {
	// Save stat
	if (!global.mobsKilled.includes(state.mob.mobid)) {
        global.mobsKilled.push(state.mob.mobid);
    }

	// Reset data 
	state.turn = false;
	state.player.poison = 0;
	state.player.shield = 0;
	state.player.mana = 0;

	// Display XP Screen
	document.querySelector("#playerBoard").style.display = "none";
	document.querySelector("#xpscreen").style.display = "flex";
	generateXpScreen();
}


/*===========================================================================*/
// Death
/*===========================================================================*/
export function death() {
	document.querySelector("#death").style.display = "flex";
	global.deaths++;
	saveGlobal();
}

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
/* ······················  M O B   P A S S I V E S  ·························*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
async function passives(mobId, time) {
	return new Promise(async (resolve, reject) => {
		try {
			let hasPassive;
			switch (mobId) {

				case "frog":
					switch (time) {
						case "end":
							await wait(500);
							temporalEffects.heal(1);
							hasPassive = true;
							break;
					}
					break;

				case "rat":
					switch (time) {
						case "start":
							await wait(500);
							temporalEffects.heal(1);
							hasPassive = true;
							break;
						case "end":
							await wait(500);
							temporalEffects.shield(1);
							hasPassive = true;
							break;
					}
					break;
			}

			if (hasPassive) {
				await wait(500);
				await applyDiscsEffects();
				await resetTemporalEffects();
			}

			resolve();
		} catch (error) {
			console.log("An error occurred during enemy's passive effect: " + error.message);
			reject(error);
		}
	});
}

/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ··················  T E M P O R A L   E F F E C T S  ·····················*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
const temporalEffects = {
	/////////////////
	// DAMAGE
	/////////////////
	damage: (amount, cardId) => {
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
		let damageAmount = (amount === undefined) ? (db.cards[cardId].damage || 0) : amount;

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
	},

	/////////////////
	// SELF DAMAGE
	/////////////////
	selfDamage: (amount, cardId) => {
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
		let damageAmount = (amount === undefined) ? (db.cards[cardId].damage || 0) : amount;

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
	},

	/////////////////
	// PIERCING DAMAGE
	/////////////////
	piercingDamage: (amount, cardId) => {
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
		let damageAmount = (amount === undefined) ? (db.cards[cardId].damage || 0) : amount;

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
	},

	/////////////////
	// SELF PIERCING DAMAGE
	/////////////////
	selfPiercingDamage: (amount, cardId) => {
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
		let damageAmount = (amount === undefined) ? (db.cards[cardId].damage || 0) : amount;

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
	},

	/////////////////
	// FIRE DAMAGE
	/////////////////
	fireDamage: (amount, cardId) => {
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
		let fireDamageAmount = (amount === undefined) ? (db.cards[cardId].fire_damage || 0) : amount;

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
	},

	/////////////////
	// HEAL
	/////////////////
	heal: (amount, cardId) => {
		let target;
		let tempBar;
		if (state.turn === "player") {
			target = state.player;
			tempBar = document.querySelector("#encounter .player-hp .heal-bar");
		} else {
			target = state.mob;
			tempBar = document.querySelector("#encounter .mob-hp .heal-bar");
		}

		let maxHP = target.maxHp;
		let lostHP = maxHP - target.hp;
		let maxHealBarSize = lostHP / maxHP * 100;

		let healAmount = (amount === undefined) ? (db.cards[cardId].heal || 0) : amount;
		state.turnHeal += healAmount;

		tempBar.style.width = Math.min(state.turnHeal / target.maxHp * 100, maxHealBarSize) + "%";
	},

	/////////////////
	// SHIELD
	/////////////////
	shield: (amount, cardId) => {
		let shieldEl;
		let previousShield;
		if (state.turn === "player") {
			shieldEl = document.querySelector("#encounter .player-hp .shield-wrapper");
			previousShield = state.turnRemoveAllShield ? 0 : state.player.shield;
		} else {
			shieldEl = document.querySelector("#encounter .mob-hp .shield-wrapper");
			previousShield = state.turnRemoveAllShield ? 0 : state.mob.shield;
		}

		let shieldAmount = (amount === undefined) ? (db.cards[cardId].shield || 0) : amount;
		state.turnShield += shieldAmount;

		shieldEl.style.display = "flex";

		shieldEl.querySelector(".shield-amount").textContent = previousShield + state.turnShield;
		shieldEl.classList.add("healed");
	},

	/////////////////
	// POISON
	/////////////////
	poison: (amount, cardId) => {
		let target;
		let poisonEl;
		if (state.turn === "player") {
			target = state.mob;
			poisonEl = document.querySelector("#encounter .mob-hp .poison-wrapper");
		} else {
			target = state.player;
			poisonEl = document.querySelector("#encounter .player-hp .poison-wrapper");
		}

		let poisonAmount = (amount === undefined) ? (db.cards[cardId].poison || 0) : amount;
		state.turnPoison += poisonAmount;

		poisonEl.style.display = "flex";

		poisonEl.querySelector(".poison-amount").textContent = target.poison + state.turnPoison;
	},

	/////////////////
	// MANA
	/////////////////
	mana: (amount, cardId) => {
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

		let manaAmount = (amount === undefined) ? (db.cards[cardId].mana || 0) : amount;
		state.turnMana += manaAmount;

		manaLeftElement.textContent = target.mana + state.turnMana - state.turnManaToConsume;
	},

	/////////////////
	// FATE
	/////////////////
	fate: (amount, cardId) => {
		let fateAmount = (amount === undefined) ? (db.cards[cardId].fate || 0) : amount;
		state.turnFate += fateAmount;

		document.querySelector("#encounter .fate-left").textContent = state.player.fate + state.turnFate;
	},
}

/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ······················  C A R D   E F F E C T S  ·························*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
class Effects {
	constructor(result, cardId, disc) {
		this.result = result;
		this.cardId = cardId;
		this.disc = disc;
	}

	effect(effect, amount) {
		if (temporalEffects[effect]) {
			temporalEffects[effect](amount, this.cardId);
		}
	}

	successful() {
		this.disc.parentElement.classList.add("successful");

		// Consume mana
		const manaCost = db.cards[this.cardId].mana_cost;
		if (manaCost > 0) {
			state.turnManaToConsume += manaCost;
			this.effect("mana");
		}
	}

	unsuccessful() {
		this.disc.parentElement.classList.add("unsuccessful");
	}

	/////////////////
	// Effecs by card
	/////////////////
	basic_attack_1() {
		let amount;
		switch (this.result) {
			case 1:
				amount = db.cards[this.cardId].damage;
				this.effect("damage", amount);
				this.successful();
				break;
			case 2:
				amount = db.cards[this.cardId].damage2;
				this.effect("damage", amount);
				this.successful();
				break;
			case 3:
				amount = db.cards[this.cardId].damage3;
				this.effect("damage", amount);
				this.successful();
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
				this.effect("piercingDamage");
				this.successful();
				break;
			case 3:
				amount = db.cards[this.cardId].damage2;
				this.effect("piercingDamage", amount);
				this.successful();
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
				this.effect("heal", amount);
				this.successful();
				break;
			case 3:
				amount = db.cards[this.cardId].heal2;
				this.effect("heal", amount);
				this.successful();
				break;
		}
	}
	double_damage() {
		switch (this.result) {
			case 1:
				state.turnDamage = state.turnDamage * 2;
				state.turnPiercingDamage = state.turnPiercingDamage * 2;
				this.effect("damage");
				this.successful();
				break;
			case 2:
				state.turnDamage = 0;
				state.turnPiercingDamage = 0;
				this.effect("damage");
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
				this.effect("damage");
				this.successful();
				break;
			case 3:
				this.effect("heal");
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
				this.effect("fate");
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
				this.effect("mana");
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
				this.effect("damage");
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
				this.effect("shield");
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
				this.effect("poison");
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
				this.effect("poison", amount);
				this.successful();
				break;
			case 3:
				amount = db.cards[this.cardId].poison2;
				this.effect("poison", amount);
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

				this.effect("damage");
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
				this.effect("damage");
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
				this.effect("damage", damage);
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
					this.effect("damage", db.cards.affliction_advantage.damage);
				} else {
					this.effect("piercingDamage", db.cards.affliction_advantage.damage2);
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
					this.effect("shield");
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
				state.turn === "player" ? this.effect("poison", state.mob.poison + state.turnPoison) : this.effect("poison", state.player.poison + state.turnPoison);
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
				this.effect("damage", damageAmount);
				this.successful();
				break;
		}
	}
	aggressive_stance() {
		switch (this.result) {
			case 1:
				this.effect("selfPiercingDamage", db.cards.aggressive_stance.self_damage);
				this.effect("piercingDamage", db.cards.aggressive_stance.damage);
				this.successful();
				break;
			case 2:
				this.effect("selfPiercingDamage", db.cards.aggressive_stance.self_damage);
				this.effect("piercingDamage", db.cards.aggressive_stance.damage2);
				this.successful();
				break;
			case 3:
				this.effect("selfPiercingDamage", db.cards.aggressive_stance.self_damage);
				this.effect("piercingDamage", db.cards.aggressive_stance.damage3);
				this.successful();
				break;
		}
	}
	pyreburst() {
		switch (this.result) {
			case 1:
				this.unsuccessful();
				break;
			case 2:
				this.effect("fireDamage");
				this.successful();
				break;
		}
	}
	embersteel() {
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
				this.effect("fireDamage");
				this.successful();
				break;
		}
	}
	fireseal() {
		switch (this.result) {
			case 1:
				this.unsuccessful();
				break;
			case 2:
				this.effect("shield");
				this.successful();
				break;
			case 3:
				this.effect("shield");
				this.effect("fireDamage");
				this.successful();
				break;
		}
	}
	drinkin() {
		switch (this.result) {
			case 1:
				this.unsuccessful();
				break;
			case 2:
				this.effect("heal");
				this.effect("damage");
				this.successful();
				break;
		}
	}
	attack_and_mana() {
		switch (this.result) {
			case 1:
				this.unsuccessful();
				break;
			case 2:
				this.effect("damage");
				this.effect("mana");
				this.successful();
				break;
		}
	}
	antidote() {
		switch (this.result) {
			case 1:
				this.unsuccessful();
				break;
			case 2:
				state.player.poison = 0;
				this.successful();
				break;
		}
	}
	bloodletting() {
		switch (this.result) {
			case 1:
				this.unsuccessful();
				break;
			case 2:
				this.effect("selfPiercingDamage", db.cards.bloodletting.self_damage);
				state.player.poison = 0;
				this.successful();
				break;
		}
	}
}