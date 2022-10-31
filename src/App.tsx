import './App.css'
import Game from "./pages/Game"
import useTickTackToe from "./hooks/useTicTacToe"
import * as O from 'fp-ts/Option'

function App() {
  const game = useTickTackToe()
  return (
    <div className='App'> 
      <h1>Tic Tac Toe</h1>
      <Game board={game.board} handleClick={game.handleClick} /> 
      <h2>
        {   
          game.status !== 'finished' 
            ? <>turn : {game.turn}</>
            : O.match (
                () => "draw",
                (side) => "winner : " + side,
              ) (game.winner) 
        } 
      </h2>
      {   
        game.status === 'finished' 
          ? <button onClick={game.handleInit}>Restart</button> 
          : <></>
      } 
    </div>
 ) 
}

export default App
