var soundEffects = {
	page: new Howl({
		src: ['./assets/audio/effects/page.mp3'],
		sprite: {
			1: [100, 1100],
			2: [1100, 1400],
			3: [2500, 1200],
			4: [3700, 1300]
		},
		preload: true,
	}),
	card: new Howl({
		src: ['./assets/audio/effects/card.mp3'],
	}),
	slot: new Howl({
		src: ['./assets/audio/effects/slot.mp3'],
	}),
	burnPath: new Howl({
		src: ['./assets/audio/effects/burnPath.mp3'],
	}),
	slash1: new Howl({
		src: ['./assets/audio/effects/slash1.mp3'],
	}),
	slash2: new Howl({
		src: ['./assets/audio/effects/slash2.mp3'],
	}),
	slash3: new Howl({
		src: ['./assets/audio/effects/slash3.mp3'],
	}),
	slash4: new Howl({
		src: ['./assets/audio/effects/slash4.mp3'],
	}),
	poison: new Howl({
		src: ['./assets/audio/effects/poison.mp3'],
	}),
	spin1: new Howl({
		src: ['./assets/audio/effects/spin1.mp3'],
	}),
	spin2: new Howl({
		src: ['./assets/audio/effects/spin2.mp3'],
	}),
	spin3: new Howl({
		src: ['./assets/audio/effects/spin3.mp3'],
	}),
	spin4: new Howl({
		src: ['./assets/audio/effects/spin4.mp3'],
	}),
	spin5: new Howl({
		src: ['./assets/audio/effects/spin5.mp3'],
	}),
	spin6: new Howl({
		src: ['./assets/audio/effects/spin6.mp3'],
	}),
}

var currentPlaying = null;
var seekTime = 0;
var soundtrack = {
	crossroad: new Howl({
		src: ['./assets/audio/music/shadowsanddust.mp3'],
		loop: true,
		preload: true,
	}),
	swordsong_overture: new Howl({
		src: ['./assets/audio/music/swordsong_overture.mp3'],
		loop: true,
		preload: true,
	}),
	victory: new Howl({
		src: ['./assets/audio/music/victory.mp3'],
		loop: true,
		preload: true,
	}),
	battle1: new Howl({
		src: ['./assets/audio/music/battle.mp3'],
		loop: true,
	}),
}