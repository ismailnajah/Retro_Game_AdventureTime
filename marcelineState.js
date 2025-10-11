import { Projectile } from './projectile.js';

const idleState = (marceline) => {
    return {
        enter: () => {
            marceline.setAnimationId('idleFlying');
        },
        update: () => {
            marceline.y = marceline.groundY - 10 + Math.sin(Date.now() / 150) * 5;
            if (Math.random() < 0.5)
                marceline.setState('transform');
        },
    }
}

const monsterIdleState = (marceline) => {
    return {
        enter: () => {
            marceline.setAnimationId('monsterIdle');
            marceline.isAttacking = false;
        },
        update: () => {
            if (Math.random() < 0.00)
                marceline.setState('monsterRangeAttack');
            else if (Math.random() < 0.02)
                marceline.setState('monsterMeleeAttack');
        },
    }
}

const transformState = (marceline) => {
    return {
        enter: () => {
            const hitbox = marceline.getHitbox();
            marceline.y = marceline.groundY - 35;
            marceline.setAnimationId('transform');
        },
        update: () => {
            const finished = marceline.animations[marceline.animation_id].finished();
            if (finished) {
                marceline.setState('monsterIdle');
            }
        },
    }
}

const monsterRangeAttackState = (marceline) => {
    return {
        enter: () => {
            marceline.setAnimationId('monsterBat_range_attack');
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
                marceline.setState('monsterIdle');
            }
        },
    }
}

const monsterMeleeAttackState = (marceline) => {
    return {
        enter: () => {
            marceline.setAnimationId('monsterBat_attack');
        },
        update: () => {
            const finished = marceline.animations[marceline.animation_id].finished();
            const currentFrame = marceline.animations[marceline.animation_id].currentFrame;
            marceline.isAttacking = currentFrame > 5 && currentFrame < 8;
            if (finished) {
                marceline.setState('monsterIdle');
            }
        }
    }
}



export function setStates(marceline)
{
    return {
        'idle': idleState(marceline),
        'monsterIdle': monsterIdleState(marceline),
        'monsterRangeAttack': monsterRangeAttackState(marceline),
        'monsterMeleeAttack': monsterMeleeAttackState(marceline),
        'transform': transformState(marceline),
    };
}