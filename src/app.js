/**
 * app.js — Entry point
 * Wires up the MVP pattern and starts the game.
 */
import { GamePresenter } from './presenter/GamePresenter.js';

const presenter = new GamePresenter();
presenter.startGame();
