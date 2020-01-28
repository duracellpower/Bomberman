import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, timeout } from 'rxjs/operators';
import { Router } from '@angular/router';

import { Playground } from '../types';
import { PLAYGROUND_ROWS, PLAYGROUND_COLUMNS } from '../settings';
import { of } from 'rxjs';

@Injectable({providedIn: 'root'}) // dependency injection -> singelton
export class LoginService {
    game: Playground;

    // Mocked
    private getGame() {
        if (!this.game) {
            this.game = this.initGame();
        }
        return this.game;
    }

    constructor(private http: HttpClient, private router: Router) {}

    getGameField() {
        return this.http.get<Playground>('http://localhost:3000/get-game-field/') //server: register player and return hash
        .pipe(timeout(10), catchError(() => of(this.getGame())))
    }
    
    // Mock game
    private initGame() {
        let playground: Playground;
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

                playground.fields[y][x] = null;
                if (x % 3 === 0 && y % 3 === 0 && x !== 0 && y !== 0) {
                    playground.fields[y][x] = {
                        x,
                        y,
                        type: "Wall"
                    };
                } else if (x % 2 === 0 && y % 2 === 0 && x !== 0 && y !== 0) {
                    playground.fields[y][x] = {
                        x,
                        y,
                        type: "SoftWall"
                    };
                }
            }
        }
        return playground;
    }
}