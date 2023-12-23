import { Game } from "./gameObjects/Game";

let GameContainer = document.getElementById("game-container");
if (GameContainer) {
    let game = new Game(GameContainer);
    console.log("launching the game");
    game.launch();
}
else{
    console.log("Game container not found");
}


// import { main } from "./gameObjects/Game";

// main(document.getElementById("game-container"));

