function assetManager()
{
    let assets = {};
    let assetPromises = [];

    let addAsset = async function(name, src) {
        let img = new Image();
        let promise = new Promise((resolve, reject) => {
            img.onload = () => {
                assets[name] = img;
                resolve();
            };
            img.onerror = reject;
        });
        img.src = src;
        assetPromises.push(promise);
    }

    let loadAssets = async function() {    
        await Promise.all(assetPromises);
    }

    let getAsset = function(name) {
        return assets[name];
    }
    return {
        loadAssets: loadAssets,
        addAsset: addAsset,
        getAsset: getAsset
    };
}

function animation(_sprite_name, _frameW, _frameH, _frameCount, _offsetX = 0, _offsetY = 0)
{
    let sprite_name = _sprite_name;
    let frameW = _frameW;
    let frameH = _frameH;
    let frameCount = _frameCount;
    let offsetX = _offsetX;
    let offsetY = _offsetY;

    let currentFrame = 0;

    const update = function() {
        currentFrame = (currentFrame + 1) % frameCount;
        return currentFrame === 0;
    }

    const reset = function() {
        currentFrame = 0;
    }

    const getSpriteFrame = function() {
        return {
            sprite_name: sprite_name,
            x: currentFrame * frameW,
            y: 0,
            width: frameW,
            height: frameH,
            offsetX: offsetX,
            offsetY: offsetY
        };
    }

    return {
        update: update,
        reset: reset,
        getSpriteFrame: getSpriteFrame,
    };
}

export { animation, assetManager };