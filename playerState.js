const idleState = (player) => {
    return {
        enter : () => {
            player.stop();
            player.setAnimationId('idle1');
        },
        update: () => {},
        onKeyDown: (input) => {
            switch (input)
            {
                case 'ArrowRight':
                    player.state = 'running';
                    player.direction = 'right';
                    break;
                case 'ArrowLeft':
                    player.state = 'running';
                    player.direction = 'left';
                    break;
                case 'ArrowUp':
                    player.state = 'jumping';
                    break;
                case 'ArrowDown':
                    player.state = 'ducking';
                    break;
                case 'KeyG':
                    player.state = 'shieldOut';
                    break;
                case 'Space':
                    player.state = 'swordOut';
                    break;
                default:
                    break;
            }
            if (player.state !== 'idle')
                player.states[player.state].enter();
        },
    
        onKeyUp: (input) => {}        
    }
}

const walkingState = (player) => {
    return {
        enter: () => {
            player.xVelocity = 0;
            player.yVelocity = 0;
            player.setAnimationId('walk');
        },
        update: () => {},
        onKeyUp: (input) => {},
        onKeyDown: (input) => {}
    }
}

const jakeRollInState = (player) => {
    return {
        enter: () => {
            player.xVelocity = player.speed * 1.5;
            player.yVelocity = 0;
            player.setAnimationId('jake_roll_in');
        },
        update: () => {
            player.x += player.xVelocity;
            const finished = player.animations[player.animation_id].finished();
            if (finished)
            {
                player.state = 'jakeRoll';
                player.states[player.state].enter();
            }
        },
        onKeyUp: (input) => {},
        onKeyDown: (input) => {}
    }
}

const jakeRollState = (player) => {
    return {
        enter: () => { player.setAnimationId('jake_roll'); },
        update: () => { player.x += player.xVelocity; },
        onKeyUp: (input) => {},
        onKeyDown: (input)=> {}
    }
}

const jakeRollOutState = (player) => {
    return {
        enter: () => {
            player.xVelocity = 0;
            player.setAnimationId('jake_roll_out');
        },
        update: () => {
            const finished = player.animations[player.animation_id].finished();
            if (finished)
            {
                player.state = 'idle';
                player.states[player.state].enter();
            }
        },
        onKeyUp: (input) => {},
        onKeyDown: (input) => {}
    }
}

const runningState = (player) => {
    return {
        enter: () => {
            player.xVelocity = player.speed;
            player.yVelocity = 0;
            player.setAnimationId('run');
        },    
        
        update: () => { player.move(); },
        
        onKeyUp: (input) =>
        {
            if (input !== 'ArrowRight' && input !== 'ArrowLeft')
                return;
            player.setState('idle');
        },

        onKeyDown: (input) =>
        {
            switch (input)
            {
                case 'ArrowRight':
                    player.direction = 'right';
                    break;
                case 'ArrowLeft':
                    player.direction = 'left';
                    break;
                case 'ArrowUp':
                    player.setState('jumping');
                    break;
                case 'ArrowDown':
                    player.setState('ducking');
                    break;
                case 'KeyG':
                    player.setState('shieldOut');
                    break;
                case 'Space':
                    player.setState('swordOut');
                    break;
                default:
                    player.setState('idle');
                    break;
            }
        },
    }
}

const jumpingState = (player) => {
    return {
        enter: () => {
            player.yVelocity = -player.jumpStrength;
            player.setAnimationId('jump');
        },
    
        update: () => {
            player.move();
            player.y += player.yVelocity;
            
            if (player.groundY - player.y >= player.maxHeight)
            {
                player.y = player.groundY - player.maxHeight;
                player.state = 'falling';
                player.states[player.state].enter();
            }
        },
    
        onKeyUp: (input) => {
            if (input !== 'ArrowRight' && input !== 'ArrowLeft')
                return;
            player.xVelocity = 0;
        },
    
        onKeyDown: (input) => {
            if (input !== 'ArrowRight' && input !== 'ArrowLeft')
                return ;
            player.direction = input === 'ArrowRight' ? 'right' : 'left';
        },
    } 
}

