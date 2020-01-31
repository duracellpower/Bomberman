import { Component, ViewChild, ElementRef } from "@angular/core";

import { Playground } from "../types";
import {
    PLAYGROUND_WIDTH,
    PLAYGROUND_HEIGHT,
    PLAYGROUND_COLUMNS,
    PLAYGROUND_ROWS,
    FIELD_HEIGHT,
    FIELD_WIDTH
} from "../settings";
import { interval } from "rxjs";
import { exhaustMap } from "rxjs/operators";
import { GameService } from "../services/game.service";

@Component({
    selector: "app-game",
    templateUrl: "./game.component.html",
    styleUrls: ["./game.component.scss"]
})
export class GameComponent {
    private playground: Playground;
    public width = PLAYGROUND_WIDTH;
    public height = PLAYGROUND_HEIGHT;

    public wallImg = new Image();
    public softWallImg = new Image();

    @ViewChild("canvas", { static: true }) private canvas: ElementRef<
        HTMLCanvasElement
    >;

    constructor(gameService: GameService) {
        // Benutzer token holen
        const hash = window.localStorage.getItem("hash");
        // Bilder Laden
        this.wallImg.src = "/assets/wall.png";
        this.softWallImg.src = "/assets/soft-wall.png";
        // Den server fuer das akutelle spielfeld abfragen, alle 500 milisekunden
        interval(500)
            .pipe(
                // Dieser Operator wartet bis die vorherige Abfrage abgeschlossen ist
                exhaustMap(() => {
                    // Mit exhaustMap wird die Ereigniskette des intervals mit der Asynchronen Abfrage zum Server
                    // verknuepft.
                    return gameService.getGameField();
                })
            )
            .subscribe(playground => {
                // Speilfeld erhalten und nun kann es gezeichnet werden
                this.playground = playground;
                this.drawGame();
            });

        document.addEventListener("keypress", ev => {
            // Falls es die leertaste ist
            if (ev.keyCode === 32) {
                gameService.plantBomb(hash).subscribe(playground => {
                    this.playground = playground;
                    this.drawGame();
                });
                return;
            }
            let direction: any;
            switch (ev.keyCode) {
                case 119:
                case 87: // UP
                    direction = { x: 0, y: -1 };
                    break;
                case 68:
                case 100: // RIGHT
                    direction = { x: 1, y: 0 };
                    break;
                case 115:
                case 83: // DOWN
                    direction = { x: 0, y: 1 };
                    break;
                case 97:
                case 65: // LEFT
                    direction = { x: -1, y: 0 };
                    break;
            }
            // Dem server bescheid geben dass dieser Client sein Spieler bewegen moechte
            gameService.movePlayer(hash, direction).subscribe(playground => {
                this.playground = playground;
                this.drawGame();
            });
        });
    }

    private drawGame() {
        const ctx = this.canvas.nativeElement.getContext("2d");
        // Das spielfeld leeren um neu zeichnen zu koennen
        ctx.clearRect(0, 0, PLAYGROUND_WIDTH, PLAYGROUND_HEIGHT);

        for (let y = 0; y < PLAYGROUND_ROWS; y++) {
            for (let x = 0; x < PLAYGROUND_COLUMNS; x++) {
                if (this.playground.fields[y][x] !== null) {
                    if (this.playground.fields[y][x].type === "Wall") {
                        this.drawImage(ctx, x, y, this.wallImg);
                    } else if (
                        this.playground.fields[y][x].type === "SoftWall"
                    ) {
                        this.drawImage(ctx, x, y, this.softWallImg);
                    } else if (
                        this.playground.fields[y][x].type === "Bomb"
                    ) {
                        this.drawElement(ctx, x, y, "black");
                    }
                }
            }
        }

        // Spieler Zeichnen
        for (let i = 0; i < this.playground.players.length; i++) {
            const player = this.playground.players[i];
            this.drawElement(ctx, player.x, player.y, player.color);
        }
    }

    // Helfer methoden zum zeichnen

    private drawElement(
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

    private drawImage(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        image: CanvasImageSource
    ) {
        ctx.drawImage(
            image,
            x * FIELD_WIDTH,
            y * FIELD_HEIGHT,
            FIELD_WIDTH,
            FIELD_HEIGHT
        );
    }
}
