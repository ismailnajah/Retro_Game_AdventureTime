import { marcelineSpritesMetaData } from "./MarcelineSpritesMetadata.js";
import { AnimationfromMetadata } from "./animation.js";
import { setStates } from "./marcelineState.js";

class Marceline
{
    constructor(x, y, width, height)
    {
        this.maxHp = 200;
        this.hp = 200;
        this.x = x;
        this.y = y;
        this.direction = 'left';
        this.screenWidth = width;
        this.screenHeight = height;
        this.speed = 20;
        this.groundY = y;

        this.xVelocity = 0;
        this.yVelocity = 0;
        this.maxHeight = 50;

        this.isAttacking = false;
        this.projectiles = [];
        
        this.isHuman = false;

        this.state = 'idle';
        this.states = setStates(this);

        this.animation_id = 'idleFlying';
        this.animations = setAnimations();
    }

    setState(state)
    {
        if (this.state !== state)
        {
            this.state = state;
            this.states[state].enter();
        }
    }

    update(deltaTime)
    {
        if (Math.floor(Date.now() / 50) % 2 == 0)
        {
            this.states[this.state].update();
            this.animations[this.animation_id].update();
        }
        this.projectiles.forEach(p => p.update());
        this.projectiles = this.projectiles.filter(
            p => (!p.isExploded && p.x > -50 && p.x < this.screenWidth + 50)
        );
    }

    hitPlayer(player)
    {
        const player_hitbox = player.getHitbox();
        for (const p of this.projectiles)
        {
            const p_hitbox = p.getHitbox();
            if (player_hitbox.x < p.x + 10 && player_hitbox.x + player_hitbox.width > p.x - 10 &&
                player_hitbox.y < p.y + 10 && player_hitbox.y + player_hitbox.height > p.y - 10)
            {
                return true;
            }
        }
    }

    setAnimationId(id)
    {
        if (this.animation_id !== id)
        {
            this.animation_id = id;
            this.animations[id].reset();
        }
    }

    getHitbox()
    {
        // hitbox offset for less punishing collisions
        const offsetX = 0;
        const offsetY = 0;

        const frame = this.animations[this.animation_id];
        const currentFrame = frame.currentFrame
        const hitbox = frame.hitboxes[currentFrame];
        let hitbox_x = hitbox.x + frame.offsetX;
        if (this.direction === 'left')
            hitbox_x = frame.width - hitbox.x - hitbox.width - frame.offsetX;
        return {
            x: this.x + hitbox_x - frame.width / 2 + offsetX,
            y: this.y + hitbox.y - frame.height / 2 + frame.offsetY + offsetY,
            width: hitbox.width - offsetX * 2,
            height: hitbox.height - offsetY * 2,
        };
    }

    draw(ctx, assets)
    {
        
        ctx.save();
        let frame = this.animations[this.animation_id];
        ctx.translate(this.x, this.y);
        if (this.direction == 'left')
            ctx.scale(-1, 1);
        ctx.drawImage(assets.get(frame.sprite_name),
        frame.x, frame.y, frame.width, frame.height, 
        -frame.width / 2 + frame.offsetX,
        -frame.height / 2 + frame.offsetY,
        frame.width, frame.height);
        ctx.restore();
        ctx.strokeStyle = 'red';
        const hitbox = this.getHitbox();
        ctx.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);

        this.projectiles.forEach(p => p.draw(ctx, assets));
    } 
}

function setAnimations()
{
    let anim = {};

    for (const key in marcelineSpritesMetaData)
        anim[key] = AnimationfromMetadata(key, marcelineSpritesMetaData);
    return anim;
}

export { Marceline };