const fallingState = (player) => {
    let gravity = 3;

    return {
        enter: () => {
            player.yVelocity = 0;
            player.setAnimationId('fall');
        },
    
        update: () => {
            player.move();
            player.yVelocity += gravity;
            player.y += player.yVelocity;
            if (player.y >= player.groundY)
            {
                player.y = player.groundY;
                player.state = player.xVelocity === 0 ? 'landing' : 'running';  
                player.states[player.state].enter();
            }
        },
    
        onKeyUp: (input) => {
            if (input !== 'ArrowRight' && input !== 'ArrowLeft')
                return ;
            player.xVelocity = 0; 
        },
        
        onKeyDown: (input) => {
            if (input !== 'ArrowRight' && input !== 'ArrowLeft')
                return ;
            player.direction = input === 'ArrowRight' ? 'right' : 'left';
            player.xVelocity = player.speed;
        },
    }
}

const landingState = (player) => {
    return {
        enter: () => {
            player.xVelocity = 0;
            player.yVelocity = 0;
            player.setAnimationId('land');
        },
    
        update: () => {
            if (player.animations[player.animation_id].finished())
            {
                player.state = 'idle';
                player.states[player.state].enter();
            }
        },
    
        onKeyUp: (input) => {},
    
        onKeyDown: (input) => {
            if (input !== 'ArrowRight' && input !== 'ArrowLeft')
                return ;
            player.direction = input === 'ArrowRight' ? 'right' : 'left';
        },
    }    
}

const duckingState = (player) => {
    let standing = false;

    return {
        enter: () => {
            player.xVelocity = 0;
            player.yVelocity = 0;
            standing = false;
            player.setAnimationId('duck');
        },
    
        update: () => {
            const finished = player.animations[player.animation_id].finished();
            if (standing && finished)
            {
                player.state = 'idle';
                player.states[player.state].enter();
            }
        },
    
        onKeyUp: (input) => {
            if (input !== 'ArrowDown')
                return;
            player.animations[player.animation_id].reverse();
            standing = true;
        },
    
        onKeyDown: (input) =>
        {
            if (input !== 'ArrowRight' && input !== 'ArrowLeft')
                return ;
            player.direction = input === 'ArrowRight' ? 'right' : 'left';
        },
    }
}

const shieldOutState = (player) => {
    return {
        enter: () => {
            player.shieldUp = true;
            player.yVelocity = 0;
            player.setAnimationId('shield_out');
        },
        
        update: () => {
            const finished = player.animations[player.animation_id].finished();
            if (finished)
            {
                player.state = 'shieldWalk';
                player.states[player.state].enter();
            }
        },
    
        onKeyUp: (input) => {
            if (input === 'ArrowRight' || input === 'ArrowLeft')
                player.xVelocity = 0;
            if (input === 'KeyG')
            {
                player.state = 'shieldIn';
                player.states[player.state].enter();
            }
        },
        
        onKeyDown: (input) => {
            if (input !== 'ArrowRight' && input !== 'ArrowLeft')
                return ;
            player.direction = input === 'ArrowRight' ? 'right' : 'left';
            player.state = 'shieldWalk';
            player.states[player.state].enter();
        },
    }
}

const shieldWalkState = (player) => {
    const speedModifier = 0.5;

    return {
        enter: () => {
            player.xVelocity = player.xVelocity * speedModifier;
            player.yVelocity = 0;
            player.setAnimationId('shield_walk');
        },
        
        update: () => { player.move(); },
        
        onKeyUp: (input) => {
            if (input === 'ArrowRight' || input === 'ArrowLeft')
                player.xVelocity = 0;
            if (input === 'KeyG')
            {
                player.state = 'shieldIn';
                player.states[player.state].enter();
            }
        },

        onKeyDown: (input) => {
            if (input !== 'ArrowRight' && input !== 'ArrowLeft')
                return ;
            player.direction = input === 'ArrowRight' ? 'right' : 'left';
            player.xVelocity = player.speed / 2;
        },
    }
}

const shieldInState = (player) => {
    return {
        enter: () => {
            player.yVelocity = 0;
            player.shieldUp = false;
            player.setAnimationId('shield_in');
        },
    
        update: () => {
            const finished = player.animations[player.animation_id].finished();
            if (finished)
            {
                player.state = player.xVelocity === 0 ? 'idle' : 'running';
                player.states[player.state].enter();
            }
        },
    
        onKeyUp: (input) => {
            if (input !== 'ArrowRight' && input !== 'ArrowLeft')
                return ;
            player.xVelocity = 0;
        },
    
        onKeyDown: (input) => {
            if (input !== 'ArrowRight' && input !== 'ArrowLeft')
                return ;
            player.direction = input === 'ArrowRight' ? 'right' : 'left';
        },
    }
}

