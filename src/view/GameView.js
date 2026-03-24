/**
 * GameView.js — VIEW layer
 * All DOM manipulation. Zero game logic.
 */
export class GameView {
  constructor() {
    this.boardEl      = document.getElementById('board');
    this.statusEl     = document.getElementById('status');
    this.aiPanelEl    = document.getElementById('ai-panel');
    this.historyEl    = document.getElementById('move-history');
    this.restartBtn   = document.getElementById('restart-btn');
    this.cells        = []; // 2D array of <div> elements
    this._buildBoard();
  }

  /* ── Board ─────────────────────────────────────────── */

  _buildBoard() {
    this.boardEl.innerHTML = '';
    this.cells = [];
    for (let r = 0; r < 3; r++) {
      this.cells[r] = [];
      for (let c = 0; c < 3; c++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.row = r;
        cell.dataset.col = c;
        this.boardEl.appendChild(cell);
        this.cells[r][c] = cell;
      }
    }
  }

  renderBoard(board) {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const cell  = this.cells[r][c];
        const value = board[r][c];
        cell.textContent = value ?? '';
        cell.className   = 'cell';
        if (value === 'X') cell.classList.add('x');
        if (value === 'O') cell.classList.add('o');
      }
    }
  }

  updateCell(row, col, player) {
    const cell = this.cells[row][col];
    cell.textContent = player;
    cell.classList.add(player === 'X' ? 'x' : 'o');
    cell.classList.add('placed');
  }

  highlightWin(cells) {
    cells.forEach(([r, c]) => this.cells[r][c].classList.add('winner'));
  }

  resetBoardUI() {
    this._buildBoard();
    this._clearAIPanel();
    this.historyEl.innerHTML = '';
  }

  /* ── Status ─────────────────────────────────────────── */

  updateStatus(text, type = '') {
    this.statusEl.textContent = text;
    this.statusEl.className   = 'status ' + type;
  }

  showWinner(player, winCells) {
    this.highlightWin(winCells);
    const label = player === 'X' ? '🎉 You Win!' : '🤖 AI Wins!';
    this.updateStatus(label, player === 'X' ? 'status-win' : 'status-lose');
  }

  showDraw() {
    this.updateStatus("🤝 It's a Draw!", 'status-draw');
  }

  /* ── AI Panel ───────────────────────────────────────── */

  _clearAIPanel() {
    document.getElementById('ai-move').textContent      = '—';
    document.getElementById('ai-score').textContent     = '—';
    document.getElementById('ai-depth').textContent     = '—';
    document.getElementById('ai-nodes').textContent     = '—';
    document.getElementById('ai-pruned').textContent    = '—';
    document.getElementById('ai-reason').textContent    = '—';
    document.getElementById('ai-eval-list').innerHTML   = '';
  }

  renderAIPanel(data) {
    const { chosenMove, chosenScore, evaluatedMoves,
            nodesExplored, prunedNodes, depthReached, bestMoveReason } = data;

    document.getElementById('ai-move').textContent =
      chosenMove ? `(${chosenMove[0]}, ${chosenMove[1]})` : '—';
    document.getElementById('ai-score').textContent  = chosenScore ?? '—';
    document.getElementById('ai-depth').textContent  = depthReached;
    document.getElementById('ai-nodes').textContent  = nodesExplored;
    document.getElementById('ai-pruned').textContent = prunedNodes;
    document.getElementById('ai-reason').textContent = bestMoveReason;

    const listEl = document.getElementById('ai-eval-list');
    listEl.innerHTML = '';

    // Sort evaluated moves: best score first
    const sorted = [...evaluatedMoves].sort((a, b) => b.score - a.score);
    sorted.forEach(({ row, col, score }, idx) => {
      const li = document.createElement('li');
      const isBest = row === chosenMove[0] && col === chosenMove[1];
      const scoreLabel = score > 0 ? `+${score}` : `${score}`;
      li.innerHTML = `
        <span class="eval-coord">(${row},${col})</span>
        <span class="eval-arrow">→</span>
        <span class="eval-score ${score > 0 ? 'pos' : score < 0 ? 'neg' : 'zero'}">${scoreLabel}</span>
        ${isBest ? '<span class="eval-best">✓ chosen</span>' : ''}
      `;
      if (isBest) li.classList.add('best-move-row');
      listEl.appendChild(li);
    });
  }

  /* ── Move History ───────────────────────────────────── */

  addMoveToHistory(move) {
    const li = document.createElement('li');
    const who = move.player === 'X' ? '🧑 You' : '🤖 AI';
    li.innerHTML = `<span class="hist-num">#${move.moveNumber}</span> ${who} → (${move.row}, ${move.col})`;
    if (move.player === 'O') li.classList.add('ai-hist');
    this.historyEl.prepend(li);
  }

  /* ── Event Bindings ─────────────────────────────────── */

  bindCellClick(handler) {
    this.boardEl.addEventListener('click', e => {
      const cell = e.target.closest('.cell');
      if (!cell) return;
      handler(parseInt(cell.dataset.row), parseInt(cell.dataset.col));
    });
  }

  bindResetButton(handler) {
    this.restartBtn.addEventListener('click', handler);
  }

  setCellsDisabled(disabled) {
    this.cells.flat().forEach(cell => {
      cell.classList.toggle('disabled', disabled);
    });
  }
}
