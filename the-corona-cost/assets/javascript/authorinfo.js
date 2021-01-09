// Wait both for the window and jQuery to be loaded.
var toggleInfo;
Promise.allSettled([
	new Promise((res) => {
		window.addEventListener('DOMContentLoaded', res);
	}),
	new Promise(async (res) => {
		while (typeof $ === 'undefined') { await new Promise((r) => setTimeout(r, 10)); }
		res();
	})
]).then(() => {
	let ar = $("div.infoArea");
	toggleInfo = function(){
		ar.css('display', (ar.css('display') == 'none' ? 'block' : 'none'))
	}
});