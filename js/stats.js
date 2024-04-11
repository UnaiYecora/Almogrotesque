/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ···························  I M P O R T S  ······························*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
import { wait } from "./helpers.js?v=0.27";
import { generateCard } from "./inventory.js?v=0.27";
import { db, state, save, load, global, saveGlobal, loadGlobal } from "./db.js?v=0.27";



/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ·························  F U N C T I O N S  ····························*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
export function loadCollection() {
	return new Promise(async (resolve, reject) => {
		try {

			/////////////////
			// BESTIARY
			/////////////////
			const mobCollectionElement = document.querySelector("section#collection .mob-collection");
			let mobCollectionHTML = "";
			for (var mob in db.mobs) {
				const mobData = db.mobs[mob];
				const killed = global.mobsKilled.includes(mob);
				const killedClass = killed ? "" : " unknown";

				mobCollectionHTML += '<div class="mob-collection-item'+ killedClass +'">';
				mobCollectionHTML += '<div class="mob-image-wrapper"><img src="./assets/img/mobs/' + mob + '.png" class="mob-image"></div>';
				mobCollectionHTML += '<div class="mob-info">';
				mobCollectionHTML += '<div class="mob-info-name">';
				if (killed) {
					mobCollectionHTML += '<p>'+ mobData.name +'</p>';
				} else {
					mobCollectionHTML += '<p>??????</p>';
				}
				mobCollectionHTML += '</div></div></div>';
			};
			mobCollectionElement.innerHTML = mobCollectionHTML;

			/////////////////
			// CARDS
			/////////////////
			const cardCollectionElement = document.querySelector("section#collection .card-collection");
			let cardCollectionHTML = "";
			for (const cardId in db.cards) {
				cardCollectionHTML += '<div class="card-collection-item">';
				cardCollectionHTML += await generateCard(cardId);
				cardCollectionHTML += '</div>';
			}
			cardCollectionElement.innerHTML = cardCollectionHTML;

			/////////////////
			// STATS
			/////////////////
			const statsCollectionElement = document.querySelector("section#collection .stats-collection");
			const amountOfLevels = Object.keys(db.levels).length;
			const amountOfMobs = Object.keys(db.mobs).length;
			let statsCollectionHTML = "<div class='list-of-stats'>";
			statsCollectionHTML += /*html*/`
			<h3>Kills</h3>
			<p>${global.kills}</p>
			<h3>Deaths</h3>
			<p>${global.deaths}</p>
			<h3>Max. level</h3>
			<p>${global.maxLvl}</p>
			<h3>Places visited</h3>
			<p>${global.places.length} / ${amountOfLevels}</p>
			<h3>Enemies seen</h3>
			<p>${global.mobsSeen.length} / ${amountOfMobs}</p>
			<h3>Enemies killed</h3>
			<p>${global.mobsKilled.length} / ${amountOfMobs}</p>
			`;
			statsCollectionHTML += "</div>";

			statsCollectionElement.innerHTML = statsCollectionHTML;

			resolve();
		} catch (error) {
			reject(error);
		}
	});
}