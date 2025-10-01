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

    function handleInput(input)
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
    return {
        enter: enter,
        update: update,
        handleInput: handleInput,
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

    function handleInput(input)
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
        handleInput: handleInput,
    };
}

const jumpingState = (_player) => {
    const player = _player;
    let gravity = 4;
    let maxHeight = 150;
    const jumpStrength = 16;


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

    function handleInput(input)
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
        handleInput: handleInput,
    };
}

const duckingState = (_player) => {
    const player = _player;

    function enter()
    {
        player.xVelocity = 0;
        player.yVelocity = 0;
        player.animations['ducking'].reset();
    }

    function update()
    {
        //animation locked state, wait for animation to finish
        const finished = player.animations['ducking'].update();
        if (finished)
        {
            player.state = 'idle';
            player.states[player.state].enter();
        }
    }

    function handleInput(input)
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
        handleInput: handleInput,
    };
}

export { idleState, runningState, jumpingState, duckingState };