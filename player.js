import * as playerState from "./playerState.js";
import { animation } from "./animation.js";
import { playerAssetsData } from "./playerAssetsData.js";

class Player
{
    constructor(x, y)
    {
        this.maxHp = 8;
        this.hp = 8;
        this.x = x;
        this.y = y;
        this.groundY = y;
        this.xVelocity = 0;
        this.yVelocity = 0;
        this.direction = 'right';
        this.speed = 8;
        
        this.shouldCombo = false;
        this.hardHit = true;
        this.hurtTimer = 0;
        this.isShielded = false;
        this.isDead = false;

        this.state = 'idle';
        this.states = setStates(this);

        this.animation_id = 'idle1';
        this.animations = setAnimations();
    }
    
    setAnimationId(id)
    {
        if (this.animation_id !== id)
        {
            this.animation_id = id;
            this.animations[id].reset();
        }
    }

    setState(state)
    {
        if (this.state !== state)
        {
            this.state = state;
            this.states[state].enter();
        }
    }

    draw(ctx, assets)
    {
        if (this.hurtTimer > 0) {
            this.hurtTimer -= 0.1;
            if (this.hurtTimer < 0) 
                this.hurtTimer = 0;
            if (Math.floor(this.hurtTimer * 10) % 2 == 0)
                return;
        }
        ctx.save();
        let frame = this.animations[this.animation_id];
        ctx.translate(this.x, this.y);
        if (this.direction == 'left')
            ctx.scale(-1, 1);
        // ctx.drawImage(assets.get(frame.sprite_name), this.x, this.y);
        ctx.drawImage(assets.get(frame.sprite_name),
                frame.x, frame.y, frame.width, frame.height, 
                -frame.width / 2 + frame.offsetX,
                -frame.height / 2 + frame.offsetY,
                frame.width, frame.height);
        ctx.restore();
        ctx.strokeStyle = 'red';
        const hitbox = this.getHitbox();
        ctx.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
    }

    update (deltatime)
    {
        if (this.hp <= 0 && this.state != 'die')
        {
            this.state = 'die';
            this.states[this.state].enter();
        }
        this.states[this.state].update();
        this.animations[this.animation_id].update();
        if (this.x < 0)
            this.x = 0;
    }

    getHitbox()
    {
        const frame = this.animations[this.animation_id];
        const currentFrame = frame.currentFrame
        const hitbox = frame.hitboxes[currentFrame];
        let hitbox_x = hitbox.x + frame.offsetX;
        if (this.direction === 'left')
            hitbox_x = frame.width - hitbox.x - hitbox.width - frame.offsetX;
        return {
            x: this.x + hitbox_x - frame.width / 2,
            y: this.y + hitbox.y - frame.height / 2 + frame.offsetY,
            width: hitbox.width,
            height: hitbox.height
        };
    }
}

function setStates(player)
{
    const states = {};
    states['idle']    = playerState.idleState(player);
    states['walking'] = playerState.walkingState(player);
    states['jakeRollIn'] = playerState.jakeRollInState(player);
    states['jakeRoll'] = playerState.jakeRollState(player);
    states['jakeRollOut'] = playerState.jakeRollOutState(player);
    states['running'] = playerState.runningState(player);
    states['jumping'] = playerState.jumpingState(player);
    states['falling'] = playerState.fallingState(player);
    states['landing'] = playerState.landingState(player);
    states['ducking'] = playerState.duckingState(player);
    states['shieldOut'] = playerState.shieldOutState(player);
    states['shieldIn'] = playerState.shieldInState(player);
    states['shieldWalk'] = playerState.shieldWalkState(player);
    states['hurt'] = playerState.hurtState(player);
    states['swordOut'] = playerState.swordOutState(player);
    states['swordAttack'] = playerState.swordAttackState(player);
    states['swordIn'] = playerState.swordInState(player);
    states['die'] = playerState.dieState(player);
    return states;
}

function setAnimations()
{
    let anim = {};
    for (let key in playerAssetsData)
    {
        let data = playerAssetsData[key];
        anim[key] = new animation(key, data.frame_w, data.frame_h, data.frames, data.hitboxes);
    }

    //manualy tweak some animations
    anim['jump'].repeated = false;
    anim['fall'].repeated = false;
    anim['land'].repeated = false;
    anim['duck'].repeated = false;
    anim['hurt'].repeated = false;
    anim['die'].repeated = false;
    anim['sword_out'].repeated = false;
    anim['sword_attack'].repeated = false;
    anim['sword_combo'].repeated = false;
    anim['jake_roll_in'].repeated = false;
    anim['jake_roll_out'].repeated = false;

    anim['sword_out'].offsetX = 14;
    anim['sword_out'].offsetY = -14;
    anim['sword_attack'].offsetX = 14;
    anim['sword_attack'].offsetY = -14;
    anim['sword_combo'].offsetX = 14;
    anim['sword_combo'].offsetY = -14;
    
    anim['jake_roll_in'].offsetY = -8;
    anim['jake_roll'].offsetY = -8;
    anim['jake_roll_out'].offsetX = -4;
    anim['jake_roll_out'].offsetY = -4;
    
    return anim;
};

export { Player };