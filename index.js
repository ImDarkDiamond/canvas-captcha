const Canvas = require('canvas');
const _ = require('lodash');

Canvas.registerFont('./Comismsh.ttf', { family: 'comismsh', });

const randomInt = function (min, max) {
	return Math.round(min + (Math.random() * (max - min)));
};

function getLightness(rgbColor) {
	if (rgbColor[0] !== '#') {
		return 1.0; // Invalid color ?
	}
	rgbColor = rgbColor.slice(1);
	if (rgbColor.length === 3) {
		rgbColor = rgbColor[0] + rgbColor[0] +
			rgbColor[1] + rgbColor[1] + rgbColor[2] + rgbColor[2];
	}

	const hexColor = parseInt(rgbColor, 16);
	const r = hexColor >> 16;
	const g = hexColor >> 8 & 255;
	const b = hexColor & 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);

	return (max + min) / (2 * 255);
}

function hue2rgb(p, q, h) {
	h = (h + 1) % 1;
	if (h * 6 < 1) {
		return p + (q - p) * h * 6;
	}
	if (h * 2 < 1) {
		return q;
	}
	if (h * 3 < 2) {
		return p + (q - p) * ((2 / 3) - h) * 6;
	}
	return p;
}


class Captcha {
  /**
   * @param {number} width
   * @param {number} height
   * @param {number} length
   * @param {object} [options]
   * @constructor
   */
  constructor(width, height, length, options) {
    this.length = length;
    this.width = width;
    this.height = height;

    const opts = Object.assign({
      fontFamily: 'comismsh',
      lineWidth: 2,
      chars: '23456789abcdefghjknpqrstuvxyzABCDEFGHJKLNPQRSTUVXYZ',
      colorHex: '23456789',
      bgColor: '#7289DA',
      maxLines: 4,
      minLines: 2
    }, options);

    opts.fontSize = opts.fontSize || Math.floor(height * 0.8);
    opts.wordSpace = opts.wordSpace || opts.fontSize / 2.2;
    opts.borderWidth = opts.borderWidth || (width - opts.wordSpace * length) / 2;

    this.opts = opts;
  }

  /**
   * create captcha easily
   *
   * @return { dataURL: string, text: string }
   * @public
   */
  createCaptcha() {
    const { canvas, ctx } = this.initCanvas();
    this.drawLine(ctx);
    const text = this.drawText(ctx);
    const buffer = canvas.toBuffer();
    return { buffer: buffer, text: text.toLowerCase() };
  }

  /**
   * init canvas and context2D
   *
   * @return { canvas: object, ctx: object }
   * @public
   */
  initCanvas() {
    const canvas = Canvas.createCanvas(this.width, this.height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = this.opts.bgColor;
    ctx.fillRect(0, 0, this.width, this.height);
    
    return { canvas, ctx };
  }
  /**
   * draw words
   *
   * @param {object} ctx
   * @return {string}
   * @public
   */
  drawText(ctx) {
    const text = this._randomChars();

    for (let i = 0; i < this.length; i++) {
      ctx.font = `${this.opts.fontSize}px ${this.opts.fontFamily}`;
      ctx.fillStyle = this._randomColorReadable();
      const x = this.opts.borderWidth + (i + Math.random() / 2 - 0.25) * this.opts.wordSpace;
      const y = this.height * 0.8;
      ctx.fillText(text[i], x, y);
    }

    return text;
  }

  /**
   * draw lines
   *
   * @param {object} ctx
   * @public
   */
  drawLine(ctx) {
    ctx.lineWidth = this.opts.lineWidth;
    ctx.globalAlpha = 0.2;

    for (let i = 0; i < this.length; i++) {
      ctx.strokeStyle = this._randomColor();
      ctx.beginPath();
      ctx.moveTo(0, _.random(0, this.height));
      ctx.lineTo(this.width, _.random(0, this.height));
      ctx.stroke();
    }
  }

  /**
   * return a data URI
   *
   * @param {object} canvas
   * @return {string}
   * @public
   */
  toDataURL(canvas) {
    const captchaBuff = canvas.toBuffer('image/jpeg', { quality: 0.5 });
    return Buffer.from(captchaBuff).toString('base64');
  }

  /**
   * get random characters
   *
   * @return {string}
   * @private
   */
  _randomChars() {
    return _.sampleSize(this.opts.chars, this.length).join('');
  }

  /**
   * get random color
   *
   * @return {string}
   * @private
   */
  _randomColorReadable() {
	// Random 24 colors
	// or based on step
	const hue = randomInt(0, 24) / 24;

	const saturation = randomInt(60, 80) / 100;
	const bgLightness = this.opts.bgColor ? getLightness(this.opts.bgColor) : 1.0;
	let minLightness;
	let maxLightness;
	if (bgLightness >= 0.5) {
		minLightness = Math.round(bgLightness * 100) - 45;
		maxLightness = Math.round(bgLightness * 100) - 25;
	} else {
		minLightness = Math.round(bgLightness * 100) + 25;
		maxLightness = Math.round(bgLightness * 100) + 45;
	}
	const lightness = randomInt(minLightness, maxLightness) / 100;

	const q = lightness < 0.5 ?
		lightness * (lightness + saturation) :
		lightness + saturation - (lightness * saturation);
	const p = (2 * lightness) - q;

	const r = Math.floor(hue2rgb(p, q, hue + (1 / 3)) * 255);
	const g = Math.floor(hue2rgb(p, q, hue) * 255);
	const b = Math.floor(hue2rgb(p, q, hue - (1 / 3)) * 255);
	/* eslint-disable no-mixed-operators */
	const c = ((b | g << 8 | r << 16) | 1 << 24).toString(16).slice(1);

	return '#' + c;
   }

  _randomInt(min, max) {
	  return Math.round(min + (Math.random() * (max - min)));
  }

  _randomColor() {
    return '#' + _.sampleSize(this.opts.colorHex, 3).join('');
  }
}

module.exports = Captcha;

