import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));


export async function action(data, callback) {

	try {
		
		const tblActions = {
			getTimer : () => getTimer(data, data.client)
		}
		
		info("Minuteur:", data.action.command, L.get("plugin.from"), data.client);
			
		tblActions[data.action.command]?.()

	} catch (err) {
		if (data.client) Avatar.Speech.end(data.client);
		if (err.message) error(err.message);
	}	
	
	callback();
}

let timerHandles = {};

function getTimer(data, client) {

	const sentence = (data.rawSentence || data.action.sentence || "").toLowerCase();

	const foodTimers = {
		"pommes de terre au four": 20,
		"pâtes": 12,
		"riz": 10,
		"frites": 10,
		"pizza": 10,
		"œufs durs": 12
	};

	for (let food in foodTimers) {
		if (sentence.includes(food)) {

			const duration = foodTimers[food];
			const durationInMs = duration * 60000;

			startTimer(client, durationInMs, `${duration} minutes pour ${food}`);
			return;
		}
	}

	const match = sentence.match(/(\d+)\s*(seconde?s?|minute?s?|heure?s?)/);

	if (!match) {
		Avatar.speak("Je n'ai pas compris la durée du minuteur.", client, () => {
			Avatar.Speech.end(client);
		});
		return;
	}

	let value = parseInt(match[1]);
	let unit = match[2];

	let durationMs = 0;

	if (unit.startsWith("seconde")) durationMs = value * 1000;
	else if (unit.startsWith("minute")) durationMs = value * 60000;
	else if (unit.startsWith("heure")) durationMs = value * 3600000;

	startTimer(client, durationMs, `${value} ${unit}`);
}


function startTimer(client, durationMs, label) {

	if (timerHandles[client]) {
		clearTimeout(timerHandles[client]);
	}

	Avatar.speak(`Minuteur de ${label} démarré.`, client, () => {
		Avatar.Speech.end(client);
	});

	timerHandles[client] = setTimeout(() => {

	Avatar.speak(`Le minuteur de ${label} est terminé !`, client, () => {
	   Avatar.play("https://universal-soundbank.com/sounds/8504.mp3", client, 'url', 'after');
});

		delete timerHandles[client];

	}, durationMs);
}