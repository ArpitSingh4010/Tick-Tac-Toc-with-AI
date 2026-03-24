/**
 * GameModel.js — MODEL layer
 * Manages board state, players, rules, and move history.
 */
export class GameModel {
  constructor() {
    this.HUMAN = 'X';
    this.AI    = 'O';
    this.reset();
  }

  reset() {
    // 3x3 board, null = empty
    this.board       = Array.from({ length: 3 }, () => Array(3).fill(null));
    this.currentPlayer = this.HUMAN;
    this.status        = 'playing'; // 'playing' | 'won' | 'draw'
    this.winner        = null;
    this.winningCells  = [];
    this.moveHistory   = [];
  }

  isValidMove(row, col) {
    return (
      row >= 0 && row < 3 &&
      col >= 0 && col < 3 &&
      this.board[row][col] === null &&
      this.status === 'playing'
    );
  }

  makeMove(row, col, player) {
    if (!this.isValidMove(row, col)) return false;
    this.board[row][col] = player;
    this.moveHistory.push({ row, col, player, moveNumber: this.moveHistory.length + 1 });
    this._updateStatus();
    return true;
  }

  _updateStatus() {
    const result = this.checkWinner(this.board);
    if (result) {
      this.status       = 'won';
      this.winner       = result.winner;
      this.winningCells = result.cells;
    } else if (this.isDraw(this.board)) {
      this.status = 'draw';
    } else {
      this.currentPlayer =
        this.currentPlayer === this.HUMAN ? this.AI : this.HUMAN;
    }
  }

  /**
   * Check winner on any given board snapshot.
   * Returns { winner, cells } or null.
   */
  checkWinner(board) {
    const lines = [
      // rows
      [[0,0],[0,1],[0,2]],
      [[1,0],[1,1],[1,2]],
      [[2,0],[2,1],[2,2]],
      // cols
      [[0,0],[1,0],[2,0]],
      [[0,1],[1,1],[2,1]],
      [[0,2],[1,2],[2,2]],
      // diagonals
      [[0,0],[1,1],[2,2]],
      [[0,2],[1,1],[2,0]],
    ];

    for (const line of lines) {
      const [a, b, c] = line;
      const va = board[a[0]][a[1]];
      if (va && va === board[b[0]][b[1]] && va === board[c[0]][c[1]]) {
        return { winner: va, cells: line };
      }
    }
    return null;
  }

  isDraw(board) {
    return board.every(row => row.every(cell => cell !== null));
  }

  getAvailableMoves(board) {
    const moves = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (board[r][c] === null) moves.push([r, c]);
      }
    }
    return moves;
  }

  /**
   * Deep clone a board for simulation.
   */
  cloneBoard(board) {
    return board.map(row => [...row]);
  }
}
