import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// class Square extends React.Component {
//   render() {
//     return (
//       <button className="square" onClick={() => this.props.onClick()}>
//         {this.props.value}
//       </button>
//     );
//   }
// }

function Square(props) {
  return (
    <button
      className={"square " + (props.value === "X" ? "blue-fg" : "red-fg")}
      onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    return (
      <div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="board-row">
            {[0, 1, 2].map((j) => this.renderSquare((3 * i) + j))}
          </div>
        ))}
      </div>
    );
  }
}

class MoveHistory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {ascending: true};
    this.changeOrder = this.changeOrder.bind(this);
  }

  changeOrder() {
    this.setState(prevState => ({ascending: !(prevState.ascending)}));
  }

  render() {
    const ascending = this.state.ascending;
    const moveList = this.props.history.reduce((accumulator, step, move) => {
      const desc = move ?
        'Go to move #' + move + ` (${step.lastMove % 3}, ${Math.floor(step.lastMove / 3)})`:
        'Go to game start';
      const nextElement = (
        <li key={move}>
          <button onClick={() => this.props.jump(move)}>
            {this.props.stepNumber === move ? <strong>{desc}</strong> : desc}
          </button>
        </li>
      );
      if (ascending) {
        accumulator.push(nextElement);
      } else {
        accumulator.unshift(nextElement);
      }
      return accumulator;
    }, []);

    return (
      <div>
        <button onClick={this.changeOrder}>
          Show moves in {ascending ? "descending" : "ascending"} order
        </button>
        {moveList}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        lastMove: -1,
      }],
      stepNumber: 0,
      xIsNext: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        lastMove: i,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  render() {
    const history = this.state.history;
    const stepNumber = this.state.stepNumber;
    const current = history[stepNumber];
    const draw = isBoardFull(current.squares);
    const winner = calculateWinner(current.squares);

    const moves = <MoveHistory
      history={history}
      stepNumber={stepNumber}
      jump={(move) => this.jumpTo(move)} />

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else if (draw) {
      status = 'Draw';
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function isBoardFull(squares) {
  return squares.reduce((accumulator, currentValue) => accumulator && currentValue);
}
