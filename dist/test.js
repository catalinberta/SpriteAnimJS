<script id="spriteVertexShader" type="text/webgl">
uniform float u_frameOffset;
uniform vec4 u_screenDims;
attribute vec2 centerPosition;
attribute float rotation;
attribute float perSpriteFrameOffset;
attribute float spriteSize;
attribute vec2 cornerOffset;
attribute vec2 spriteTextureSize;
attribute float spritesPerRow;
attribute float numFrames;
attribute vec4 textureWeights;
varying vec2 v_texCoord;
varying vec4 v_textureWeights;
void main() {
	float frameNumber = mod(u_frameOffset + perSpriteFrameOffset, numFrames);
	float row = floor(frameNumber / spritesPerRow);  // Compute the upper left texture coordinate of the sprite
	vec2 upperLeftTC = vec2(spriteTextureSize.x * (frameNumber - (row * spritesPerRow)),
						  spriteTextureSize.y * row);
	vec2 tc = upperLeftTC + spriteTextureSize * (cornerOffset + vec2(0.5, 0.5));
	v_texCoord = tc;
	v_textureWeights = textureWeights;
	float s = sin(rotation);
	float c = cos(rotation);
	mat2 rotMat = mat2(c, -s, s, c);
	vec2 scaledOffset = spriteSize * cornerOffset;
	vec2 pos = centerPosition + rotMat * scaledOffset;
	gl_Position = vec4(pos * u_screenDims.xy + u_screenDims.zw, 0.0, 1.0);
}
</script>
