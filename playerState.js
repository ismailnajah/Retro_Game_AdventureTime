const idleState = (_player) => {
    const player = _player;
    function enter()
    {
        player.xVelocity = 0;
        player.yVelocity = 0;
        player.setAnimationId('idle');
    }

    function update()
    {}

    function onKeyDown(input)
    {
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
            default:
                break;
        }
        if (player.state !== 'idle')
            player.states[player.state].enter();
    }

    function onKeyUp(input)
    {}

    return {
        enter: enter,
        update: update,
        onKeyDown: onKeyDown,
        onKeyUp: onKeyUp,
    };
}

const walkingState = (_player) => {
    //this state only for start screen animation
    const player = _player;

    function enter()
    {
        player.xVelocity = 0;
        player.yVelocity = 0;
        player.setAnimationId('walking');
    }
    
    function update(){}
    function onKeyUp(input){}
    function onKeyDown(input){}
    return {
        enter: enter,
        update: update,
        onKeyDown: onKeyDown,
        onKeyUp: onKeyUp,
    };
}

const jakeRollInState = (_player) => {
    //this state only for the transition animation
    const player = _player;

    function enter()
    {
        player.xVelocity = player.speed * 1.5;
        player.yVelocity = 0;
        player.setAnimationId('jakeRollIn');
    }
    
    function update()
    {
        player.x += player.xVelocity;
        const finished = player.animations[player.animation_id].finished();
        if (finished)
        {
            player.state = 'jakeRoll';
            player.states[player.state].enter();
        }
    }
    function onKeyUp(input){}
    function onKeyDown(input){}
    return {
        enter: enter,
        update: update,
        onKeyDown: onKeyDown,
        onKeyUp: onKeyUp,
    };
}

const jakeRollState = (_player) => {
    //this state only for the transition animation
    const player = _player;

    function enter()
    {
        player.setAnimationId('jakeRoll');
    }
    function update(){
        player.x += player.xVelocity;
    }
    function onKeyUp(input){}
    function onKeyDown(input){}
    return {
        enter: enter,
        update: update,
        onKeyDown: onKeyDown,
        onKeyUp: onKeyUp,
    };
}

const jakeRollOutState = (_player) => {
    //this state only for the transition animation
    const player = _player;

    function enter()
    {
        player.xVelocity = 0;
        player.setAnimationId('jakeRollOut');
    }
    
    function update()
    {
        const finished = player.animations[player.animation_id].finished();
        if (finished)
        {
            player.state = 'idle';
            player.states[player.state].enter();
        }
    }
    function onKeyUp(input){}
    function onKeyDown(input){}
    return {
        enter: enter,
        update: update,
        onKeyDown: onKeyDown,
        onKeyUp: onKeyUp,
    };
}

const runningState = (_player) => {
    const player = _player;

    function enter()
    {
        player.xVelocity = player.speed;
        player.yVelocity = 0;
        player.setAnimationId('running');
    }

    function update()
    {
        player.x += player.direction === 'right' ? player.xVelocity : -player.xVelocity;
    }


    function onKeyUp(input)
    {
        if (input !== 'ArrowRight' && input !== 'ArrowLeft')
            return;
        player.xVelocity = 0;
        player.state = 'idle';
        player.states[player.state].enter();
    }

    function onKeyDown(input)
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
                player.state = 'jumping';
                break;
            case 'ArrowDown':
                player.state = 'ducking';
                break;
            case 'KeyG':
                player.state = 'shieldOut';
                break;
            default:
                player.state = 'idle';
                break;
        }
        if (player.state !== 'running')
            player.states[player.state].enter();
    }

    return {
        enter: enter,
        update: update,
        onKeyDown: onKeyDown,
        onKeyUp: onKeyUp,
    };
}

