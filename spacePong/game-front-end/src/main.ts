import { Game } from "./gameObjects/Game";

let startButton = document.getElementById("start-button");
let GameContainer = document.getElementById("game-container");
let ingame = false;

startButton.addEventListener("click", () => {
    ingame = true;
    let game = new Game(GameContainer, "acces_token_should_be_here",  "userId_should_be_here");
    game.launch();
});


// import { main } from "./gameObjects/Game";

// main(document.getElementById("game-container"));

