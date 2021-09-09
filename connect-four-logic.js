// const NUM_OF_PLAYERS = 2
const EMPTY = ''
const MOVEMENT_DIRECTIONS = Object.freeze({
  RIGHT: 'right',
  DIAGONAL_RIGHT: 'diagonal-right',
  UP: 'up',
  DIAGONAL_LEFT: 'diagonal-left',
})
const BOARD_ROWS_MAX = 5 // Zero-indexed.
const BOARD_COLUMNS_MAX = 6 // Zero-indexed.
const AMOUNT_NEEDED_TO_WIN = 4
const PLAYER_1 = 0
const PLAYER_2 = 1
const NEW_BOARD = Array(BOARD_ROWS_MAX + 1).fill(Array(BOARD_COLUMNS_MAX + 1).fill(EMPTY))
const INITIAL_PLAYER_STATE = [
  {
    consecutivePieces: [],
    currentDirection: null,
    isWinner: false,
    prevDirection: null,
  },
  {
    consecutivePieces: [],
    currentDirection: null,
    isWinner: false,
    prevDirection: null,
  },
]
const boardElement = document.getElementById('c4-board')

let board = NEW_BOARD
let playerState = INITIAL_PLAYER_STATE
let winner = undefined
let endOfGame = false
let currentPlayer = PLAYER_1

function resetGame() {
  board = NEW_BOARD
  playerState = INITIAL_PLAYER_STATE
  winner = undefined
  currentPlayer = PLAYER_1
}

function setPlayerState({ player, consecutivePieces, prevDirection, currentDirection, isWinner }) {
  let updatedPlayerState = playerState[player]
  updatedPlayerState = { consecutivePieces, currentDirection, prevDirection, isWinner }
  playerState.splice(player, 1, updatedPlayerState)
}

function setBoard({ columnIndex, rowIndex }) {
  const updatedBoard = [...board]
  const updatedRow = [...updatedBoard[rowIndex]]
  updatedRow.splice(columnIndex, 1, currentPlayer)
  updatedBoard[rowIndex] = updatedRow
  board = [...updatedBoard]
}

function getAdjacentPieces({ currentPiece, player }) {
  const { rowIndex, value, columnIndex } = currentPiece
  const adjacentPieces = []

  if (typeof rowIndex !== 'number' || typeof columnIndex !== 'number') {
    throw new Error('Piece must have a valid rowIndex and columnIndex position as an integer.')
  }

  // Check if we can move right.
  if (
    columnIndex !== BOARD_COLUMNS_MAX
  ) {
    const nextPieceValue = board[rowIndex][columnIndex + 1]
    if (value === nextPieceValue && nextPieceValue === player) {
      console.log('we can move RIGHT')
      adjacentPieces.push({ nextPiece: { rowIndex, columnIndex: columnIndex + 1, value: nextPieceValue }, direction: MOVEMENT_DIRECTIONS.RIGHT })
    }
  }

  // Check if we can move diagonal right.
  if (
    columnIndex !== BOARD_COLUMNS_MAX &&
    rowIndex > 0
  ) {
    const nextPieceValue = board[rowIndex - 1][columnIndex + 1]
    if (value === nextPieceValue && nextPieceValue === player) {
      console.log('we can move DIAGONAL_RIGHT')
      adjacentPieces.push({ nextPiece: { rowIndex: rowIndex - 1, columnIndex: columnIndex + 1, value: nextPieceValue }, direction: MOVEMENT_DIRECTIONS.DIAGONAL_RIGHT })
    }
  }

  // Check if we can move up.
  if (
    rowIndex !== 0
  ) {
    const nextPieceValue = board[rowIndex - 1][columnIndex]
    if (value === nextPieceValue && nextPieceValue === player) {
      console.log('we can move UP')
      adjacentPieces.push({ nextPiece: { rowIndex: rowIndex - 1, columnIndex, value: nextPieceValue }, direction: MOVEMENT_DIRECTIONS.UP })
    }
  }

  // Check if we can move diagonal left.
  if (
    columnIndex !== 0 &&
    rowIndex > 0
  ) {
    const nextPieceValue = board[rowIndex - 1][columnIndex - 1]
    if (value === nextPieceValue && nextPieceValue === player) {
      console.log('we can move DIAGONAL_LEFT')
      adjacentPieces.push({ nextPiece: { rowIndex: rowIndex - 1, columnIndex: columnIndex - 1, value: nextPieceValue }, direction: MOVEMENT_DIRECTIONS.DIAGONAL_LEFT })
    }
  }
  
  return adjacentPieces
}

const players = [PLAYER_1, PLAYER_2]

function endGame(player) {
  document.querySelector('h1').innerHTML = `Player ${player + 1} has won!`
}

