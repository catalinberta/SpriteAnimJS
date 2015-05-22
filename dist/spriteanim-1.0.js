function SpriteAnim(canvasId,sprite) {
	// Canvas
	this.canvas = document.getElementById(canvasId);
	this.context = this.canvas.getContext("2d");
	this.canvas.width = 100;
	this.canvas.height = 100;


	// FPS stuff
	this.fps = sprite.fps;
	this.now;
	this.then = Date.now();
	this.interval = 1000 / this.fps;
	this.delta;
	
	// Frame stuff
	this.frameIndex = 0;
	this.numberOfFrames = sprite.numberOfFrames || 1;
	this.loopSprite = sprite.loop || false;
	this.playSprite = true;

	
	this.width = sprite.width;
	this.height = sprite.height;
	this.image = sprite.image;

	this.update = function () {
		this.draw();

        if (this.frameIndex < this.numberOfFrames - 1) {	
            this.frameIndex += 1;
        } else {
            if(this.loopSprite) {
            	this.frameIndex = 0;
            } else {
            	this.playSprite = false;
            }
        }
	};
	this.draw = function() {
		this.context.clearRect(0, 0, this.width, this.height);

		this.context.drawImage(
		this.image,
		this.frameIndex * this.width / this.numberOfFrames,
		0,
		this.width / this.numberOfFrames,
		this.height,
		0,
		0,
		this.width / this.numberOfFrames,
		this.height);
	}

	this.ticker = function() {
		if(this.playSprite) {
			window.requestAnimationFrame(this.ticker.bind(this));
		}
		this.now = Date.now();
	    this.delta = this.now - this.then;
	     
	    if (this.delta > this.interval) {
	    	this.then = this.now - (this.delta % this.interval);
			this.update();
		}
	}
	this.ticker();
}