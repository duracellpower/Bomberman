import { Component, ViewChild, ElementRef, AfterViewInit } from "@angular/core";

import { Playground } from '../types';
import { PLAYGROUND_WIDTH, PLAYGROUND_HEIGHT, PLAYGROUND_COLUMNS, PLAYGROUND_ROWS, FIELD_HEIGHT, FIELD_WIDTH } from '../settings';


@Component({
    selector: "app-game",
    templateUrl: "./game.component.html",
    styleUrls: ["./game.component.scss"]
})
export class GameComponent implements AfterViewInit {
    private playground: Playground = { fields: [], players: [] };
    public width = PLAYGROUND_WIDTH;
    public height = PLAYGROUND_HEIGHT;

    @ViewChild("canvas", { static: true }) private canvas: ElementRef<
        HTMLCanvasElement
    >;

    constructor() {
        const hash = window.localStorage.getItem("hash");


        this.initGame();

        document.addEventListener("keypress", ev => {
            switch (ev.keyCode) {
                case 87: // UP
                    this.movePlayer(hash, { x: 0, y: -1 });
                    break;
                case 68: // RIGHT
                    this.movePlayer(hash, { x: 1, y: 0 });
                    break;
                case 83: // DOWN
                    this.movePlayer(hash, { x: 0, y: 1 });
                    break;
                case 65: // LEFT
                    this.movePlayer(hash, { x: -1, y: 0 });
                    break;
            }
            console.log("moving?", ev.keyCode);
            this.drawGame();
        });
    }

    ngAfterViewInit() {
        this.drawGame();
    }

    private movePlayer(hash: string, direction: { x: number; y: number }) {
        const i = this.playground.players.findIndex(
            player => player.hash === hash
        );
        const x = this.playground.players[i].x + direction.x;
        const y = this.playground.players[i].y + direction.y;
        if (this.isInPlayground(x, y) && !this.collidesWithPlayer(hash, x, y) && !this.collidesWithWall(x, y)) {
            this.playground.players[i].x = x;
            this.playground.players[i].y = y;
        }
    }
    private isInPlayground(x: number, y: number) {
        return (
            x >= 0 && x < PLAYGROUND_COLUMNS && y >= 0 && y < PLAYGROUND_ROWS
        );
    }
    private collidesWithWall(x: number, y: number) {
        return this.playground.fields[y][x] !== null;
    }
    private collidesWithPlayer(current: string, x: number, y: number) {
        for (let i = 0; i < this.playground.players.length; i++) {
            const player = this.playground.players[i];
            if (player.hash === current) {
                continue;
            }
            if (player.x === x && player.y === y) {
                return true;
            }
        }
        return false;
    }

    private drawGame() {
        const ctx = this.canvas.nativeElement.getContext("2d");
        ctx.clearRect(0, 0, PLAYGROUND_WIDTH, PLAYGROUND_HEIGHT);
        const wallImg = new Image();
        wallImg.src = "/assets/wall.png";
        const softWallImg = new Image();
        softWallImg.src = "/assets/soft-wall.png";

        for (let y = 0; y < PLAYGROUND_ROWS; y++) {
            for (let x = 0; x < PLAYGROUND_COLUMNS; x++) {
                if (this.playground.fields[y][x] !== null) {
                    if (this.playground.fields[y][x].type === "Wall") {
                        this.drawElement(ctx, x, y, "darkgray");
                    } else if (
                        this.playground.fields[y][x].type === "SoftWall"
                    ) {
                        this.drawElement(ctx, x, y, "gray");
                    }
                }
            }
        }

        for (let i = 0; i < this.playground.players.length; i++) {
            const player = this.playground.players[i];
            this.drawElement(ctx, player.x, player.y, player.color);
        }
    }

    drawElement(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        color: string
    ) {
        ctx.fillStyle = color;
        ctx.fillRect(
            x * FIELD_WIDTH,
            y * FIELD_HEIGHT,
            FIELD_WIDTH,
            FIELD_HEIGHT
        );
    }
}
