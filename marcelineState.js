import { Projectile } from './projectile.js';

const idleState = (marceline) => {
    return {
        enter: () => {
            marceline.setAnimationId(marceline.isCalm ? 'idle' : 'idleFlying');
            if (marceline.isCalm)
                marceline.y = marceline.groundY;
            marceline.isAttacking = false;
            marceline.immune = false;
        },
        update: () => {
            if (!marceline.isCalm)
            marceline.y = marceline.groundY - 10 + Math.sin(Date.now() / 150) * 5;
            if (marceline.isCalm) return;
            if (marceline.hp <= marceline.maxHp / 2)
                marceline.setState('monsterTransform');
            else if (Math.random() < 0.05)
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
            const duration = 50;
            timer = Math.floor(Math.random() * duration) + duration;
            marceline.setAnimationId('guitar_attack');
        },
        update: () => {
            marceline.y = marceline.groundY - 10 + Math.sin(Date.now() / 150) * 5;
            const finished = marceline.animations[marceline.animation_id].finished();
            const dir = marceline.direction;
            const offset = 0;
            if (timer % 20 === 0) {
                marceline.projectiles.push(
                    new Projectile(
                        marceline.x + ( dir === 'right' ? offset : -offset ), 
                        marceline.y + 10,
                        marceline.direction,
                        7,
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
            marceline.invisible = true;
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
                marceline.invisible = false;
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
            marceline.immuneTimer = 30;
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

            if (marceline.player_distance > 100 && Math.random() < 0.015)
                marceline.setState('monsterRangeAttack');
            else if (marceline.player_distance <= 100 && Math.random() < 0.3)
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
    let timer = 0;
    return {
        enter: () => {
            marceline.setAnimationId('monsterBat_range_attack');
            marceline.isAttacking = true;
            timer = 30; // Duration of the attack
        },
        update: () => {
            const finished = marceline.animations[marceline.animation_id].finished();
            const dir = marceline.direction;
            const offset = 60;
            if (marceline.animations[marceline.animation_id].currentFrame === 4) {
                marceline.projectiles.push(
                    new Projectile(
                        marceline.x + ( dir === 'right' ? offset : -offset ), 
                        marceline.y,
                        marceline.direction,
                        5,
                        'monster_projectile_moving',
                        'monster_projectile_exploding'
                    )
                );
            }
            timer -= 1;
            if (finished && timer <= 0) {
                marceline.setState('monsterIdle');
            }
        },
    }
}

const monsterMeleeAttackState = (marceline) => {
    return {
        enter: () => {
            marceline.setAnimationId('monsterBat_attack');
            marceline.immune = true;
        },
        update: () => {
            const finished = marceline.animations[marceline.animation_id].finished();
            const currentFrame = marceline.animations[marceline.animation_id].currentFrame;
            marceline.isAttacking = currentFrame > 4 && currentFrame < 7;
            if (finished)
                marceline.setState('monsterIdle');
        }
    }
}

const calmDownState = (marceline) => {
    return {
        enter: () => {
            marceline.setAnimationId('transform');
            marceline.animations[marceline.animation_id].reverse();
            marceline.isAttacking = false;
            marceline.immune = true;
            marceline.immuneTimer = 0;
        },
        update: () => {
            const finished = marceline.animations[marceline.animation_id].finished();
            if (finished) {
                marceline.isCalm = true;
                marceline.isHuman = true;
                marceline.setState('idle');
            }
        },
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
        'calmDown': calmDownState(marceline),
    };
}