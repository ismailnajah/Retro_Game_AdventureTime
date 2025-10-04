import * as playerState from "./playerState.js";
import { animation } from "./animation.js";

class Player
{
    constructor(x, y)
    {
        this.hp =  5;
        this.x = x;
        this.y = y;
        this.groundY = y;
        this.xVelocity = 0;
        this.yVelocity = 0;
        this.direction = 'right';
        this.speed = 8;
        
        this.hardHit = true;
        this.hurtTimer = 0;
        this.isShielded = false;
        this.isDead = false;

        this.state = 'idle';
        this.states = setStates(this);

        this.hitbox_w = 64;
        this.hitbox_h = 64; // depending on the current frame of animation
        this.animation_id = 'idle';
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
        let frame = this.animations[this.animation_id].getSpriteFrame();
        ctx.translate(this.x + frame.width / 2, this.y + frame.height / 2);
        if (this.direction == 'left')
            ctx.scale(-1, 1);
        ctx.drawImage(assets.get(frame.sprite_name), 
                frame.x, frame.y, frame.width, frame.height, 
                -frame.width / 2 + frame.offsetX,
                -frame.height / 2 + frame.offsetY,
                frame.width, frame.height);
        ctx.restore();
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
    }

    collidesWith(other)
    {
        return this.x < other.x + 10 && this.x + this.hitbox_w > other.x - 10 &&
               this.y < other.y + 10 && this.y + this.hitbox_h > other.y - 10;
    }
}

function setStates(player)
{
    const states = {};
    states['idle']    = playerState.idleState(player);
    states['running'] = playerState.runningState(player);
    states['jumping'] = playerState.jumpingState(player);
    states['falling'] = playerState.fallingState(player);
    states['landing'] = playerState.landingState(player);
    states['ducking'] = playerState.duckingState(player);
    states['shieldOut'] = playerState.shieldOutState(player);
    states['shieldIn'] = playerState.shieldInState(player);
    states['shieldWalk'] = playerState.shieldWalkState(player);
    states['hurt'] = playerState.hurtState(player);
    states['die'] = playerState.dieState(player);
    return states;
}

function setAnimations()
{
    let anim = {};
    anim['idle'] = animation('idle1', 64, 64, 12);
    anim['idle2'] = animation('idle2', 64, 64, 12);
    anim['idle3'] = animation('idle3', 64, 64, 12);
    anim['idle4'] = animation('idle4', 64, 64, 21);
    anim['walk'] = animation('walk', 64, 64, 17);
    anim['running'] = animation('run', 64, 64, 12);
    anim['jumping'] = animation('jump', 64, 64, 5, false);
    anim['falling'] = animation('fall', 64, 64, 5, false);
    anim['landing'] = animation('land', 64, 64, 5, false);
    anim['ducking'] = animation('duck', 64, 64, 3, false);
    anim['hurt'] = animation('hurt', 64, 64, 4);
    anim['hardHit'] = animation('hard_hit', 64, 64, 13);
    anim['shieldOut'] = animation('shield_out', 64, 64, 7, false);
    anim['shieldIn'] = animation('shield_in', 64, 64, 7, false);
    anim['shieldWalk'] = animation('shield_walk', 64, 64, 6);
    anim['die'] = animation('die', 64, 64, 18, false, 0, 4);
    return anim;
};

export { Player };