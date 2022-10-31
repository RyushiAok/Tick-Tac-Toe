import './App.css'
import Game from "@/pages/Game"
import useTickTackToe from "@/hooks/useTicTacToe"
import * as O from 'fp-ts/Option'

function App() {
  const game = useTickTackToe(false, true)
  return (
    <div className='App'> 
      <h1>Tic Tac Toe</h1>
      <Game board={game.state.board} handleClick={game.handleClick} /> 
      <h2>
        {   
          game.state.status !== 'finished' 
            ? <>turn : {game.state.turn}</>
            : O.match (
                () => "draw",
                (side) => "winner : " + side,
              ) (game.state.winner) 
        } 
      </h2>
      {   
        game.state.status === 'finished' 
          ? <button onClick={game.handleInit}>Restart</button> 
          : <></>
      } 
    </div>
 ) 
}

export default App
