import { useEffect, useState } from 'react' 
import * as O from 'fp-ts/Option' 
import * as A from 'fp-ts/Array'
import * as F from 'fp-ts/function' 
import { Side } from '@/types/Side'
import { GameStatus } from '@/types/GameStatus'  

type Board = O.Option<Side>[]

module Board {
    export const set = (index: number) => (side: Side) => (board: Board) : Board => { 
        const nextBoard = [...board] // deep copy
        nextBoard[index] = O.some(side)
        return nextBoard
    }
    export const getSelectableIndices = (board: Board) =>
        F.pipe (
            board,
            A.mapWithIndex ((i, v) => 
                F.pipe(
                    v,
                    O.match(
                        () => O.some (i),
                        (_) => O.none
                    )
                )
            ),
            A.filter (O.isSome),
            A.map((i) => i.value)
        )
    export const isFinished = (board: O.Option<Side>[]) =>
        F.pipe (
            [
                [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]
            ] ,  
            A.map(A.map((i) => board[i])),
            A.filter(A.every(O.isSome)),
            A.map(A.map((o) => o.value)),
            A.findFirstMap((sides)  => {             
                if (sides.every((s) => s === sides[0] ))  
                    return O.some(sides[0]) 
                else  
                    return O.none 
            }), 
            O.match(
                () => board.every(O.isSome) ? O.some(O.none) : O.none,
                F.flow (O.some , O.some)
            )
        )  
}

type GameState = {
    board: Board
    status: GameStatus
    turn: Side
    winner: O.Option<Side>
} 
 
module CPU {
    export const evaluateBoard = (turn: Side) => (board: Board) => 
        F.pipe(
            Board.isFinished(board),
            O.match(
                () => 0.,   
                O.match(
                    () => 0.0, 
                    (winner) => winner === turn ? 1.0 : -1.0
                ) 
            )
        )  

    export const minimax =
        (evaluate : (board: Board) => number) =>
        (isMaximizing: boolean) =>  
        (depth: number) => 
        (turn: Side) => 
        (board: Board) : [O.Option<number>, number] => {

        if (depth === 0 || O.isSome(Board.isFinished(board))) { 
            return [O.none, evaluate (board)]
        }
        return (
            F.pipe(
                board,
                Board.getSelectableIndices, 
                A.map<number, [O.Option<number>, number]>((index) => { 
                    const [_, ret] = 
                        F.pipe( 
                            board,
                            Board.set(index)(turn) ,
                            minimax (evaluate) (!isMaximizing) (depth - 1) (turn === 'O' ? 'X' : 'O')
                        ) 
                    return [O.some (index), ret] 
                }),   
                A.reduce<[O.Option<number>, number], [O.Option<number>, number]>(
                    [O.none, isMaximizing ? -Infinity : Infinity],
                    ([accI, acc], [xi, x]) => (
                        isMaximizing 
                            ? acc < x ? [xi, x] : [accI, acc] 
                            : x < acc ? [xi, x] : [accI, acc]
                    )
                ) 
            ) 
        ) 
    }

    export const alphabeta =
        (evaluate : (board: Board) => number) =>
        (isMaximizing: boolean) =>  
        (alpha: number, beta: number) =>
        (depth: number) => 
        (turn: Side) => 
        (board: Board) : [O.Option<number>, number] => { 
        if (depth === 0 || O.isSome(Board.isFinished(board))) { 
            return [O.none, evaluate (board)]
        }
        else { 
            if (isMaximizing) {
                let ax = alpha  
                let sel : O.Option<number> = O.none
                for (const index of Board.getSelectableIndices(board)) {
                    const nextBoard = Board.set(index)(turn)(board) 
                    const [_, a] = alphabeta (evaluate) (!isMaximizing) (ax, beta) (depth - 1) (turn === 'O' ? 'X' : 'O') (nextBoard)
                    if (ax < a) { 
                        ax = a
                        sel = O.some(index)
                    }
                    if (ax >= beta) break
                }
                return [sel, ax] 
            }
            else {
                let bx = beta
                let sel : O.Option<number> = O.none
                for (const index of Board.getSelectableIndices(board)) {
                    const nextBoard = Board.set(index)(turn)(board) 
                    const [_, b] = alphabeta (evaluate) (!isMaximizing) (alpha, bx) (depth - 1) (turn === 'O' ? 'X' : 'O') (nextBoard)
                    bx = Math.min(bx, b) 
                    if (b < bx) { 
                        bx = b
                        sel = O.some(index)
                    }
                    if (alpha >= bx) break
                }
                return [sel, bx]
            }
        } 
}

    export const randomSelect = (board: Board) => { 
        const candidates = Board.getSelectableIndices (board) 
        return ( 
            (candidates.length > 0)
            ? O.some (candidates[Math.floor(Math.random() * candidates.length)])
            : O.none 
        )
    }

}

 

export default (XisCPU : boolean, OisCPU : boolean): {
    state: GameState
    handleClick: (index: number) => void
    handleInit: () => void
} => { 

    const initGameState : GameState = {
        board: Array(9).fill(O.none),
        status: 'playing',
        turn: 'X',
        winner: O.none
    }
    
    const [state, setState] = useState<GameState>(initGameState)

    const updateState = (index: number) => { 
        const nextBoard = Board.set (index) (state.turn) (state.board)
        F.pipe (
            Board.isFinished (nextBoard) ,
            O.match(
                () => {   
                    setState(
                        {
                            board: nextBoard,
                            turn: state.turn == 'X' ? 'O' : 'X',
                            status: 'playing',
                            winner: O.none
                        }
                    )
                }, 
                (result) => {  
                    setState(
                        {
                            board: nextBoard,
                            turn: state.turn == 'X' ? 'O' : 'X',
                            status: 'finished',
                            winner: result
                        }
                    ) 
                }
            )
        ) 
    } 
 
    useEffect(() => {  
        if (state.status === 'playing' 
            && ((state.turn == 'X' && XisCPU) || (state.turn == 'O' && OisCPU))) {   
            F.pipe(
                CPU.alphabeta (CPU.evaluateBoard (state.turn)) (true) (-Infinity, Infinity) (9) (state.turn) (state.board) ,
                ([move, a]) => {
                    console.log(move + " " + a)
                    return   move
                },
                O.match(
                    () => {},
                    (index) => updateState(index) 
                ) 
            )
    
            // F.pipe(
            //     CPU.minimax (CPU.evaluateBoard (state.turn)) (true) (9) (state.turn) (state.board) ,
            //     ([move, _]) => move,
            //     O.match(
            //         () => {},
            //         (index) => updateState(index) 
            //     ) 
            // )

            // F.pipe(
            //     CPU.randomSelect (state.board),
            //     O.match(
            //         () => {},
            //         (index) => updateState(index)
            //     ) 
            // )
            
        }
    }, [state])
  
    const handleClick = (n: number) : void => {  
        if (
            O.isNone(state.board[n]) 
            && state.status == 'playing'
            && ((state.turn == 'X' && !XisCPU) || (state.turn == 'O' && !OisCPU)) 
            ) {
            updateState(n)
        }
    }
 
    const handleInit = () : void => { 
        setState(initGameState)
    }

    return { state, handleClick, handleInit };
}