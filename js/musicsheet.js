var soundEffects = {
	page : new Howl({
		src: ['./assets/audio/effects/page.mp3'],
		sprite: {
			1: [100, 1100],
			2: [1100, 1400],
			3: [2500, 1200],
			4: [3700, 1300]
		},
		preload: true,
	}),
	card : new Howl({
		src: ['./assets/audio/effects/card.mp3'],
	}),
	slot : new Howl({
		src: ['./assets/audio/effects/slot.mp3'],
	}),
	burnPath : new Howl({
		src: ['./assets/audio/effects/burnPath.mp3'],
	}),
}

var soundtrack = {
	crossroad : new Howl({
		src: ['./assets/audio/music/shadowsanddust.mp3'],
		loop: true,
		html5: true,
		preload: "metadata",
	}),
	battle1 : new Howl({
		src: ['./assets/audio/music/battle.mp3'],
		loop: true,
		html5: true,
	}),
}