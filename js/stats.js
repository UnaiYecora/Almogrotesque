/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ···························  I M P O R T S  ······························*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
import { wait } from "./helpers.js?v=0.26";
import { generateCard } from "./inventory.js?v=0.26";
import { db, state, save, load, global, saveGlobal, loadGlobal } from "./db.js?v=0.26";



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
			let statsCollectionHTML = "<div class='list-of-stats'>";
			statsCollectionHTML += /*html*/`
			<h3>Enemies defeated</h3>
			<p>0</p>
			<h3>Enemies killed</h3>
			<p>0</p>
			<h3>Damage dealt</h3>
			<p>420</p>
			<h3>Deaths</h3>
			<p>69</p>
			`;
			statsCollectionHTML += "</div>";

			statsCollectionElement.innerHTML = statsCollectionHTML;

			resolve();
		} catch (error) {
			reject(error);
		}
	});
}