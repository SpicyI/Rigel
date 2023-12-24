import { Game } from "./gameObjects/Game";

let startButton = document.getElementById("start-button");
let GameContainer = document.getElementById("game-container");


startButton.addEventListener("click", () => {
    let game = new Game(GameContainer);
    game.launch();
});


// import { main } from "./gameObjects/Game";

// main(document.getElementById("game-container"));

