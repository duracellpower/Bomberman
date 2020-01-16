import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

type FieldElement = {
  x: number;
  y: number;
  type: 'Wall' | 'SoftWall';
}
type Player = {
  username: string;
  color: string;
  x: number;
  y: number;
}
type Playground = FieldElement[][];

const PLAYGROUND_ROWS = 20;
const PLAYGROUND_COLUMNS = 20;
const PLAYGROUND_WIDTH = 400;
const PLAYGROUND_HEIGHT = 400;
const FIELD_WIDTH = PLAYGROUND_WIDTH / PLAYGROUND_COLUMNS;
const FIELD_HEIGHT = PLAYGROUND_HEIGHT / PLAYGROUND_ROWS;

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements AfterViewInit {
  private playground: Playground = [];
  private players: Player[] = [];
  public width = PLAYGROUND_WIDTH;
  public height = PLAYGROUND_HEIGHT;

  @ViewChild('canvas', { static: true }) private canvas: ElementRef<HTMLCanvasElement>;

  constructor() {
    console.log('HASH', window.localStorage.getItem('hash'));
    this.initGame();
  }
  
  ngAfterViewInit() {
    this.drawGame();
  }

  // Mock game
  initGame() {
    for (let y = 0; y < PLAYGROUND_ROWS; y++) {
      this.playground[y] = [];
      for (let x = 0; x < PLAYGROUND_COLUMNS; x++) {
        if (x === 0 && y === 0) {
          this.players.push({
            username: 'player1', x, y, color: 'blue'
          });
        }
        else if (x === PLAYGROUND_COLUMNS - 1 && y === 0) {
          this.players.push({
            username: 'player2', x, y, color: 'red'
          });
        }
        else if (x === 0 && y === PLAYGROUND_ROWS - 1) {
          this.players.push({
            username: 'player3', x, y, color: 'yellow'
          });
        }
        else if (x === PLAYGROUND_COLUMNS - 1 && y === PLAYGROUND_ROWS - 1){
          this.players.push({
            username: 'player4', x, y, color: 'green'
          });
        }

        this.playground[y][x] = null;
        if (x % 3 === 0 && y % 3 === 0 && x !== 0 && y !== 0) {
          this.playground[y][x] = {
            x, y, type: 'Wall'
          }
        }
        else if (x % 2 === 0 && y % 2 === 0 && x !== 0 && y !== 0) {
          this.playground[y][x] = {
            x, y, type: 'SoftWall'
          }
        }
      }
    }
    console.log(this.playground);
  }

  drawGame() {
    const ctx = this.canvas.nativeElement.getContext('2d');
    const wallImg = new Image();
    wallImg.src = '/assets/wall.png';
    const softWallImg = new Image();
    softWallImg.src = '/assets/soft-wall.png';

    for (let y = 0; y < PLAYGROUND_ROWS; y++) {
      for (let x = 0; x < PLAYGROUND_COLUMNS; x++) {
        console.log('WALL', x, y, FIELD_WIDTH)
        if (this.playground[y][x] !== null) {
          if (this.playground[y][x].type === 'Wall') {
            console.log('WALL', x, y, FIELD_WIDTH)
            ctx.fillStyle = 'darkgray';
            ctx.fillRect(x * FIELD_WIDTH, y * FIELD_HEIGHT, FIELD_WIDTH, FIELD_HEIGHT);
          }
          else if (this.playground[y][x].type === 'SoftWall') {
            ctx.fillStyle = 'gray';
            ctx.fillRect(x * FIELD_WIDTH, y * FIELD_HEIGHT, FIELD_WIDTH, FIELD_HEIGHT);
          }
        }
      }
    }
  }

}
