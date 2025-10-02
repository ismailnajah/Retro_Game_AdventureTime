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
    let gravity = 8;
    let maxHeight = 400;
    const jumpStrength = 40;


    //TODO: splite jumping into tree states: rising, falling, landing
    function enter()
    {
        player.yVelocity = -jumpStrength;
        player.animations['jumping'].reset();
        maxHeight = 400;
    }

    function update()
    {
        player.x += player.direction === 'right' ? player.xVelocity : -player.xVelocity;
        player.y += player.yVelocity;
        player.yVelocity += gravity;
        
        const finished = player.animations['jumping'].update();

        if (player.y >= player.groundY)
            player.y = player.groundY;
        if (finished)
        {
            player.state = 'idle';
            player.states[player.state].enter();
        }
    }

    function onKeyUp(input)
    {
        if (input !== 'ArrowUp')
            return;
        //cut jump short if key released early
        //transition to falling state
    }

    function onKeyDown(input)
    {
        switch (input)
        {
            case 'ArrowRight':
                player.direction = 'right';
                player.xVelocity = player.speed;
                break;
            case 'ArrowLeft':
                player.direction = 'left';
                player.xVelocity = player.speed;
                break;
            default:
                player.xVelocity = 0;
                break;
        }
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
        //TODO: i need to separate between keydown and keyup events
        switch (input)
        {
            case 'ArrowRight':
                player.direction = 'right';
                break;
            case 'ArrowLeft':
                player.direction = 'left';
                break;
            default:
                break;
        }
    }
    return {
        enter: enter,
        update: update,
        onKeyDown: onKeyDown,
        onKeyUp: onKeyUp,
    };
}

export { idleState, runningState, jumpingState, duckingState};