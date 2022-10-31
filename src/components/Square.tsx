import { Side } from '@/types/Side'
import * as O from 'fp-ts/Option'

interface Props {
    index: number
    value: O.Option<Side>
    style: React.CSSProperties
    handleClick: (index: number) => void
}

const Square = (props: Props) => {
    const { index, value, style, handleClick } = props  
    return (
        <button style={style} onClick={() => handleClick(index)}>
            {
                O.match(
                    () => '',
                    (side: Side) => {
                        switch (side) {
                            case 'X': return 'X' 
                            case 'O': return 'O' 
                        } 
                    }
                ) (value)
            }
        </button>
    )
}
export default Square
