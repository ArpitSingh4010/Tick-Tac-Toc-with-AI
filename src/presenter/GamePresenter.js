/**
 * GamePresenter.js — PRESENTER layer
 * Orchestrates Model ↔ View. Controls game flow.
 */
import { GameModel } from '../model/GameModel.js';
import { Minimax }   from '../model/Minimax.js';
import { GameView }  from '../view/GameView.js';

export class GamePresenter {
  constructor() {
    this.model   = new GameModel();
    this.view    = new GameView();
    this.minimax = new Minimax(this.model);
    this._bindEvents();
  }

  startGame() {
    this.model.reset();
    this.view.renderBoard(this.model.board);
    this.view.updateStatus("Your turn — click a cell to play");
    this.view.setCellsDisabled(false);
  }

  /* ── Events ─────────────────────────────────────────── */

  _bindEvents() {
    this.view.bindCellClick((r, c) => this.handleCellClick(r, c));
    this.view.bindResetButton(() => this.resetGame());
  }

  handleCellClick(row, col) {
    if (this.model.status !== 'playing') return;
    if (this.model.currentPlayer !== this.model.HUMAN) return;
    if (!this.model.isValidMove(row, col)) return;

    this.makePlayerMove(row, col);
  }

  /* ── Player Move ─────────────────────────────────────── */

  makePlayerMove(row, col) {
    this.model.makeMove(row, col, this.model.HUMAN);
    const lastMove = this.model.moveHistory.at(-1);
    this.view.updateCell(row, col, this.model.HUMAN);
    this.view.addMoveToHistory(lastMove);

    if (this._checkEnd()) return;

    // Disable board while AI thinks
    this.view.setCellsDisabled(true);
    this.view.updateStatus("🤖 AI is thinking…", 'status-thinking');
    setTimeout(() => this.makeAIMove(), 400);
  }

  /* ── AI Move ─────────────────────────────────────────── */

  makeAIMove() {
    const boardCopy = this.model.cloneBoard(this.model.board);
    const [row, col] = this.minimax.getBestMove(boardCopy);

    this.model.makeMove(row, col, this.model.AI);
    const lastMove = this.model.moveHistory.at(-1);
    this.view.updateCell(row, col, this.model.AI);
    this.view.addMoveToHistory(lastMove);

    // Update AI explanation panel
    this.updateAIPanel();

    this.view.setCellsDisabled(false);
    if (this._checkEnd()) return;
    this.view.updateStatus("Your turn — click a cell to play");
  }

  /* ── AI Panel ─────────────────────────────────────────── */

  updateAIPanel() {
    const explanation = this.minimax.getExplanation();
    this.view.renderAIPanel(explanation);
  }

  /* ── End Game ─────────────────────────────────────────── */

  _checkEnd() {
    if (this.model.status === 'won') {
      this.endGame('won');
      return true;
    }
    if (this.model.status === 'draw') {
      this.endGame('draw');
      return true;
    }
    return false;
  }

  endGame(result) {
    this.view.setCellsDisabled(true);
    if (result === 'won') {
      this.view.showWinner(this.model.winner, this.model.winningCells);
    } else {
      this.view.showDraw();
    }
  }

  /* ── Reset ───────────────────────────────────────────── */

  resetGame() {
    this.model.reset();
    this.view.resetBoardUI();
    this.view.updateStatus("Your turn — click a cell to play");
    this.view.setCellsDisabled(false);
  }
}
