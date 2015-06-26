# SpriteAnimJS
Run spritesheet animations, that is all.

######[Demos here](http://catalinberta.github.io/spriteanimjs/)

If you have a DOM app and want to create some fast spritesheets
in WebGL, which fall back nicely to Canvas, then this might be of help.
Take note that this runs spritesheets standalone, each on its own canvas,
Basically, all you have to do is create a canvas element and run any 
spritesheet animation on it.

##### Note
Chrome limits WebGL context instances to 16, so you can run only 16 
spritesheets at the same time. Always destroy unused instances.

If you need more than 16 spritesheet animations on your page at the same time, then you 
might want to consider going full canvas and use a proper javascript game 
engine :)

#Usage

Create the html canvas element
`<canvas id="canvas"></canvas>`

Initiate SpriteAnim on the canvas element: `var mySpriteAnimation = new SpriteAnim(canvasId,forceCanvas2D)`

@Param1: {string} - ID of the canvas element

@Param2: {boolean | optional} - Wether to force the spritesheet's render in 2D Canvas or not

Run spritesheet animation

mySpriteAnimation.start({

				frameWidth: 100,
				frameHeight: 100,
				image: image_element, // should be preloaded
				fps: 10,
				className: 'class_name',
				loop: true,
				onStart: function() {},
				onComplete: function() {}
			});
			
@Prop1: {integer} - Single frame width

@Prop2: {integer} - Single frame height

@Prop3: {element} - Image element of spritesheet, preferrably preloaded

@Prop4: {integer} - Number of frames per second to run the spritesheet, defaults to 30

@Prop5: {string} || false - Class name(s) which to add on the canvas

@Prop6: {boolean} || false - Whether to loop the animation

@Prop7: {function} || false - Callback function that runs once when the animation starts

@Prop8: {function} || false - Callback function that runs everytime the animation ends

#Methods
####**Start**
`instance.start({props})`

####**Stop**
`instance.stop()`

i.e. `mySpriteAnimation.stop()`

#Preloading

It's recommended that you preload all of the spritesheets that you are planning to use.

--

There you have it, a very easy way to create Sprite Animations in WebGL with fallback to canvas.
I use it to create smooth particle-based sprite animations in various places in a webpage or in a game.

