function boxesIntersect(boxA, boxB) {
    return (boxA.x < boxB.x + boxB.width &&
            boxA.x + boxA.width > boxB.x &&
            boxA.y < boxB.y + boxB.height &&
            boxA.y + boxA.height > boxB.y);
}

export { boxesIntersect };