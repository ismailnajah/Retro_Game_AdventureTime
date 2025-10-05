import { playerAssetsData } from './playerAssetsData.js';

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
    for(let key in playerAssetsData) {
        manager.add(key, playerAssetsData[key].path);
    }

    // Hp bar assets
    manager.add('hp_bar', 'ui/hp_bar.png');

    // Background assets
    manager.add('sky', 'background/sky.png');
    manager.add('mountains', 'background/mountains.png');
    manager.add('trees', 'background/trees.png');
    manager.add('grass', 'background/grass.png');
    manager.add('ground', 'background/ground.png');
    return manager;
};

export { assetsManager };