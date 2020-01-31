import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { catchError, timeout } from "rxjs/operators";

import { Playground } from "../types";
import { PLAYGROUND_ROWS, PLAYGROUND_COLUMNS } from "../settings";
import { of } from "rxjs";

@Injectable({ providedIn: "root" }) // dependency injection -> singelton
export class GameService {
    playground: Playground;

    constructor(private http: HttpClient) { }

    public getGameField() {
        return this.http
            .get<Playground>("http://localhost:3000/get-game-field/")
            // Mock
            .pipe(
                timeout(10),
                catchError(() => of(this._getGame()))
            );
    }

    public movePlayer(hash: string, direction: { x: number, y: number }) {
        return this.http
        .post<Playground>("http://localhost:3000/move-player/", { hash, direction })
        // Mock
        .pipe(
            timeout(10),
            catchError(() => {
                const game = this._getGame();
                this._movePlayer(hash, direction);
                return of(game);
            })
        );
    }

    public plantBomb(hash: string) {
        return this.http
        .post<Playground>("http://localhost:3000/plant-bomb/", { hash })
        // Mock
        .pipe(
            timeout(10),
            catchError(() => {
                const game = this._getGame();
                this._plantBomb(hash);
                return of(game);
            })
        );
    }

    // Gemockte Daten und Logik ab hier
    private _getGame() {
        if (!this.playground) {
            this.playground = this._initGame();
        }
        return this.playground;
    }

    private _plantBomb(hash: string) {
        const i = this.playground.players.findIndex(
            player => player.hash === hash
        );
        const player = this.playground.players[i];
        const bomb = { type: 'Bomb' as 'Bomb', x: player.x, y: player.y };
        this.playground.fields[player.y][player.x] = bomb;
        window.setTimeout(() => {
            const adjacentFields = [
                {x: bomb.x - 1, y: bomb.y},
                {x: bomb.x + 1, y: bomb.y},
                {x: bomb.x, y: bomb.y - 1},
                {x: bomb.x, y: bomb.y + 1},
            ]
            for (let i = 0; i < adjacentFields.length; i++) {
                const position = adjacentFields[i];
                if (!this._isInPlayground(position.x, position.y)) {
                    continue;
                }
                this._destroyElementAt(position.x, position.y);
            }
            this.playground.fields[bomb.y][bomb.x] = null;
        }, 3000);
    }

    private _movePlayer(hash: string, direction: { x: number; y: number }) {
        const i = this.playground.players.findIndex(
            player => player.hash === hash
        );
        const player = this.playground.players[i];
        const x = player.x + direction.x;
        const y = player.y + direction.y;
        if (
            this._isInPlayground(x, y) &&
            !this._collidesWithPlayer(hash, x, y) &&
            !this._collidesWithWall(x, y)
        ) {
            this.playground.players[i].x = x;
            this.playground.players[i].y = y;
        }
    }
    private _isInPlayground(x: number, y: number) {
        return (
            x >= 0 && x < PLAYGROUND_COLUMNS && y >= 0 && y < PLAYGROUND_ROWS
        );
    }
    private _destroyElementAt(x: number, y: number) {
        const field = this.playground.fields[y][x];
        if (field !== null && field.type === 'SoftWall') {
            this.playground.fields[y][x] = null;
            return;
        }
        const playerIndex = this.playground.players.findIndex(player => player.x === x && player.y === y);
        if (playerIndex >= 0) {
            const player = this.playground.players[playerIndex];
            this.playground.players.splice(playerIndex, 1);
            this.playground.log.push(`Spieler "${player.username}" ist gestorben`);
        }
    }
    private _collidesWithWall(x: number, y: number) {
        return this.playground.fields[y][x] !== null;
    }
    private _collidesWithPlayer(current: string, x: number, y: number) {
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

    private _initGame() {
        let playground: Playground = { fields: [], players: [], log: [] };
        for (let y = 0; y < PLAYGROUND_ROWS; y++) {
            playground.fields[y] = [];
            for (let x = 0; x < PLAYGROUND_COLUMNS; x++) {
                if (x === 0 && y === 0) {
                    playground.players.push({
                        username: "player1",
                        x,
                        y,
                        color: "blue",
                        hash: localStorage.getItem("hash")
                    });
                } else if (x === PLAYGROUND_COLUMNS - 1 && y === 0) {
                    playground.players.push({
                        username: "player2",
                        x,
                        y,
                        color: "red",
                        hash: "player2"
                    });
                } else if (x === 0 && y === PLAYGROUND_ROWS - 1) {
                    playground.players.push({
                        username: "player3",
                        x,
                        y,
                        color: "yellow",
                        hash: "player3"
                    });
                } else if (
                    x === PLAYGROUND_COLUMNS - 1 &&
                    y === PLAYGROUND_ROWS - 1
                ) {
                    playground.players.push({
                        username: "player4",
                        x,
                        y,
                        color: "magenta",
                        hash: "player4"
                    });
                }

                // Feld initialisieren
                playground.fields[y][x] = null;

                if (x !== 0 && y !== 0) {
                    // Skip indices 0
                    if (x % 3 === 0 && y % 3 === 0) {
                        playground.fields[y - 1][x - 1] = {
                            x,
                            y,
                            type: "Wall"
                        };
                    } else if (x % 2 === 0 && y % 2 === 0) {
                        playground.fields[y - 1][x - 1] = {
                            x,
                            y,
                            type: "SoftWall"
                        };
                    }
                }
            }
        }
        return playground;
    }
}
