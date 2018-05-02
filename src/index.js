const qrcode = require('qrcode');

class CreateShareImage {
    constructor () {
        const body = document.body;
        this.canvas = document.createElement('canvas');
        this.maxWidth = this.canvas.width = 828;
        this.maxHeight = this.canvas.height = 680;
        this.mainBorder = 20;
        this.innerWidth = this.maxWidth - (this.mainBorder * 2);
        this.innerHeight = this.maxHeight - (this.mainBorder * 2);
        this.padding = this.mainBorder + 20;
        this.margin = 20;

        this.mainImageWidth = 200;
        this.coverSize = 80;
        this.qrcodeWidth = 200;
        this.mainTextWidth = this.maxWeight - this.mainImageWidth - (this.padding * 2);
        // body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
    }
    create (options) {
        return Promise.all([
            this._loadImage(options.src),
            this._loadImage(options.cover),
            this._createQrCode(options.url),
        ])
        .then(([goods, cover, qrcodeCanvas]) => {
            this._drawBackground();

            /**
             * draw cover image
             */
            const radius = this.coverSize / 2;
            const center = this.padding + radius;
            const tmpImage = this._resizeImage(cover, this.coverSize, this.coverSize, this.padding, this.padding);
            const pattern = this.ctx.createPattern(tmpImage, 'no-repeat');
            this.ctx.fillStyle = pattern;
            this.ctx.beginPath();
            this.ctx.arc(center, center, radius, 0, 2 * Math.PI, false);
            this.ctx.fill();
            const coverEndX = this.padding + this.coverSize + this.margin;

            const userNameTop = this.padding + 25;
            this.ctx.font = '28px sans-serif';
            this.ctx.fillStyle = '#333';
            this.ctx.fillText(options.userName, coverEndX, userNameTop);
            this.ctx.fillStyle = '#999';
            this.ctx.fillText(`发起了${options.groupUserNumber}团`, coverEndX, userNameTop + 40);

            // goods image
            this.ctx.drawImage(goods, this.padding, coverEndX + this.margin, this.mainImageWidth, this.mainImageWidth);

            const textBoxWidth = this.maxWidth - (this.padding * 2) - this.margin - this.mainImageWidth;
            const textBeginX = this.padding + this.mainImageWidth + this.margin;

            const textEndY = this._drawLongText(options.text, textBoxWidth, textBeginX, coverEndX + this.margin + 30);
            this.ctx.fillStyle = '#e93b3d';
            this.ctx.fillText(`${options.groupUserNumber}人拼购价 ￥${Number(options.yuan).toFixed(2)}`, textBeginX, textEndY + 80);

            const qrcodeX = this.maxWidth - this.padding - this.qrcodeWidth;
            const qrcodeY = this.maxHeight - this.padding - this.qrcodeWidth;
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`长按识别二维码：`, qrcodeX, qrcodeY + 180);
            this.ctx.drawImage(qrcodeCanvas, qrcodeX, qrcodeY);
            
            return this.canvas;
        })
    }
    _resizeImage (img, width, height, startX, startY) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width + startX;
        canvas.height = height + startY;
        ctx.drawImage(img, startX, startY, width, height);
        return canvas;
    }
    _createQrCode (url) {
        return new Promise((resolve, reject) => {
            qrcode.toCanvas(url, {
                width: this.qrcodeWidth,
            }, (err, canvas) => {
                if (err) {
                    return reject(err);
                }
                resolve(canvas);
            })
        });
    }
    _drawBackground () {
        this.ctx.fillStyle = '#fbfbfb';
        this.ctx.fillRect(this.mainBorder, this.mainBorder, this.innerWidth, this.innerHeight);
    }
    _loadImage (src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                resolve(img);
            }
            img.crossOrigin = 'Anonymous';
            img.src = src;
        });
    }
    _drawLongText (text, maxWidth, initX, initY) {
        let y = initY;
        let lineWidth = 0;
        let lastSubIndex = 0;
        this.ctx.font = '30px sans-serif';
        for (let i = 0; i < text.length; i++) {
            lineWidth += this.ctx.measureText(text[i]).width;
            if (lineWidth > maxWidth) {
                this.ctx.fillText(text.substring(lastSubIndex, i), initX, y);
                y += 40;
                lineWidth = 0;
                lastSubIndex = i;
            }
            if (i === text.length - 1) {
                this.ctx.fillText(text.substring(lastSubIndex, i + 1), initX, y);
            }
        }
        return y;
    }
}

const button = document.getElementById('button');
const imgBox = document.getElementById('img');
const userNameEle = document.getElementById('userName');
const goodsNameEle = document.getElementById('goodsName');
const goodsImageEle = document.getElementById('goodsImage');
const coverEle = document.getElementById('cover');
const urlEle = document.getElementById('url');
const numberEle = document.getElementById('number');
const priceEle = document.getElementById('price');

button.addEventListener('click', () => {
    const shareImage = new CreateShareImage();

    const imgPromise = shareImage.create({
        userName: userNameEle.value,
        yuan: priceEle.value,
        groupUserNumber: numberEle.value,
        cover: coverEle.value,
        src: goodsImageEle.value,
        text: goodsNameEle.value,
        url: urlEle.value
    });
    imgPromise.then((canvas) => {
        var img = document.createElement('img');
        img.setAttribute('class', 'display');
        img.onload = () => {
            imgBox.innerHTML = '';
            imgBox.appendChild(img);
        }
        img.src = canvas.toDataURL();
    });
})