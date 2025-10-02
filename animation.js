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

function animation(_sprite_name, _frameW, _frameH, _frameCount, _repeated = true)
{
    let sprite_name = _sprite_name;
    let frameCount = _frameCount;
    let frameW = _frameW;
    let frameH = _frameH;

    let offsetX = 0;
    let offsetY = 0;

    let repeated = _repeated;
    let reversed = false;
    let paused = false;

    let currentFrame = 0;

    const update = function() {
        if (!repeated)
        {
            if ( reversed && currentFrame === 0)
                return true;
            if (!reversed && currentFrame === frameCount - 1)
                return true;
        }
        if (paused)
            return false;
        currentFrame = (currentFrame + (reversed ? -1 : 1) ) % frameCount;
    }

    const reset = function() {
        currentFrame = 0;
        reversed = false;
    }

    const reverse = function() {
        reversed = !reversed;
    }

    const pause = function() {
        paused = true;
    }

    const resume = function() {
        paused = false;
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
        reverse: reverse,
        pause: pause,
        resume: resume,
        getSpriteFrame: getSpriteFrame,
    };
}

export { animation, assetManager };