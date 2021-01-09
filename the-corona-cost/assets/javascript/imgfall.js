// Wait both for the window, stats and jQuery to be loaded.
var toggleInfo;
Promise.allSettled([
	new Promise((res) => {
		window.addEventListener('DOMContentLoaded', res);
	}),
	new Promise(async (res) => {
		while (CORONA_STAT_INIT !== true) { await new Promise((r) => setTimeout(r, 10)); }
		res();
	}),
	new Promise(async (res) => {
		while (typeof $ === 'undefined') { await new Promise((r) => setTimeout(r, 10)); }
		res();
	})
]).then(() => {
	$.fn.isOnScreen = function(){

		var win = $(window);

		var viewport = {
			top : win.scrollTop(),
			left : win.scrollLeft()
		};
		viewport.right = viewport.left + win.width();
		viewport.bottom = viewport.top + win.height();

		var bounds = this.offset();
		bounds.right = bounds.left + this.outerWidth();
		bounds.bottom = bounds.top + this.outerHeight();

		return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));

	};
	
	let indices = [1,10,100,101,102,103,104,105,106,107,108,109,11,110,111,112,113,114,115,116,117,118,119,12,120,121,122,123,124,125,126,127,128,129,13,130,131,132,133,134,135,136,137,138,139,14,140,141,142,143,144,145,146,147,148,149,15,150,151,152,153,154,155,156,157,158,159,16,160,161,162,163,164,165,166,167,168,169,17,170,171,172,173,174,175,176,177,178,179,18,180,181,182,183,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,54,55,56,57,58,59,6,60,61,62,63,64,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99];
	var allindices = [...new Set(indices)];
	function fetchURL(){
		var val;
		while (typeof val == 'undefined'){
			if (allindices.length < 1){
				allindices = [...new Set(indices)];
			}
			let index = Math.floor(Math.random()*allindices.length);
			val = indices[index];
			indices.splice(index, 1);
		}
		return `https://github.com/MKorostoff/hundred-thousand-faces/raw/master/img/m/${val}.jpg`;
	}
	
	CORONA_DEATHS.onIncrement((a) => {
		a = Math.min(a, 100);
		for (var i=0; i < a; i++){
			let x = Math.floor(Math.random()*95);
			let y = -5;
			let el = $(`<img src="${fetchURL()}"></img>`);
			el.css('position', 'absolute');
			el.css('left', `${x}vw`);
			el.css('top', `${y}vw`);
			el.css('width', '5vw');
			el.css('border-radius', '50%');
			$('div.imgArea').append(el);
			let speed = (Math.random()*0.03)+0.02;
			let rotation = 0;
			let rotSpeed = (Math.random()*0.1)-0.05;
			var iv = setInterval(function(){
				rotation += rotSpeed;
				y += speed;
				el.css('top', `${y}vw`);
				el.css('transform', `rotate(${rotation}deg)`)
				if (!el.isOnScreen() && y > 1){
					clearInterval(iv);
					el.remove();
				}
			}, 10);
		}
	});
});