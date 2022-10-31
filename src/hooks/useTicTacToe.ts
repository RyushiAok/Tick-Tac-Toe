import { useEffect, useState } from 'react' 
import * as O from 'fp-ts/Option'
import * as A from 'fp-ts/Array'
import * as F from 'fp-ts/function'
import { Side } from '@/types/Side'
import { GameStatus } from '@/types/GameStatus'

const isFinished = (board: O.Option<Side>[]) => (turn : Side) =>
    F.pipe (
        [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6],
            [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]
        ] ,  
        A.exists(positions => 
            positions
                .map(position => board[position]) 
                .every(value => O.isSome(value) && value.value === turn)   
        ),
        (existWinner) => 
            existWinner 
            ? O.some(O.some(turn)) 
            : board.every(O.isSome) 
                ? O.some(O.none)
                : O.none
    )  

export default (): {
    board: O.Option<Side>[]
    status: string
    turn: Side
    winner: O.Option<string>
    handleClick: (index: number) => void
    handleInit: () => void
} => { 
    const [board, setBoard] = useState<O.Option<Side>[]>(Array(9).fill(O.none))
    const [turn, setTurn] = useState<Side>('X')
    const [winner, setWinner] = useState<O.Option<Side>>(O.none) 
    const [status, setStatus] = useState<GameStatus>('playing') 
 
    const handleClick = (n: number) : void => {  
        if (0 <= n && n < 9  
            && O.isNone(board[n])  
            && status == 'playing') { 

            const nextBoard = [...board] // deep copy
            nextBoard[n] = O.some(turn)
            F.pipe (
                isFinished (nextBoard) (turn),
                O.match(
                    () => { 
                        setTurn(turn == 'X' ? 'O' : 'X') 
                    }, 
                    (result) => { 
                        setStatus('finished')
                        setWinner(result) 
                    }
                )
            ) 
            setBoard(nextBoard)
        }
    }
 
    const handleInit = () : void => { 
        setBoard(Array(9).fill(O.none))
        setWinner(O.none)
        setTurn('X')
        setStatus('playing')
    }
 

    return { board, status, turn, winner, handleClick, handleInit };
}