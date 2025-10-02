const idleState = (_player) => {
    const player = _player;
    function enter()
    {
        player.xVelocity = 0;
        player.yVelocity = 0;
        player.animations['idle'].reset();
    }

    function update()
    {
        player.animations['idle'].update();
    }

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


const runningState = (_player) => {
    const player = _player;

    function enter()
    {
        player.xVelocity = player.speed;
        player.yVelocity = 0;
        player.animations['running'].reset();
    }

    function update()
    {
        player.x += player.direction === 'right' ? player.xVelocity : -player.xVelocity;
        player.animations['running'].update();
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
        player.animations['jumping'].reset();
        maxHeight = 150;
    }

    function update()
    {
        player.x += player.direction === 'right' ? player.xVelocity : -player.xVelocity;
        player.y += player.yVelocity;
        
        player.animations['jumping'].update();
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
        player.animations['falling'].reset();
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
        player.animations['falling'].update();
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
        player.animations['landing'].reset();
    }

    function update()
    {
        const finished = player.animations['landing'].update();
        if (finished)
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
        player.animations['ducking'].reset();
    }

    function update()
    {
        const finished = player.animations['ducking'].update();
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
        player.animations['ducking'].reverse();
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

export { idleState, runningState, jumpingState, fallingState, landingState, duckingState};