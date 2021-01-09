// Wait for DOM, jquery, numeral and stats to load.
Promise.allSettled([
	new Promise((res) => {
		window.addEventListener('DOMContentLoaded', res);
	}),
	new Promise(async (res) => {
		while (typeof $ === 'undefined') { await new Promise((r) => setTimeout(r, 10)); }
		res();
	}),
	new Promise(async (res) => {
		while (typeof numeral === 'undefined') { await new Promise((r) => setTimeout(r, 10)); }
		res();
	}),
	new Promise(async (res) => {
		while (CORONA_STAT_INIT !== true) { await new Promise((r) => setTimeout(r, 10)); }
		res();
	})
]).then(() => {
	var data = {
		"CORONA_DEATHS": {
			"element": $("#sn-death"),
			"interval": -1
		},
		"CORONA_HOSPITALIZED": {
			"element": $("#sn-hospital"),
			"interval": -1
		},
		"CORONA_POSITIVES": {
			"element": $("#sn-case"),
			"interval": -1
		}
	};
	var keys = Array.from(Object.keys(data));
	//
	for (var i=0; i < keys.length; i++){
		let key = keys[i];
		let tally = eval(key);
		tally.onIncrement((_,to) => {
			let elm = data[key]['element'];
			clearInterval(data[key]['interval']);
			let from = numeral(elm.html()).value();
			let passes = -1;
			let iv = setInterval(function(){
				passes++;
				if (passes >= 9){
					elm.html(numeral(to).format('0,0'));
					clearInterval(iv);
				} else {
					let pc = passes/9;
					let newvalue = Math.round((to*pc) + (from*(1-pc)));
					elm.html(numeral(newvalue).format('0,0'));
				}
			}, 10);
			data[key]['interval'] = iv;
		});
		//
	}
});