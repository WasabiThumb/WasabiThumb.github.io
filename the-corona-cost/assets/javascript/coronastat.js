// Helper class to track counters
class Tally {
	
	constructor(){
		this.value = 0;
		this._incCallbacks = [];
		this._beenset = false;
	}
	
	getValue(){
		return this.value;
	}
	
	increment(v){
		this.setValue(this.getValue()+v);
	}
	
	setValue(v){
		let init = this._beenset;
		this._beenset = true;
		let inc = v-this.value;
		this.value = v;
		if (inc === 0) return;
		for (var i=0; i < this._incCallbacks.length; i++){
			this._incCallbacks[i]((init ? 1 : inc), v);
		}
	}
	
	onIncrement(cb){
		this._incCallbacks.push(cb);
	}
	
}

// Globals
CORONA_STAT_INIT = false;
if (typeof CORONA_POSITIVES === 'undefined') CORONA_POSITIVES = new Tally();
if (typeof CORONA_HOSPITALIZED === 'undefined') CORONA_HOSPITALIZED = new Tally();
if (typeof CORONA_DEATHS === 'undefined') CORONA_DEATHS = new Tally();

// Wait both for the window and jQuery to be loaded.
Promise.allSettled([
	new Promise((res) => {
		window.addEventListener('DOMContentLoaded', res);
	}),
	new Promise(async (res) => {
		while (typeof $ === 'undefined') { await new Promise((r) => setTimeout(r, 10)); }
		res();
	})
]).then(() => {
	// Stats
	var lastDate = 0;
	var daily = 0;
	var current = 0;
	var dailyPositive = 0;
	var currentPositive = 0;
	var dailyHospitalized = 0;
	var currentHospitalized = 0;
	// Function for updating above stats
	const updateTallies = (() => {
		return new Promise((res) => {
			$.getJSON("https://api.covidtracking.com/v1/us/current.json", (data) => {
				data = data[0];
				if (typeof data === "object"){
					if (typeof data.death !== "undefined"){
						current = data.death;
					}
					if (typeof data.deathIncrease !== "undefined"){
						daily = data.deathIncrease;
					}
					if (typeof data.positive !== "undefined"){
						currentPositive = data.positive;
					}
					if (typeof data.positiveIncrease !== "undefined"){
						dailyPositive = data.positiveIncrease;
					}
					if (typeof data.hospitalizedCurrently !== "undefined"){
						currentHospitalized = data.hospitalizedCurrently;
					}
					if (typeof data.hospitalizedIncrease !== "undefined"){
						dailyHospitalized = data.hospitalizedIncrease;
					}
					if (typeof data.date !== "undefined"){
						if (data.date != lastDate) {
							CORONA_DEATHS.setValue(data.death || current);
							CORONA_POSITIVES.setValue(data.positive || currentPositive);
							CORONA_HOSPITALIZED.setValue(data.hospitalizedCurrently || currentHospitalized);
						}
						lastDate = data.date;
					}
				}
				CORONA_STAT_INIT = true;
				res();
			});
		});
	});
	// Automatically update statistics every 15 minutes
	updateTallies();
	setInterval(updateTallies, 15*60e3);
	// Update interpolated value every minute
	setInterval(async () => {
		let dt = new Date();
		if (lastDate != parseInt(dt.getFullYear().toString() + (dt.getMonth() < 9 ? "0" : "") + (dt.getMonth()+1).toString() + (dt.getDate() < 10 ? "0" : "") + dt.getDate().toString())){
			await updateTallies();
		}
		let secs = dt.getSeconds() + (60 * (dt.getMinutes() + (60 * dt.getHours()))) + (dt.getMilliseconds()/1000);
		let pc = secs/86400;
		CORONA_DEATHS.setValue(current + Math.floor(daily*pc));
		CORONA_POSITIVES.setValue(currentPositive + Math.floor(dailyPositive*pc));
		CORONA_HOSPITALIZED.setValue(currentHospitalized + Math.floor(dailyHospitalized*pc));
	}, 300);
});