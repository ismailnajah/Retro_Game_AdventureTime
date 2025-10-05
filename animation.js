class animation
{
    constructor(sprite_name, frameW, frameH, frameCount, hitboxes = [], repeated = true, offsetX = 0, offsetY = 0)
    {
        this.sprite_name = sprite_name;
        this.frameCount = frameCount;
        this.x = 0;
        this.y = 0;
        this.width = frameW;
        this.height = frameH;

        this.offsetX = offsetX;
        this.offsetY = offsetY;

        this.repeated = repeated;
        this.reversed = false;
        this.paused = false;

        this.currentFrame = 0;
        this.hitboxes = hitboxes;
    }

    update()
    {
        if (this.paused)
            return ;

        if (this.reversed)
            this.currentFrame = (this.currentFrame - 1 >= 0 ) ? this.currentFrame - 1 : (this.repeated ? this.frameCount - 1 : 0);
        else
            this.currentFrame = (this.currentFrame + 1 < this.frameCount) ? this.currentFrame + 1 : (this.repeated ? 0 : this.frameCount - 1);
        this.x = this.currentFrame * this.width;
    }

    finished()
    {
        return (this.currentFrame === 0 && this.reversed) || (this.currentFrame === this.frameCount - 1 && !this.reversed);
    }

    reset()
    {
        this.currentFrame = 0;
        this.reversed = false;
    }

    reverse()
    {
        this.reversed = !this.reversed;
    }

    pause()
    {
        this.paused = true;
    }

    resume()
    {
        this.paused = false;
    }
}

// function animation(_sprite_name, _frameW, _frameH, _frameCount, _repeated = true, _offsetX = 0, _offsetY = 0)
// {
//     let sprite_name = _sprite_name;
//     let frameCount = _frameCount;
//     let frameW = _frameW;
//     let frameH = _frameH;

//     let offsetX = _offsetX;
//     let offsetY = _offsetY;

//     let repeated = _repeated;
//     let reversed = false;
//     let paused = false;

//     let currentFrame = 0;

//     const update = function() {
//         if (paused)
//             return ;//(currentFrame === 0 && !reversed) || (currentFrame === frameCount - 1 && reversed);

//         if (reversed)
//             currentFrame = (currentFrame - 1 >= 0 ) ? currentFrame - 1 : (repeated ? frameCount - 1 : 0);
//         else
//             currentFrame = (currentFrame + 1 < frameCount) ? currentFrame + 1 : (repeated ? 0 : frameCount - 1);
//     }

//     const finished = function() {
//         return (currentFrame === 0 && reversed) || (currentFrame === frameCount - 1 && !reversed);
//     }

//     const reset = function() {
//         currentFrame = 0;
//         reversed = false;
//     }

//     const reverse = function() {
//         reversed = !reversed;
//     }

//     const pause = function() {
//         paused = true;
//     }

//     const resume = function() {
//         paused = false;
//     }

//     const getSpriteFrame = function() {
//         return {
//             sprite_name: sprite_name,
//             x: currentFrame * frameW,
//             y: 0,
//             width: frameW,
//             height: frameH,
//             offsetX: offsetX,
//             offsetY: offsetY
//         };
//     }

//     return {
//         update: update,
//         reset: reset,
//         reverse: reverse,
//         pause: pause,
//         resume: resume,
//         finished: finished,
//         getSpriteFrame: getSpriteFrame,
//     };
// }

export { animation };