const dieState = (player) => {

    return {
        enter: () => {
            player.stop();
            player.hp = 0;
            player.setAnimationId('die');
        },
        
        update: () => {
            const finished = player.animations[player.animation_id].finished();
            if (finished)
                player.isDead = true;
        },
        
        onKeyUp: (input) => {},
        onKeyDown: (input) => {}, 
    }
}

const hurtState = (player) => {
    const gravity = 2;

    return {
        enter: () => {
            player.stop();
            player.hurtTimer = 1.0;
            player.setAnimationId(player.hardHit ? 'hard_hit' : 'hurt');
            player.xVelocity = player.hardHit ? 4 : 2;
        },
    
        update: () => {
            player.y += player.yVelocity;
            if (player.y < player.groundY)
                player.yVelocity += gravity;
            if (player.y > player.groundY)
            {
                player.y = player.groundY;
                player.yVelocity = 0;
            } 
            player.move(player.damage_direction);
            player.direction = player.damage_direction === 'right' ? 'left' : 'right';
            const finished = player.animations[player.animation_id].finished();
            if (finished && player.y == player.groundY)
            {
                player.setState('idle');
                player.hardHit = false;
            }
        },
    
        onKeyUp: (input) => {},
    
        onKeyDown: (input) => {},
    }
}

const swordOutState = (player) => {
    return {
        enter: () =>
        {
            player.setAnimationId('sword_out');
            player.shouldCombo = true;
        },
    
        update: () =>
        {
            const finished = player.animations[player.animation_id].finished();
            if (finished)
                player.setState('swordAttack');
        },
    
        onKeyUp: (input) =>{
            if (input === 'Space')
                player.shouldCombo = false;
        },
        onKeyDown: (input) =>{
            if (input !== 'ArrowRight' && input !== 'ArrowLeft')
                return ;
            player.direction = input === 'ArrowRight' ? 'right' : 'left';
        },
    }
}

const swordAttackState = (player) => {
    let step = 2;

    return {
        enter: () =>
        {
            player.setAnimationId('sword_attack');
            player.isAttacking = true;
        },
    
        update: () =>
        {
            const finished = player.animations[player.animation_id].finished();
            if (finished)
            {
                if (player.shouldCombo)
                {
                    player.setAnimationId('sword_combo');
                    player.x += player.direction === 'right' ? step : -step;
                    player.shouldCombo = false;
                }
                else
                    player.setState('swordIn');
            }
        },
    
        onKeyUp: (input) =>
        {
            if (input === 'Space')
                player.shouldCombo = false;
        },
    
        onKeyDown: (input) =>
        {
            if (input !== 'ArrowRight' && input !== 'ArrowLeft')
                return ;
            player.direction = input === 'ArrowRight' ? 'right' : 'left';
        },
    }
}

const swordInState = (player) => {
    return {
        enter: () =>
        {
            player.setAnimationId('sword_out');
            player.animations[player.animation_id].reverse();
            player.isAttacking = false;
        },
        
        update: () =>
        {
            const finished = player.animations[player.animation_id].finished();
            if (finished)
                player.setState('idle');
        },
        onKeyUp: (input) =>{},
        onKeyDown: (input) =>{
            if (input !== 'ArrowRight' && input !== 'ArrowLeft')
                return ;
            player.direction = input === 'ArrowRight' ? 'right' : 'left';
        },
    }
}

const victoryState = (_player) => {
    const player = _player;

    return {
        enter: () => {
            player.stop();
            player.setAnimationId(Math.random() < 0.5 ? 'win1' : 'win2');
            player.slowAnimation = true;
        },
        update: () => {},
        onKeyUp: (input) => {},
        onKeyDown: (input) => {},
    }
}

export function setStates(player) 
{
    return {
        'idle': idleState(player),
        'walking': walkingState(player),
        'jakeRollIn': jakeRollInState(player),
        'jakeRoll': jakeRollState(player),
        'jakeRollOut': jakeRollOutState(player),
        'running': runningState(player),
        'jumping': jumpingState(player),
        'falling': fallingState(player),
        'landing': landingState(player),
        'ducking': duckingState(player),
        'shieldOut': shieldOutState(player),
        'shieldIn': shieldInState(player),
        'shieldWalk': shieldWalkState(player),
        'swordOut': swordOutState(player),
        'swordAttack': swordAttackState(player),
        'swordIn': swordInState(player),
        'hurt': hurtState(player),
        'die': dieState(player),
        'victory': victoryState(player),
    }
}