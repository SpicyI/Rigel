import {CSS2DRenderer, CSS2DObject} from "three/examples/jsm/renderers/CSS2DRenderer";


export class ScoreBorad {

    private Renderer: CSS2DRenderer;
    private resizeEvent: EventListener;

    private player1Score: HTMLDivElement;
    private player2Score: HTMLDivElement;

    public label1: CSS2DObject;
    public label2: CSS2DObject;

    constructor() {
        this.Renderer = new CSS2DRenderer();
        this.Renderer.setSize(window.innerWidth, window.innerHeight);
        this.Renderer.domElement.style.position = 'absolute';
        this.Renderer.domElement.style.top = '0px';
        this.Renderer.domElement.style.pointerEvents = 'none';

        this.resizeEvent = () => {
            this.Renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', this.resizeEvent, false);

        this.player1Score = document.createElement("p");
        this.player1Score.textContent = "0";
        this.player1Score.style.color = "white";
        this.player1Score.style.fontSize = "20px";

        this.player2Score = document.createElement("p");
        this.player2Score.textContent = "0";
        this.player2Score.style.color = "white";
        this.player2Score.style.fontSize = "20px";

        this.label1 = new CSS2DObject(this.player1Score);
        this.label2 = new CSS2DObject(this.player2Score);
        
    }


    updateScore(player1Score: number, player2Score: number) {
        this.label1.element.textContent = player1Score.toString();
        this.label2.element.textContent = player2Score.toString();

        // delete this.label1;
        // delete this.label2;

        // this.label1 = new CSS2DObject(this.player1Score);
        // this.label2 = new CSS2DObject(this.player2Score);
    }


    


    getDomElement() {
        return this.Renderer.domElement;
    }

    render(scene: THREE.Scene, camera: THREE.Camera) {
        this.Renderer.render(scene, camera);
    }

    dispose() {
        window.removeEventListener('resize', this.resizeEvent);
        this.Renderer.domElement.remove();
        delete this.Renderer;
        removeEventListener('resize', this.resizeEvent);
        delete this.resizeEvent;
        this.player1Score.remove();
        this.player2Score.remove();
        delete this.player1Score;
        delete this.player2Score;
        this.label1.element.remove();
        this.label2.element.remove();
        delete this.label1;
        delete this.label2;
    }


}


export class LoadingScreen {

    private loadingScreen: HTMLDivElement;
    // private label: HTMLLabelElement;
    // private progressBar: HTMLProgressElement;

    constructor() {
        this.loadingScreen = document.createElement("div");
        this.loadingScreen.classList.add("loading-screen");
        this.loadingScreen.setAttribute('role', 'progressbar');
        this.loadingScreen.setAttribute('aria-valuenow', '0');
        this.loadingScreen.setAttribute('aria-valuemin', '0');
        this.loadingScreen.setAttribute('aria-valuemax', '100');


        // this.label = document.createElement("label");
        // this.label.id = "label1";
        // this.label.htmlFor = "progress-bar";
        // this.label.textContent = "Loading Assets...";
        // this.loadingScreen.appendChild(this.label);

        // this.progressBar = document.createElement("progress");
        // this.progressBar.id = "progress-bar";
        // this.progressBar.value = 0;
        // this.progressBar.max = 100;
        // this.loadingScreen.appendChild(this.progressBar);
    }

    updateProgress(progress: number) {
        const value = `${Math.floor(progress)}%`;
        this.loadingScreen.style.setProperty('--progress', value);
        this.loadingScreen.innerHTML = value;
        this.loadingScreen.setAttribute('aria-valuenow', value);
    }

    hide() {
        this.loadingScreen.style.display = "none";
        this.loadingScreen.remove();
    }

    show() {
        this.loadingScreen.style.display = "block";
    }

    remove() {
        this.loadingScreen.remove();
    }

    getLoadingScreen() {
        return this.loadingScreen;
    }
}

export default {
    ScoreBorad,
    LoadingScreen
}