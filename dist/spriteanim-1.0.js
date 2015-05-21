function SpriteAnim(canvasId,sprite) {
	var that = this;
	this.canvas = document.getElementById(canvasId);
	this.canvas.width = 100;
	this.canvas.height = 100;
	
	this.frameIndex = 0;
	this.tickCount = 0;
	this.ticksPerFrame = sprite.ticksPerFrame || 0;
	this.numberOfFrames = sprite.numberOfFrames || 1;
	this.loopSprite = sprite.loop || false;
	this.playSprite = true;

	this.context = this.canvas.getContext("2d");
	this.width = sprite.width;
	this.height = sprite.height;
	this.image = sprite.image;

	this.update = function () {
		this.draw();

	    this.tickCount += 1;
	    if (this.tickCount > this.ticksPerFrame) {

			this.tickCount = 0;

			
	        if (this.frameIndex < this.numberOfFrames - 1) {	
	            this.frameIndex += 1;
	        } else {
	            if(this.loopSprite) {
	            	this.frameIndex = 0;
	            } else {
	            	this.playSprite = false;
	            }
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
		this.update();
	}
	this.ticker();
}