// Finds winner, if one exists.
function checkForWinner(currentPiece, player) {
  console.log('checkForWinner', {currentPiece, player: playerState[player]})
  const { rowIndex, columnIndex, value } = currentPiece

  if (typeof winner === 'number' || endOfGame) {
    return
  }

  // See if anyone has won.
  if (playerState[player].consecutivePieces.length === AMOUNT_NEEDED_TO_WIN) {
    endOfGame = true
    endGame(player)
    return
  }

  // No one has won yet.
  if (rowIndex === 0 && columnIndex === BOARD_COLUMNS_MAX) {
    playerState = INITIAL_PLAYER_STATE
    return
  }

  // If the spot is occupied by the player, see if there are any other adjacent spots occupied by the same player.
  if (value === player) {
    console.log('this cell has a piece', currentPiece)
    const adjacentPieces = getAdjacentPieces({ currentPiece, player })
    console.log(adjacentPieces)

    if (playerState[player].currentDirection && playerState[player].consecutivePieces.length && adjacentPieces.length) {
      const nextPiece = adjacentPieces.find((piece) => piece.direction === playerState[player].currentDirection)
      if (nextPiece) {
        console.log('adding a piece to player', player, nextPiece)
        const consecutivePieces = [...playerState[player].consecutivePieces, nextPiece.nextPiece]
        setPlayerState({ ...playerState[player], player, consecutivePieces, currentDirection: nextPiece.direction, prevDirection: nextPiece.direction })
        return checkForWinner(nextPiece.nextPiece, player)
      } else {
        console.log('No next piece. Reset.')
        setPlayerState({ ...playerState[player], player, consecutivePieces: [], currentDirection: null, prevDirection: playerState[player].currentDirection })
      }
    } else if (adjacentPieces.length) {
      console.log('no prev pieces, but checking for next piece.')
      // If we get here, then the spot is occupied, but we aren't going a current direction and there aren't any consecutive pieces.
      // This means that we only have the original piece and one adjacent piece to test.
      let prevDirectionIndex = Object.keys(MOVEMENT_DIRECTIONS).findIndex((key) => MOVEMENT_DIRECTIONS[key] === playerState[player].prevDirection) || 0
      console.log(playerState[player].prevDirection)
      for (let i = prevDirectionIndex; i < Object.keys(MOVEMENT_DIRECTIONS).length; i += 1) {
        const nextDirectionKey = Object.keys(MOVEMENT_DIRECTIONS)[i + 1]
        const nextDirection = MOVEMENT_DIRECTIONS[nextDirectionKey]
        const nextPiece = adjacentPieces.find((piece) => piece.direction === nextDirection)
        if (nextPiece) {
          console.log('adding a piece to player', player, nextPiece)
          const consecutivePieces = [currentPiece, nextPiece.nextPiece]
          setPlayerState({ ...playerState[player], player, consecutivePieces, currentDirection: nextPiece.direction, prevDirection: null })
          return checkForWinner(nextPiece.nextPiece, player)
        } else {
          console.log('No next piece. Reset.')
          setPlayerState({ ...playerState[player], player, consecutivePieces: [], currentDirection: null, prevDirection: null })
        }
      }
    } else {
      console.log('nothing!')
      setPlayerState({ ...playerState[player], player, consecutivePieces: [], currentDirection: null, prevDirection: null })
    }
  } else if (columnIndex < BOARD_COLUMNS_MAX) {
    console.log('moving to next column')
    // If we make it here, it means that there are no adjacent pieces and we should move on to the next piece.
    setPlayerState({ ...playerState[player], player, consecutivePieces: [], currentDirection: null, prevDirection: null  })
    const nextColumn = columnIndex + 1
    return checkForWinner({
      rowIndex,
      columnIndex: nextColumn,
      value: board[rowIndex][nextColumn]
    }, player)
  } else if (rowIndex > 0 && columnIndex === BOARD_COLUMNS_MAX) {
    console.log('moving to next row')
    // If at the end of the current column.
    setPlayerState({ ...playerState[player], player, consecutivePieces: [], currentDirection: null, prevDirection: null   })
    const nextRow = rowIndex - 1
    return checkForWinner({
      rowIndex: nextRow,
      columnIndex,
      value: board[nextRow][0]
    }, player)
  }
}

function calculateWinner() {
  checkForWinner({ rowIndex: BOARD_ROWS_MAX, value: board[BOARD_ROWS_MAX][0], columnIndex: 0 }, currentPlayer)
}

function resetGame() { }

function paintGame() {
  board.forEach((row, rowIndex) => {
    row.forEach((placement, placementIndex) => {
      if (placement !== EMPTY) {
        const placementElement = document.querySelector(`#row-${rowIndex + 1} div:nth-child(${placementIndex + 1})`)
        if (placementElement) {
          placementElement.classList.add(`player${placement + 1}`)
        }
      }
    })
  })
}

function endTurn() {
  calculateWinner()
  currentPlayer = currentPlayer === PLAYER_1 ? PLAYER_2 : PLAYER_1
  console.log(playerState)
  console.log('----------------')
}

function addPlacement(columnIndex) {
  if (endOfGame) {
    return
  }

  let hasAddedPlacement = false
  for (let rowIndex = BOARD_ROWS_MAX; rowIndex >= 0; rowIndex -= 1) {
    if (hasAddedPlacement) {
      return
    }

    if (board[rowIndex][columnIndex] === EMPTY) {
      const placementElement = document.querySelector(`#row-${rowIndex + 1} div:nth-child(${columnIndex + 1})`)
      if (placementElement) {
        placementElement.classList.add(`player${currentPlayer + 1}`)
        setBoard({ columnIndex, rowIndex })
        hasAddedPlacement = true
        endTurn()
      }
    }
  }
}

function initializeGame() {
  resetGame()
  board.forEach((row, rowIndex) => {
    row.forEach((_, columnIndex) => {
      const placementElement = document.querySelector(`#row-${rowIndex + 1} div:nth-child(${columnIndex + 1})`)
      placementElement.addEventListener('click', () => {
        addPlacement(columnIndex)
      })
    })
  })
  paintGame()
}

initializeGame()