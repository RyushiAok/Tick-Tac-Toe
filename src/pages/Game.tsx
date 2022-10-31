import { Side } from '@/types/Side'
import Square from '@/components/Square'
import * as O from 'fp-ts/Option'

interface Props { 
    board: O.Option<Side>[]
    handleClick(index: number): void;
}

const Game = (props: Props) => { 
    const { board, handleClick } = props 
    const styles = {
        board: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)', 
            color: 'white', 
        },
        button: {
            width: '150px',
            height : "150px",
            fontSize: '45px', 
            margin: '3px', 
        }
    }
    return ( 
        <div style={styles.board}>
            {board.map((side, index) => (
                <Square
                    key={index}
                    value={side}
                    index={index}
                    style={styles.button}
                    handleClick={handleClick} 
                />))
            }
        </div> 
    )
}
export default Game