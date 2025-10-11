import { Projectile } from './projectile.js';

const idleState = (marceline) => {
    return {
        enter: () => {
            marceline.setAnimationId('idleFlying');
            marceline.isAttacking = false;
            marceline.immune = false;
        },
        update: () => {
            marceline.y = marceline.groundY - 10 + Math.sin(Date.now() / 150) * 5;
            if (marceline.hp <= marceline.maxHp / 2)
                marceline.setState('monsterTransform');
            if (Math.random() < 0.001)
                marceline.setState('guitarOut');
        },
    }
}

const guitarOutState = (marceline) => {
    return {
        enter: () => {
            marceline.immune = true;
            marceline.setAnimationId('guitar_out');
        },
        update: () => {
            const finished = marceline.animations[marceline.animation_id].finished();
            if (finished) {
                marceline.setState('guitarAttack');
            }
        },
    }
}

const guitarAttackState = (marceline) => {
    let timer = 0;
    return {
        enter: () => {
            const duration = 15;
            timer = Math.floor(Math.random() * duration) + duration;
            marceline.setAnimationId('guitar_attack');
        },
        update: () => {
            marceline.y = marceline.groundY - 10 + Math.sin(Date.now() / 150) * 5;
            const finished = marceline.animations[marceline.animation_id].finished();
            const dir = marceline.direction;
            const offset = 0;
            if (timer % 10 === 0) {
                marceline.projectiles.push(
                    new Projectile(
                        marceline.x + ( dir === 'right' ? offset : -offset ), 
                        marceline.y + 10,
                        marceline.direction,
                        'music_notes_moving',
                        'music_notes_exploding'
                    )
                );
            }
            timer -= 1;
            if (finished && timer <= 0) {
                marceline.setState('guitarIn');
                timer = 0;
            }
        },
    }
}

const startTeleportState = (marceline) => {
    return {
        enter: () => {
            marceline.setAnimationId('teleport');
        },
        update: () => {
            const finished = marceline.animations[marceline.animation_id].finished();
            if (finished) {
                marceline.x =  marceline.newX;
                marceline.setState('endTeleport')
            }
        },
    }
}

const endTeleportState = (marceline) => {
    return {
        enter: () => {
            marceline.setAnimationId('teleport');
            marceline.animations[marceline.animation_id].reverse();
        },
        update: () => {
            const finished = marceline.animations[marceline.animation_id].finished();
            if (finished) {
                marceline.setState('guitarAttack');
            }
        },
    }
}

const guitarInState = (marceline) => {
    return {
        enter: () => {
            marceline.setAnimationId('guitar_out');
            marceline.animations[marceline.animation_id].reverse();
        },
        update: () => {
            const finished = marceline.animations[marceline.animation_id].finished();
            if (finished) {
                marceline.immune = false;
                marceline.setState('idle');
            }
        },
    }
}

const hurtState = (marceline) => {
    return {
        enter: () => {
            marceline.immuneTimer = 50;
            marceline.immune = true;
            marceline.setAnimationId(marceline.isHuman ? 'marceline_hurt' : 'monsterHurt');
        },
        
        update: () => {
            const finished = marceline.animations[marceline.animation_id].finished();
            if (finished) {
                marceline.setState(marceline.isHuman ? 'idle' : 'monsterIdle');
            }
        },
    }
}

const monsterIdleState = (marceline) => {
    return {
        enter: () => {
            marceline.setAnimationId('monsterIdle');
            marceline.isAttacking = false;
            marceline.isHuman = false;
            marceline.immune = false;
        },
        update: () => {
            if (Math.random() < 0.03)
                marceline.setState('monsterRangeAttack');
            else if (Math.random() < 0.02)
                marceline.setState('monsterMeleeAttack');
        },
    }
}

const monsterTransformState = (marceline) => {
    return {
        enter: () => {
            marceline.immune = true;
            marceline.isHuman = false;
            marceline.y = marceline.groundY - 20;
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
                        marceline.y,
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
        'guitarOut': guitarOutState(marceline),
        'guitarAttack': guitarAttackState(marceline),
        'startTeleport': startTeleportState(marceline),
        'endTeleport': endTeleportState(marceline),
        'guitarIn': guitarInState(marceline),
        'hurt': hurtState(marceline),
        'monsterIdle': monsterIdleState(marceline),
        'monsterRangeAttack': monsterRangeAttackState(marceline),
        'monsterMeleeAttack': monsterMeleeAttackState(marceline),
        'monsterTransform': monsterTransformState(marceline),
    };
}