const jumpingState = (_player) => {
    const player = _player;
    let maxHeight = 150;
    const jumpStrength = 20;


    //TODO: splite jumping into tree states: rising, falling, landing
    function enter()
    {
        player.yVelocity = -jumpStrength;
        player.setAnimationId('jumping');
        maxHeight = 150;
    }

    function update()
    {
        player.x += player.direction === 'right' ? player.xVelocity : -player.xVelocity;
        player.y += player.yVelocity;
        
        if (player.groundY - player.y >= maxHeight)
        {
            player.y = player.groundY - maxHeight;
            player.state = 'falling';
            player.states[player.state].enter();
        }
    }

    function onKeyUp(input)
    {
        if (input !== 'ArrowUp')
            return;
        player.state = 'falling';
        player.states[player.state].enter();
    }

    function onKeyDown(input)
    {
        if (input !== 'ArrowRight' && input !== 'ArrowLeft')
            return ;
        player.direction = input === 'ArrowRight' ? 'right' : 'left';
    }

    return {
        enter: enter,
        update: update,
        onKeyDown: onKeyDown,
        onKeyUp: onKeyUp,
    };
}

const fallingState = (_player) => {
    const player = _player;
    let gravity = 2;

    function enter()
    {
        player.yVelocity = 0;
        player.setAnimationId('falling');
    }

    function update()
    {
        player.x += player.direction === 'right' ? player.xVelocity : -player.xVelocity;
        player.yVelocity += gravity;
        player.y += player.yVelocity;
        if (player.y >= player.groundY)
        {
            player.y = player.groundY;
            player.state = player.xVelocity === 0 ? 'landing' : 'running';  
            player.states[player.state].enter();

        }
    }

    function onKeyUp(input)
    {
        if (input !== 'ArrowRight' && input !== 'ArrowLeft')
            return ;
        player.xVelocity = 0; 
    }
    
    function onKeyDown(input)
    {
        if (input !== 'ArrowRight' && input !== 'ArrowLeft')
            return ;
        player.direction = input === 'ArrowRight' ? 'right' : 'left';
        player.xVelocity = player.speed;
    }

    return {
        enter: enter,
        update: update,
        onKeyDown: onKeyDown,
        onKeyUp: onKeyUp,
    };
}

const landingState = (_player) => {
    const player = _player;
    
    function enter()
    {
        player.xVelocity = 0;
        player.yVelocity = 0;
        player.setAnimationId('landing');
    }

    function update()
    {
        if (player.animations[player.animation_id].finished())
        {
            player.state = 'idle';
            player.states[player.state].enter();
        }
    }

    function onKeyUp(input){}

    function onKeyDown(input)
    {
        if (input !== 'ArrowRight' && input !== 'ArrowLeft')
            return ;
        player.direction = input === 'ArrowRight' ? 'right' : 'left';
    }

    return {
        enter: enter,
        update: update,
        onKeyDown: onKeyDown,
        onKeyUp: onKeyUp,
    };
}

const duckingState = (_player) => {
    const player = _player;
    let standing = false;

    function enter()
    {
        player.xVelocity = 0;
        player.yVelocity = 0;
        standing = false;
        player.setAnimationId('ducking');
    }

    function update()
    {
        const finished = player.animations[player.animation_id].finished();
        if (standing && finished)
        {
            player.state = 'idle';
            player.states[player.state].enter();
        }
    }

    function onKeyUp(input)
    {
        if (input !== 'ArrowDown')
            return;
        player.animations[player.animation_id].reverse();
        standing = true;
    }

    function onKeyDown(input)
    {
        if (input !== 'ArrowRight' && input !== 'ArrowLeft')
            return ;
        player.direction = input === 'ArrowRight' ? 'right' : 'left';
    }
    return {
        enter: enter,
        update: update,
        onKeyDown: onKeyDown,
        onKeyUp: onKeyUp,
    };
}

