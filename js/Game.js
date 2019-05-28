import Board from './Board.js'
import Player from './Player.js'

export default class Game {
  constructor () {
    this.board = new Board()
    this.players = this.createPlayers()
    this.ready = false
    this.winning = []
  }

  /**
     * Returns active player.
     * @return  {Object}    player - The active player.
     */
  get activePlayer () {
    return this.players.find(player => player.active)
  }

  /**
     * Creates two player objects
     * @return  {array}    An array of two player objects.
     */
  createPlayers () {
    const players = [new Player('Player 1', 1, '#e15258', true),
      new Player('Player 2', 2, '#e59a13')]
    return players
  }

  /**
     * Begins game.
     */
  startGame () {
    this.board.drawHTMLBoard()
    this.activePlayer.activeToken.drawHTMLToken()
    this.ready = true
  }

  /**
     * Branches code, depending on what key player pressed
     * @param {Object}  e - Keydown event object
     */
  handleKeydown (e) {
    if (this.ready) {
      switch (e.key) {
        case 'ArrowLeft': this.activePlayer.activeToken.moveLeft()
          break
        case 'ArrowRight': this.activePlayer.activeToken.moveRight(this.board.columns)
          break
        case 'ArrowDown': this.playToken()
          break
        default : break
      }
    }
  }

  /**
      * Plays the current ActiveToken
      */
  playToken () {
    let spaces = this.board.spaces
    let activeToken = this.activePlayer.activeToken
    let targetColumn = spaces[activeToken.columnLocation]
    let targetSpace = null

    for (let space of targetColumn) {
      if (space.token === null) {
        targetSpace = space
      }
    }

    if (targetSpace !== null) {
      const game = this

      game.ready = false
      activeToken.drop(targetSpace, () => game.updateGameState(activeToken, targetSpace))
    }
  }
  /**
     * Switches the current player.
     */
  switchPlayers () {
    this.players[0].active = !this.players[0].active
    this.players[1].active = !this.players[1].active
  }

  /**
     * Displays the game over message.
     * @param {String} message - Game over message
     */
  gameOver (message) {
    document.getElementById('game-over').textContent = message
    document.getElementById('game-over').style.display = 'block'
    this.flashTokens()
  }
  /**
     * Updates the game state after token dropped.
     * @param  {Object} token - the token that's being dropped.
     * @param  {Object} target - Targeted space for dropped token.
     */
  updateGameState (token, target) {
    target.mark(token)

    if (this.checkForWin(target)) {
      this.gameOver(`Congratulations to ${this.activePlayer.name} for winning.`)
    } else {
      this.switchPlayers()
      if (this.activePlayer.checkTokens) {
        this.activePlayer.activeToken.drawHTMLToken()
        this.ready = true
      } else {
        this.gameOver(`Game Over. ${this.activePlayer.name} is out of tokens.`)
      }
    }
  }

  /**
     * Check if there is a winner after each token drop.
     * @return {boolean} Boolean value indicating if game has been won.
     */
  checkForWin (target) {
    let { rows, columns, spaces } = this.board
    let owner = target.token.owner
    let win = false

    for (let x = 0; x < columns; x += 1) {
      for (let y = 0; y < rows; y += 1) {
        if (y < 3) {
          // check vertical - only run if y < 3 (rows - 4)
          if (spaces[x][y].owner === owner &&
                        spaces[x][y + 1].owner === owner &&
                        spaces[x][y + 2].owner === owner &&
                        spaces[x][y + 3].owner === owner) {
            win = true
            this.winning.push(spaces[x][y], spaces[x][y + 1], spaces[x][y + 2], spaces[x][y + 3])
          }
        };
        if (x < 4) {
          // check horizontal - only run if x < 4 (columns - 4)
          if (spaces[x][y].owner === owner &&
                        spaces[x + 1][y].owner === owner &&
                        spaces[x + 2][y].owner === owner &&
                        spaces[x + 3][y].owner === owner) {
            win = true
            this.winning.push(spaces[x][y], spaces[x + 1][y], spaces[x + 2][y], spaces[x + 3][y])
          }

          if (y > 2) {
            // check diagonally up - only run if x < 4 (columns - 4) & y > 2 (rows - 4)
            if (spaces[x][y].owner === owner &&
                            spaces[x + 1][y - 1].owner === owner &&
                            spaces[x + 2][y - 2].owner === owner &&
                            spaces[x + 3][y - 3].owner === owner) {
              win = true
              this.winning.push(spaces[x][y], spaces[x + 1][y - 1], spaces[x + 2][y - 2], spaces[x + 3][y - 3])
            }
          };
          if (y < 3) {
            // check diagonally down - only run if x < 4 (columns - 4) & y < 3 (rows - 4)
            if (spaces[x][y].owner === owner &&
                            spaces[x + 1][y + 1].owner === owner &&
                            spaces[x + 2][y + 2].owner === owner &&
                            spaces[x + 3][y + 3].owner === owner) {
              win = true
              this.winning.push(spaces[x][y], spaces[x + 1][y + 1], spaces[x + 2][y + 2], spaces[x + 3][y + 3])
            }
          };
        };
      }
    }
    return win
  };


  /**
   * Dims the whole board and brings winning line to full brightness
   * @return {void}@memberof Game
   */
  flashTokens () {
    let { rows, columns, spaces } = this.board
    for (let x = 0; x < columns; x += 1) {
      for (let y = 0; y < rows; y += 1) {
        if (spaces[x][y].token) {
          // eslint-disable-next-line no-undef
          $(`#${spaces[x][y].token.id}`)
            .animate({ opacity: 0.4 }, 250)
        }
      }
    }
    for (let space of this.winning) {
      // eslint-disable-next-line no-undef - $ for jQuery
      $(`#${space.token.id}`)
        .animate({ opacity: 1 }, 250)
    }
  }
}
