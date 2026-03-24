/**
 * Minimax.js — MODEL layer (AI)
 * Implements Minimax with Alpha-Beta pruning.
 * Stores explanation data for the side panel.
 */
export class Minimax {
  constructor(model) {
    this.model = model;        // GameModel reference
    this.AI    = model.AI;     // 'O'
    this.HUMAN = model.HUMAN;  // 'X'
    this._resetExplanation();
  }

  _resetExplanation() {
    this.explanation = {
      chosenMove:      null,
      chosenScore:     null,
      evaluatedMoves:  [],   // [{ row, col, score }]
      nodesExplored:   0,
      prunedNodes:     0,
      depthReached:    0,
      bestMoveReason:  '',
    };
  }

  /**
   * Evaluate a terminal board state.
   * depth used to prefer faster wins / slower losses.
   */
  _evaluate(board, depth) {
    const result = this.model.checkWinner(board);
    if (!result) return 0;
    if (result.winner === this.AI)    return 10 - depth;
    if (result.winner === this.HUMAN) return depth - 10;
    return 0;
  }

  /**
   * Minimax with Alpha-Beta Pruning.
   * Returns the best score for the current player.
   */
  _minimax(board, depth, alpha, beta, isMaximizing) {
    this.explanation.nodesExplored++;
    this.explanation.depthReached = Math.max(this.explanation.depthReached, depth);

    const score = this._evaluate(board, depth);
    if (score !== 0) return score;
    if (this.model.isDraw(board)) return 0;

    const moves = this.model.getAvailableMoves(board);
    if (moves.length === 0) return 0;

    if (isMaximizing) {
      let best = -Infinity;
      for (const [r, c] of moves) {
        board[r][c] = this.AI;
        const val = this._minimax(board, depth + 1, alpha, beta, false);
        board[r][c] = null;
        best  = Math.max(best, val);
        alpha = Math.max(alpha, best);
        if (beta <= alpha) {
          this.explanation.prunedNodes++;
          break; // β-cutoff
        }
      }
      return best;
    } else {
      let best = Infinity;
      for (const [r, c] of moves) {
        board[r][c] = this.HUMAN;
        const val = this._minimax(board, depth + 1, alpha, beta, true);
        board[r][c] = null;
        best = Math.min(best, val);
        beta = Math.min(beta, best);
        if (beta <= alpha) {
          this.explanation.prunedNodes++;
          break; // α-cutoff
        }
      }
      return best;
    }
  }

  /**
   * Find the best move for the AI given the current board.
   * Populates explanation data.
   */
  getBestMove(board) {
    this._resetExplanation();

    const moves     = this.model.getAvailableMoves(board);
    let   bestScore = -Infinity;
    let   bestMove  = null;
    const evalMoves = [];

    for (const [r, c] of moves) {
      board[r][c] = this.AI;
      const score = this._minimax(board, 0, -Infinity, Infinity, false);
      board[r][c] = null;
      evalMoves.push({ row: r, col: c, score });
      if (score > bestScore) {
        bestScore = score;
        bestMove  = [r, c];
      }
    }

    this.explanation.evaluatedMoves = evalMoves;
    this.explanation.chosenMove     = bestMove;
    this.explanation.chosenScore    = bestScore;
    this.explanation.bestMoveReason = this._buildReason(bestScore, board, bestMove);

    return bestMove;
  }

  _buildReason(score, board, move) {
    if (score > 0)  return `This move guarantees a win for AI (score: +${score}). Optimal path found via Minimax.`;
    if (score < 0)  return `AI is in a losing position. This move delays the loss as long as possible.`;
    // check if this move blocks a human win
    if (move) {
      const test = this.model.cloneBoard(board);
      test[move[0]][move[1]] = this.HUMAN;
      if (this.model.checkWinner(test)) {
        return `This move blocks the opponent's immediate winning threat and leads to a draw.`;
      }
    }
    return `No winning path found for either side. This move leads to a draw — best achievable outcome.`;
  }

  getExplanation() {
    return { ...this.explanation };
  }
}
