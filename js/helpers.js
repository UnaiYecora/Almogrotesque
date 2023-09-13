/*==========================================*/
// Go-to buttons
/*==========================================*/
export function goTo(destination) {
	// Hide all screens
	document.querySelectorAll("main section").forEach(el => {
		el.style.display = "none";
	});
	
	//Crossroad background
	if (destination === "crossroad") {
		let imgNumber = Math.round(Math.random() * 4) + 1;
		document.querySelector("#crossroad").style.background = "url(./assets/img/bg/"+imgNumber+".jpg)";
	}
	
	// Display destination screen
	document.querySelector("#" + destination).style.display = "flex";
}


/*==========================================*/
// Shuffle array
/*==========================================*/
export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}