function assetManager()
{
    let assets = {};
    let assetPromises = [];

    let addAsset = async function(name, src) {
        let img = new Image();
        let promise = new Promise((resolve, reject) => {
            img.onload = () => {
                assets[name] = img;
                resolve();
            };
            img.onerror = reject;
        });
        img.src = src;
        assetPromises.push(promise);
    }

    let loadAssets = async function() {    
        await Promise.all(assetPromises);
    }

    let getAsset = function(name) {
        return assets[name];
    }
    return {
        load: loadAssets,
        add: addAsset,
        get: getAsset
    };
}

let assetsManager = () => {
    let manager = assetManager();
    manager.add('idle1', 'sprites/idle1_64_12.png');
    manager.add('idle2', 'sprites/idle2_64_12.png');
    manager.add('idle3', 'sprites/idle3_64_12.png');
    manager.add('idle4', 'sprites/idle4_64_21.png');
    manager.add('walk', 'sprites/walk_64_17.png');
    manager.add('run', 'sprites/run_64_12.png');
    manager.add('jump', 'sprites/jump_64_5.png');
    manager.add('fall', 'sprites/fall_64_5.png');
    manager.add('land', 'sprites/land_64_5.png');
    manager.add('duck', 'sprites/duck_64_3.png');
    manager.add('hurt', 'sprites/hurt_64_4.png');
    manager.add('hard_hit', 'sprites/hard_hit_64_13.png');

    // Sword assets
    manager.add('sword_out', 'sprites/sword_out_92_3.png');
    manager.add('sword_attack', 'sprites/sword_attack_92_6.png');
    manager.add('sword_combo', 'sprites/sword_combo_92_12.png');
    manager.add('shield_out', 'sprites/shield_out_64_7.png');
    manager.add('shield_in', 'sprites/shield_in_64_7.png');
    manager.add('shield_walk', 'sprites/shield_walk_64_6.png');
    manager.add('die', 'sprites/die_64_18.png');
    manager.add('jake_roll_in', 'sprites/jake_roll_in_72_7.png');
    manager.add('jake_roll', 'sprites/jake_roll_72_9.png');
    manager.add('jake_roll_out', 'sprites/jake_roll_out_72_19.png');

    // Background assets
    manager.add('sky', 'background/sky.png');
    manager.add('mountains', 'background/mountains.png');
    manager.add('trees', 'background/trees.png');
    manager.add('grass', 'background/grass.png');
    manager.add('ground', 'background/ground.png');
    return manager;
};

export { assetsManager };