import { marcelineSpritesMetadata } from "./marcelineSpritesMetadata.js";
import { AnimationfromMetadata } from "./animation.js";
import { setStates } from "./marcelineState.js";
import { boxesIntersect, distance } from "./utils.js";

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
        this.newX = x;

        this.isAttacking = false;
        this.projectiles = [];
        
        this.isHuman = false;
        this.immune = false;

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

    update(deltaTime, player)
    {
        if (this.hitPlayer(player))
            player.hurt(1);

        if (Math.floor(Date.now() / 50) % 2 == 0)
        {
            this.states[this.state].update();
            this.animations[this.animation_id].update();
        }
        this.projectiles.forEach(p => p.update());
        this.projectiles = this.projectiles.filter(
            p => (!p.isExploded && p.x > -50 && p.x < this.screenWidth + 50)
        );
        if (this.state === "guitarAttack" && distance(this, player) < 80)
        {
            this.newX = player.x + (this.x < player.x ? 150 : -150);
            this.setState("startTeleport");
        }
        this.direction = player.x > this.x ? 'right' : 'left';
    }

    hitPlayer(player)
    {
        const player_hitbox = player.getHitbox();
        for (const p of this.projectiles)
        {
            if (p.isExploded || p.state != 'moving')
                continue;
            if (boxesIntersect(player_hitbox, p.getHitbox()))
            {
                p.exploade();
                player.hardHit = true;
                return true;
            }
            
        }
        if (!this.isAttacking)
            return false;
        return boxesIntersect(player_hitbox, this.getHitbox());     
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

    for (const key in marcelineSpritesMetadata)
        anim[key] = AnimationfromMetadata(key, marcelineSpritesMetadata);
    
    // Adjust offsets for better alignment
    anim['monsterBat_attack'].offsetX = 20;
    anim['monsterIdle'].offsetY = -20;
    anim['monsterBat_range_attack'].offsetY = -20;
    anim['monsterBat_attack'].offsetY = -20;
    anim['transform'].offsetY = -20;

    anim['guitar_out'].offsetY = -6;
    anim['guitar_out'].offsetX = 4;
    anim['teleport'].offsetY = -6;
    anim['teleport'].offsetX = 4;
    return anim;
}

export { Marceline };