const shieldOutState = (_player) => {
    const player = _player;
    
    function enter()
    {
        player.isShielded = true;
        player.yVelocity = 0;
        player.setAnimationId('shieldOut');
    }
    
    function update()
    {
        const finished = player.animations[player.animation_id].finished();
        if (finished)
        {
            player.state = 'shieldWalk';
            player.states[player.state].enter();
        }
    }

    function onKeyUp(input)
    {
        if (input === 'ArrowRight' || input === 'ArrowLeft')
            player.xVelocity = 0;
        if (input === 'KeyG')
        {
            player.state = 'shieldIn';
            player.states[player.state].enter();
        }
    }
    
    function onKeyDown(input)
    {
        if (input !== 'ArrowRight' && input !== 'ArrowLeft')
            return ;
        player.direction = input === 'ArrowRight' ? 'right' : 'left';
        player.state = 'shieldWalk';
        player.states[player.state].enter();
    }

    return {
        enter: enter,
        update: update,
        onKeyDown: onKeyDown,
        onKeyUp: onKeyUp,
    };
}

const shieldWalkState = (_player) => {
    const player = _player;
    const speedModifier = 0.5;

    function enter()
    {
        player.xVelocity = player.xVelocity * speedModifier;
        player.yVelocity = 0;
        player.setAnimationId('shieldWalk');
    }
    
    function update()
    {
        player.x += player.direction === 'right' ? player.xVelocity : -player.xVelocity;
    }
    
    function onKeyUp(input)
    {
        if (input === 'ArrowRight' || input === 'ArrowLeft')
            player.xVelocity = 0;
        if (input === 'KeyG')
        {
            player.state = 'shieldIn';
            player.states[player.state].enter();
        }
    }
    
    function onKeyDown(input)
    {
        if (input !== 'ArrowRight' && input !== 'ArrowLeft')
            return ;
        player.direction = input === 'ArrowRight' ? 'right' : 'left';
        player.xVelocity = player.speed / 2;
    }

    return {
        enter: enter,
        update: update,
        onKeyDown: onKeyDown,
        onKeyUp: onKeyUp,
    };
}

const shieldInState = (_player) => {
    const player = _player;

    function enter()
    {
        player.yVelocity = 0;
        player.isShielded = false;
        player.setAnimationId('shieldIn');
    }

    function update()
    {
        const finished = player.animations[player.animation_id].finished();
        if (finished)
        {
            player.state = player.xVelocity === 0 ? 'idle' : 'running';
            player.states[player.state].enter();
        }
    }

    function onKeyUp(input){
        if (input !== 'ArrowRight' && input !== 'ArrowLeft')
            return ;
        player.xVelocity = 0;
    }

    function onKeyDown(input){
        if (input !== 'ArrowRight' && input !== 'ArrowLeft')
            return ;
        player.direction = input === 'ArrowRight' ? 'right' : 'left';
    }
    return {
        enter: enter,
        update: update,
        onKeyDown: onKeyDown,
        onKeyUp: onKeyUp,
    };
}

const dieState = (_player) => {
    const player = _player;

    function enter()
    {
        player.xVelocity = 0;
        player.yVelocity = 0;
        player.setAnimationId('die');
    }
    
    function update()
    {
        const finished = player.animations[player.animation_id].finished();
        if (finished)
            player.isDead = true;
    }
    
    function onKeyUp(input){}
    function onKeyDown(input){}
    
    return {
        enter: enter,
        update: update,
        onKeyDown: onKeyDown,
        onKeyUp: onKeyUp,
    };
}      

const hurtState = (_player) => {
    const player = _player;
    
    function enter()
    {
        // we can be hurt mid air
        player.xVelocity = 0;
        player.yVelocity = 0;
        player.setAnimationId(player.hardHit ? 'hardHit' : 'hurt');
    }

    function update()
    {
        const finished = player.animations[player.animation_id].finished();
        if (finished)
        {
            player.state = 'idle';
            player.states[player.state].enter();
            player.hardHit = false;
        }
    }

    //just play the hurt animation until it finishes, ignore other inputs
    function onKeyUp(input)
    {}

    function onKeyDown(input)
    {}

    return {
        enter: enter,
        update: update,
        onKeyDown: onKeyDown,
        onKeyUp: onKeyUp,
    };
}


export { idleState,
         walkingState,
         jakeRollInState,
         jakeRollState,
         jakeRollOutState,
         runningState,
         jumpingState,
         fallingState,
         landingState,
         duckingState,
         shieldOutState,
         shieldInState,
         shieldWalkState,
         hurtState,
         dieState,
        };