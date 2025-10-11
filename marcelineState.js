import { Projectile } from './projectile.js';

const idleState = (marceline) => {
    return {
        enter: () => {
            marceline.setAnimationId('idleFlying');
        },
        update: () => {
            marceline.y = marceline.groundY - 10 + Math.sin(Date.now() / 150) * 5;
            if (Math.random() < 0.1) {
                marceline.setState('monsterRangeAttack');
            }
        },
    }
}

const monsterRangeAttackState = (marceline) => {
    return {
        enter: () => {
            marceline.setAnimationId('monsterBat_range_attack');
            const hitbox = marceline.getHitbox();
            marceline.y = marceline.groundY - hitbox.height / 2 + 30;
        },
        update: () => {
            const finished = marceline.animations[marceline.animation_id].finished();
            const dir = marceline.direction;
            const offset = 60;
            if (marceline.animations[marceline.animation_id].currentFrame == 5) {
                marceline.projectiles.push(
                    new Projectile(
                        marceline.x + ( dir === 'right' ? offset : -offset ), 
                        marceline.y + 20,
                        marceline.direction,
                        'monster_projectile_moving',
                        'monster_projectile_exploding'
                    )
                );
            }
            if (finished) {
                // marceline.setState('idle');
            }
        },
    }
}

export function setStates(marceline)
{
    return {
        'idle': idleState(marceline),
        'monsterRangeAttack': monsterRangeAttackState(marceline),
    };
}