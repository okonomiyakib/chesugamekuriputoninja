import { useEffect, useRef, useState } from 'react';

const boardRows = Array.from({ length: 8 });
const boardColumns = Array.from({ length: 8 });
const boardSquares = boardRows.flatMap((_, rowIndex) =>
  boardColumns.map((_, columnIndex) => `${String.fromCharCode(65 + columnIndex)}${8 - rowIndex}`),
);

type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
type PieceColor = 'white' | 'black';
type SakuyaMood = 'normal' | 'happy' | 'angry' | 'surprised';
type SakuyaReaction = {
  mood: SakuyaMood;
  line: string;
};

type ChessPiece = {
  id: string;
  type: PieceType;
  color: PieceColor;
  position: string;
  characterName: string;
  imageUrl: string;
};

type BoardPosition = {
  file: number;
  rank: number;
};

const opponentName = '咲耶';

const sakuyaImages: Record<SakuyaMood, string> = {
  normal: '/characters/sakuya-normal.png',
  happy: '/characters/sakuya-happy.png',
  angry: '/characters/sakuya-angry.png',
  surprised: '/characters/sakuya-surprised.png',
};

const bgmFiles = [
  { path: '/sounds/bgm.mp3', contentType: 'audio/mpeg' },
  { path: '/sounds/bgm.wav', contentType: 'audio/wav' },
  { path: '/sounds/bgm.ogg', contentType: 'audio/ogg' },
];

const sakuyaLines = {
  normal: [
    '次の一手、見せてください。',
    'その手、本当に大丈夫ですか？',
    '忍びの勝負は、焦ったほうが負けです。',
  ],
  capturedPiece: {
    default: [
      'ビショップはいただきます。',
      'そのナイト、少し油断していましたね。',
      'クイーンを差し出すとは、大胆ですね。',
    ],
    bishop: ['ビショップはいただきます。'],
    knight: ['そのナイト、少し油断していましたね。'],
    queen: ['クイーンを差し出すとは、大胆ですね。'],
  },
  lostPiece: [
    'むむ……やりますね。',
    '今のは見えていました。たぶん。',
    '少しだけ、本気を出しましょう。',
  ],
  gaveCheck: [
    '王手です。逃げ切れますか？',
    'そろそろ追い詰めますよ。',
    '残念ですね。王様が危ないです。',
  ],
  gotChecked: [
    'そう来ましたか……。',
    'まだ終わりではありません。',
    'これは少し困りましたね。',
  ],
  won: [
    '詰みです。また挑んでください。',
    '忍びきれませんでしたね。',
    '今回は、わたしの勝ちです。',
  ],
  lost: [
    '見事です。修行し直してきます。',
    'あなた、なかなか強いですね。',
    '今日は譲っておきましょう。',
  ],
  draw: ['引き分けですか。今回はここまでにしておきましょう。'],
};

const initialPieces: ChessPiece[] = [
  { id: 'black-rook-a8', type: 'rook', color: 'black', position: 'A8', characterName: 'Black Ninja Rook', imageUrl: '' },
  { id: 'black-knight-b8', type: 'knight', color: 'black', position: 'B8', characterName: 'Black Ninja Knight', imageUrl: '' },
  { id: 'black-bishop-c8', type: 'bishop', color: 'black', position: 'C8', characterName: 'Black Ninja Bishop', imageUrl: '' },
  { id: 'black-queen-d8', type: 'queen', color: 'black', position: 'D8', characterName: 'Black Ninja Queen', imageUrl: '' },
  { id: 'black-king-e8', type: 'king', color: 'black', position: 'E8', characterName: 'Black Ninja King', imageUrl: '' },
  { id: 'black-bishop-f8', type: 'bishop', color: 'black', position: 'F8', characterName: 'Black Ninja Bishop', imageUrl: '' },
  { id: 'black-knight-g8', type: 'knight', color: 'black', position: 'G8', characterName: 'Black Ninja Knight', imageUrl: '' },
  { id: 'black-rook-h8', type: 'rook', color: 'black', position: 'H8', characterName: 'Black Ninja Rook', imageUrl: '' },
  { id: 'black-pawn-a7', type: 'pawn', color: 'black', position: 'A7', characterName: 'Black Ninja Pawn', imageUrl: '' },
  { id: 'black-pawn-b7', type: 'pawn', color: 'black', position: 'B7', characterName: 'Black Ninja Pawn', imageUrl: '' },
  { id: 'black-pawn-c7', type: 'pawn', color: 'black', position: 'C7', characterName: 'Black Ninja Pawn', imageUrl: '' },
  { id: 'black-pawn-d7', type: 'pawn', color: 'black', position: 'D7', characterName: 'Black Ninja Pawn', imageUrl: '' },
  { id: 'black-pawn-e7', type: 'pawn', color: 'black', position: 'E7', characterName: 'Black Ninja Pawn', imageUrl: '' },
  { id: 'black-pawn-f7', type: 'pawn', color: 'black', position: 'F7', characterName: 'Black Ninja Pawn', imageUrl: '' },
  { id: 'black-pawn-g7', type: 'pawn', color: 'black', position: 'G7', characterName: 'Black Ninja Pawn', imageUrl: '' },
  { id: 'black-pawn-h7', type: 'pawn', color: 'black', position: 'H7', characterName: 'Black Ninja Pawn', imageUrl: '' },
  { id: 'white-pawn-a2', type: 'pawn', color: 'white', position: 'A2', characterName: 'White Ninja Pawn', imageUrl: '' },
  { id: 'white-pawn-b2', type: 'pawn', color: 'white', position: 'B2', characterName: 'White Ninja Pawn', imageUrl: '' },
  { id: 'white-pawn-c2', type: 'pawn', color: 'white', position: 'C2', characterName: 'White Ninja Pawn', imageUrl: '' },
  { id: 'white-pawn-d2', type: 'pawn', color: 'white', position: 'D2', characterName: 'White Ninja Pawn', imageUrl: '' },
  { id: 'white-pawn-e2', type: 'pawn', color: 'white', position: 'E2', characterName: 'White Ninja Pawn', imageUrl: '' },
  { id: 'white-pawn-f2', type: 'pawn', color: 'white', position: 'F2', characterName: 'White Ninja Pawn', imageUrl: '' },
  { id: 'white-pawn-g2', type: 'pawn', color: 'white', position: 'G2', characterName: 'White Ninja Pawn', imageUrl: '' },
  { id: 'white-pawn-h2', type: 'pawn', color: 'white', position: 'H2', characterName: 'White Ninja Pawn', imageUrl: '' },
  { id: 'white-rook-a1', type: 'rook', color: 'white', position: 'A1', characterName: 'White Ninja Rook', imageUrl: '' },
  { id: 'white-knight-b1', type: 'knight', color: 'white', position: 'B1', characterName: 'White Ninja Knight', imageUrl: '' },
  { id: 'white-bishop-c1', type: 'bishop', color: 'white', position: 'C1', characterName: 'White Ninja Bishop', imageUrl: '' },
  { id: 'white-queen-d1', type: 'queen', color: 'white', position: 'D1', characterName: 'White Ninja Queen', imageUrl: '' },
  { id: 'white-king-e1', type: 'king', color: 'white', position: 'E1', characterName: 'White Ninja King', imageUrl: '' },
  { id: 'white-bishop-f1', type: 'bishop', color: 'white', position: 'F1', characterName: 'White Ninja Bishop', imageUrl: '' },
  { id: 'white-knight-g1', type: 'knight', color: 'white', position: 'G1', characterName: 'White Ninja Knight', imageUrl: '' },
  { id: 'white-rook-h1', type: 'rook', color: 'white', position: 'H1', characterName: 'White Ninja Rook', imageUrl: '' },
];

const pieceSymbols: Record<PieceColor, Record<PieceType, string>> = {
  white: {
    king: '♔',
    queen: '♕',
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙',
  },
  black: {
    king: '♚',
    queen: '♛',
    rook: '♜',
    bishop: '♝',
    knight: '♞',
    pawn: '♟',
  },
};

function findPieceByPosition(pieces: ChessPiece[], position: string) {
  return pieces.find((piece) => piece.position === position);
}

function parsePosition(position: string): BoardPosition {
  return {
    file: position.charCodeAt(0) - 'A'.charCodeAt(0),
    rank: Number(position[1]),
  };
}

function createPosition(file: number, rank: number) {
  return `${String.fromCharCode('A'.charCodeAt(0) + file)}${rank}`;
}

function canCaptureTarget(selectedPiece: ChessPiece, targetPiece: ChessPiece | undefined) {
  return !targetPiece || (targetPiece.color !== selectedPiece.color && targetPiece.type !== 'king');
}

function isPathClear(pieces: ChessPiece[], fromPosition: string, targetPosition: string) {
  const from = parsePosition(fromPosition);
  const to = parsePosition(targetPosition);
  const fileStep = Math.sign(to.file - from.file);
  const rankStep = Math.sign(to.rank - from.rank);

  let currentFile = from.file + fileStep;
  let currentRank = from.rank + rankStep;

  while (currentFile !== to.file || currentRank !== to.rank) {
    if (findPieceByPosition(pieces, createPosition(currentFile, currentRank))) {
      return false;
    }

    currentFile += fileStep;
    currentRank += rankStep;
  }

  return true;
}

function isPawnAtStartPosition(piece: ChessPiece) {
  const { rank } = parsePosition(piece.position);
  return (piece.color === 'white' && rank === 2) || (piece.color === 'black' && rank === 7);
}

function canMovePawn(pieces: ChessPiece[], selectedPiece: ChessPiece, targetPosition: string) {
  const targetPiece = findPieceByPosition(pieces, targetPosition);
  const from = parsePosition(selectedPiece.position);
  const to = parsePosition(targetPosition);
  const direction = selectedPiece.color === 'white' ? 1 : -1;
  const fileDiff = to.file - from.file;
  const rankDiff = to.rank - from.rank;

  if (!canCaptureTarget(selectedPiece, targetPiece)) {
    return false;
  }

  if (fileDiff === 0 && rankDiff === direction) {
    return !targetPiece;
  }

  if (fileDiff === 0 && rankDiff === direction * 2 && isPawnAtStartPosition(selectedPiece)) {
    const oneStepPosition = `${String.fromCharCode('A'.charCodeAt(0) + from.file)}${from.rank + direction}`;
    return !targetPiece && !findPieceByPosition(pieces, oneStepPosition);
  }

  if (Math.abs(fileDiff) === 1 && rankDiff === direction) {
    return Boolean(targetPiece && targetPiece.color !== selectedPiece.color);
  }

  return false;
}

function canMoveRook(pieces: ChessPiece[], selectedPiece: ChessPiece, targetPosition: string) {
  const targetPiece = findPieceByPosition(pieces, targetPosition);
  const from = parsePosition(selectedPiece.position);
  const to = parsePosition(targetPosition);
  const isStraightMove = from.file === to.file || from.rank === to.rank;

  return (
    isStraightMove &&
    isPathClear(pieces, selectedPiece.position, targetPosition) &&
    canCaptureTarget(selectedPiece, targetPiece)
  );
}

function canMoveBishop(pieces: ChessPiece[], selectedPiece: ChessPiece, targetPosition: string) {
  const targetPiece = findPieceByPosition(pieces, targetPosition);
  const from = parsePosition(selectedPiece.position);
  const to = parsePosition(targetPosition);
  const isDiagonalMove = Math.abs(to.file - from.file) === Math.abs(to.rank - from.rank);

  return (
    isDiagonalMove &&
    isPathClear(pieces, selectedPiece.position, targetPosition) &&
    canCaptureTarget(selectedPiece, targetPiece)
  );
}

function canMoveQueen(pieces: ChessPiece[], selectedPiece: ChessPiece, targetPosition: string) {
  return (
    canMoveRook(pieces, selectedPiece, targetPosition) ||
    canMoveBishop(pieces, selectedPiece, targetPosition)
  );
}

function canMoveKnight(pieces: ChessPiece[], selectedPiece: ChessPiece, targetPosition: string) {
  const targetPiece = findPieceByPosition(pieces, targetPosition);
  const from = parsePosition(selectedPiece.position);
  const to = parsePosition(targetPosition);
  const fileDiff = Math.abs(to.file - from.file);
  const rankDiff = Math.abs(to.rank - from.rank);
  const isKnightMove = (fileDiff === 1 && rankDiff === 2) || (fileDiff === 2 && rankDiff === 1);

  return isKnightMove && canCaptureTarget(selectedPiece, targetPiece);
}

function canMoveKing(pieces: ChessPiece[], selectedPiece: ChessPiece, targetPosition: string) {
  const targetPiece = findPieceByPosition(pieces, targetPosition);
  const from = parsePosition(selectedPiece.position);
  const to = parsePosition(targetPosition);
  const fileDiff = Math.abs(to.file - from.file);
  const rankDiff = Math.abs(to.rank - from.rank);
  const isOneSquareMove = fileDiff <= 1 && rankDiff <= 1 && (fileDiff > 0 || rankDiff > 0);

  return isOneSquareMove && canCaptureTarget(selectedPiece, targetPiece);
}

function canPawnAttackSquare(attackingPiece: ChessPiece, targetPosition: string) {
  const from = parsePosition(attackingPiece.position);
  const to = parsePosition(targetPosition);
  const direction = attackingPiece.color === 'white' ? 1 : -1;

  return Math.abs(to.file - from.file) === 1 && to.rank - from.rank === direction;
}

function canRookAttackSquare(pieces: ChessPiece[], attackingPiece: ChessPiece, targetPosition: string) {
  const from = parsePosition(attackingPiece.position);
  const to = parsePosition(targetPosition);
  const isStraightAttack = from.file === to.file || from.rank === to.rank;

  return isStraightAttack && isPathClear(pieces, attackingPiece.position, targetPosition);
}

function canBishopAttackSquare(pieces: ChessPiece[], attackingPiece: ChessPiece, targetPosition: string) {
  const from = parsePosition(attackingPiece.position);
  const to = parsePosition(targetPosition);
  const isDiagonalAttack = Math.abs(to.file - from.file) === Math.abs(to.rank - from.rank);

  return isDiagonalAttack && isPathClear(pieces, attackingPiece.position, targetPosition);
}

function canQueenAttackSquare(pieces: ChessPiece[], attackingPiece: ChessPiece, targetPosition: string) {
  return (
    canRookAttackSquare(pieces, attackingPiece, targetPosition) ||
    canBishopAttackSquare(pieces, attackingPiece, targetPosition)
  );
}

function canKnightAttackSquare(attackingPiece: ChessPiece, targetPosition: string) {
  const from = parsePosition(attackingPiece.position);
  const to = parsePosition(targetPosition);
  const fileDiff = Math.abs(to.file - from.file);
  const rankDiff = Math.abs(to.rank - from.rank);

  return (fileDiff === 1 && rankDiff === 2) || (fileDiff === 2 && rankDiff === 1);
}

function canKingAttackSquare(attackingPiece: ChessPiece, targetPosition: string) {
  const from = parsePosition(attackingPiece.position);
  const to = parsePosition(targetPosition);
  const fileDiff = Math.abs(to.file - from.file);
  const rankDiff = Math.abs(to.rank - from.rank);

  return fileDiff <= 1 && rankDiff <= 1 && (fileDiff > 0 || rankDiff > 0);
}

function canAttackSquare(pieces: ChessPiece[], attackingPiece: ChessPiece, targetPosition: string) {
  if (attackingPiece.position === targetPosition) {
    return false;
  }

  if (attackingPiece.type === 'pawn') {
    return canPawnAttackSquare(attackingPiece, targetPosition);
  }

  if (attackingPiece.type === 'rook') {
    return canRookAttackSquare(pieces, attackingPiece, targetPosition);
  }

  if (attackingPiece.type === 'bishop') {
    return canBishopAttackSquare(pieces, attackingPiece, targetPosition);
  }

  if (attackingPiece.type === 'queen') {
    return canQueenAttackSquare(pieces, attackingPiece, targetPosition);
  }

  if (attackingPiece.type === 'knight') {
    return canKnightAttackSquare(attackingPiece, targetPosition);
  }

  return canKingAttackSquare(attackingPiece, targetPosition);
}

function isSquareAttacked(pieces: ChessPiece[], targetPosition: string, attackingColor: PieceColor) {
  return pieces
    .filter((piece) => piece.color === attackingColor)
    .some((piece) => canAttackSquare(pieces, piece, targetPosition));
}

function isKingInCheck(pieces: ChessPiece[], kingColor: PieceColor) {
  const king = pieces.find((piece) => piece.type === 'king' && piece.color === kingColor);
  const opponentColor = kingColor === 'white' ? 'black' : 'white';

  return Boolean(king && isSquareAttacked(pieces, king.position, opponentColor));
}

function getPiecesAfterMove(pieces: ChessPiece[], selectedPieceId: string, targetPosition: string) {
  const targetPiece = findPieceByPosition(pieces, targetPosition);

  return pieces
    .filter((piece) => piece.id !== targetPiece?.id)
    .map((piece) =>
      piece.id === selectedPieceId ? { ...piece, position: targetPosition } : piece,
    );
}

function wouldMoveLeaveKingInCheck(
  pieces: ChessPiece[],
  selectedPiece: ChessPiece,
  targetPosition: string,
) {
  const nextPieces = getPiecesAfterMove(pieces, selectedPiece.id, targetPosition);

  return isKingInCheck(nextPieces, selectedPiece.color);
}

function canMovePiece(pieces: ChessPiece[], selectedPiece: ChessPiece, targetPosition: string) {
  if (selectedPiece.position === targetPosition) {
    return false;
  }

  if (selectedPiece.type === 'pawn') {
    return canMovePawn(pieces, selectedPiece, targetPosition);
  }

  if (selectedPiece.type === 'rook') {
    return canMoveRook(pieces, selectedPiece, targetPosition);
  }

  if (selectedPiece.type === 'bishop') {
    return canMoveBishop(pieces, selectedPiece, targetPosition);
  }

  if (selectedPiece.type === 'queen') {
    return canMoveQueen(pieces, selectedPiece, targetPosition);
  }

  if (selectedPiece.type === 'knight') {
    return canMoveKnight(pieces, selectedPiece, targetPosition);
  }

  if (selectedPiece.type === 'king') {
    return canMoveKing(pieces, selectedPiece, targetPosition);
  }

  return false;
}

function canMakeMove(pieces: ChessPiece[], selectedPiece: ChessPiece, targetPosition: string) {
  return (
    canMovePiece(pieces, selectedPiece, targetPosition) &&
    !wouldMoveLeaveKingInCheck(pieces, selectedPiece, targetPosition)
  );
}

function getLegalMovesForPiece(pieces: ChessPiece[], selectedPiece: ChessPiece) {
  return boardSquares.filter((squareName) => canMakeMove(pieces, selectedPiece, squareName));
}

function getAllLegalMovesForColor(pieces: ChessPiece[], color: PieceColor) {
  return pieces
    .filter((piece) => piece.color === color)
    .flatMap((piece) =>
      getLegalMovesForPiece(pieces, piece).map((targetPosition) => ({
        piece,
        targetPosition,
      })),
    );
}

function isCheckmate(pieces: ChessPiece[], color: PieceColor) {
  return isKingInCheck(pieces, color) && getAllLegalMovesForColor(pieces, color).length === 0;
}

function isStalemate(pieces: ChessPiece[], color: PieceColor) {
  return !isKingInCheck(pieces, color) && getAllLegalMovesForColor(pieces, color).length === 0;
}

function movePiece(pieces: ChessPiece[], selectedPieceId: string, targetPosition: string) {
  const selectedPiece = pieces.find((piece) => piece.id === selectedPieceId);

  if (!selectedPiece || !canMakeMove(pieces, selectedPiece, targetPosition)) {
    return pieces;
  }

  return getPiecesAfterMove(pieces, selectedPieceId, targetPosition);
}

function playSound(soundPath: string) {
  const audio = new Audio(soundPath);

  audio.play().catch(() => {
    // Sound files are optional while developing, so audio failures should not stop the game.
  });
}

function pickRandomLine(lines: string[]) {
  return lines[Math.floor(Math.random() * lines.length)];
}

function getSakuyaCaptureLine(capturedPiece: ChessPiece) {
  const lines =
    capturedPiece.type === 'bishop' ||
    capturedPiece.type === 'knight' ||
    capturedPiece.type === 'queen'
      ? sakuyaLines.capturedPiece[capturedPiece.type]
      : sakuyaLines.capturedPiece.default;

  return pickRandomLine(lines);
}

function getSakuyaStatus(
  pieces: ChessPiece[],
  currentTurn: PieceColor,
  isCheckmateNow: boolean,
  isStalemateNow: boolean,
  currentReaction: SakuyaReaction,
): { mood: SakuyaMood; line: string } {
  if (isCheckmateNow && currentTurn === 'white') {
    return { mood: 'happy', line: pickRandomLine(sakuyaLines.won) };
  }

  if (isCheckmateNow && currentTurn === 'black') {
    return { mood: 'surprised', line: pickRandomLine(sakuyaLines.lost) };
  }

  if (isStalemateNow) {
    return { mood: 'surprised', line: pickRandomLine(sakuyaLines.draw) };
  }

  return currentReaction;
}

function App() {
  const [pieces, setPieces] = useState<ChessPiece[]>(initialPieces);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [currentTurn, setCurrentTurn] = useState<PieceColor>('white');
  const [bgmIsOn, setBgmIsOn] = useState(false);
  const [bgmMessage, setBgmMessage] = useState('');
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const [failedSakuyaImages, setFailedSakuyaImages] = useState<Partial<Record<SakuyaMood, boolean>>>({});
  const [sakuyaReaction, setSakuyaReaction] = useState<SakuyaReaction>({
    mood: 'normal',
    line: sakuyaLines.normal[0],
  });
  const currentPlayerIsInCheck = isKingInCheck(pieces, currentTurn);
  const currentPlayerIsCheckmate = isCheckmate(pieces, currentTurn);
  const currentPlayerIsStalemate = isStalemate(pieces, currentTurn);
  const gameIsOver = currentPlayerIsCheckmate || currentPlayerIsStalemate;
  const winner = currentTurn === 'white' ? 'Black' : 'White';
  const statusText = currentPlayerIsCheckmate
    ? `Checkmate - ${winner} Wins`
    : currentPlayerIsStalemate
      ? 'Stalemate - Draw'
      : `${currentTurn === 'white' ? 'White' : 'Black'} Turn${currentPlayerIsInCheck ? ' - Check' : ''}`;
  const sakuyaStatus = getSakuyaStatus(
    pieces,
    currentTurn,
    currentPlayerIsCheckmate,
    currentPlayerIsStalemate,
    sakuyaReaction,
  );
  const sakuyaImageUrl = sakuyaImages[sakuyaStatus.mood];
  const shouldShowSakuyaImage = !failedSakuyaImages[sakuyaStatus.mood];

  useEffect(() => {
    return () => {
      bgmRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (currentTurn !== 'black' || gameIsOver) {
      return;
    }

    const timerId = window.setTimeout(() => {
      const legalMoves = getAllLegalMovesForColor(pieces, 'black');

      if (legalMoves.length === 0) {
        return;
      }

      const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      const capturedPiece = findPieceByPosition(pieces, randomMove.targetPosition);
      const nextPieces = getPiecesAfterMove(pieces, randomMove.piece.id, randomMove.targetPosition);

      playSound(capturedPiece ? '/sounds/capture.mp3' : '/sounds/move.mp3');
      setPieces(nextPieces);
      setSelectedPieceId(null);
      setSakuyaReaction({
        mood: capturedPiece || isKingInCheck(nextPieces, 'white') ? 'happy' : 'normal',
        line: capturedPiece
          ? getSakuyaCaptureLine(capturedPiece)
          : isKingInCheck(nextPieces, 'white')
            ? pickRandomLine(sakuyaLines.gaveCheck)
            : pickRandomLine(sakuyaLines.normal),
      });
      setCurrentTurn('white');
    }, 500);

    return () => window.clearTimeout(timerId);
  }, [currentTurn, gameIsOver, pieces]);

  async function toggleBgm() {
    if (bgmIsOn) {
      bgmRef.current?.pause();
      setBgmIsOn(false);
      setBgmMessage('BGMを停止しました');
      return;
    }

    try {
      setBgmMessage('BGMファイルを確認中です...');
      const mp3Response = await fetch('/sounds/bgm.mp3');
      const mp3ContentType = mp3Response.headers.get('content-type') ?? '不明';
      const probeAudio = new Audio();
      const mp3Support = probeAudio.canPlayType('audio/mpeg') || 'no';
      const mp3Warning =
        mp3Response.ok && !mp3ContentType.includes('audio/mpeg')
          ? '警告: content-type が audio/mpeg ではありません'
          : '';

      console.log('audio.canPlayType("audio/mpeg"):', mp3Support);
      console.log('/sounds/bgm.mp3 fetch:', {
        status: mp3Response.status,
        contentType: mp3ContentType,
      });

      const debugLines = [
        `mp3 status: ${mp3Response.status}`,
        `mp3 content-type: ${mp3ContentType}`,
        `mp3 canPlayType: ${mp3Support}`,
        mp3Warning,
      ].filter(Boolean);
      const playErrors: string[] = [];

      if (!mp3Response.ok) {
        playErrors.push(`/sounds/bgm.mp3: fetch status ${mp3Response.status}`);
      }

      for (const bgmFile of bgmFiles) {
        if (bgmFile.path === '/sounds/bgm.mp3' && !mp3Response.ok) {
          continue;
        }

        const audio = new Audio(bgmFile.path);
        audio.loop = true;
        audio.volume = 0.2;

        try {
          await audio.play();
          bgmRef.current?.pause();
          bgmRef.current = audio;
          setBgmIsOn(true);
          setBgmMessage([...debugLines, `BGMを再生中です: ${bgmFile.path}`].join(' / '));
          return;
        } catch (playError) {
          const message = playError instanceof Error ? playError.message : String(playError);
          console.error(`BGM再生失敗: ${bgmFile.path}`, playError);
          playErrors.push(`${bgmFile.path}: ${message}`);
        }
      }

      setBgmIsOn(false);
      setBgmMessage([...debugLines, `BGMの再生に失敗しました: ${playErrors.join(' | ')}`].join(' / '));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('BGMの再生に失敗しました:', error);
      setBgmMessage(`BGMの再生に失敗しました: ${message}`);
      setBgmIsOn(false);
    }
  }

  function handleSquareClick(position: string) {
    if (gameIsOver || currentTurn !== 'white') {
      return;
    }

    const clickedPiece = findPieceByPosition(pieces, position);
    const selectedPiece = pieces.find((piece) => piece.id === selectedPieceId);

    if (!selectedPiece) {
      setSelectedPieceId(clickedPiece?.color === currentTurn ? clickedPiece.id : null);
      return;
    }

    if (clickedPiece?.id === selectedPiece.id) {
      setSelectedPieceId(null);
      return;
    }

    if (clickedPiece?.color === selectedPiece.color) {
      setSelectedPieceId(clickedPiece.color === currentTurn ? clickedPiece.id : selectedPieceId);
      return;
    }

    if (!canMakeMove(pieces, selectedPiece, position)) {
      return;
    }

    const nextPieces = getPiecesAfterMove(pieces, selectedPiece.id, position);
    playSound(clickedPiece ? '/sounds/capture.mp3' : '/sounds/move.mp3');
    setPieces(nextPieces);
    setSelectedPieceId(null);
    setSakuyaReaction({
      mood: clickedPiece || isKingInCheck(nextPieces, 'black') ? 'angry' : 'normal',
      line: clickedPiece
        ? pickRandomLine(sakuyaLines.lostPiece)
        : isKingInCheck(nextPieces, 'black')
          ? pickRandomLine(sakuyaLines.gotChecked)
          : pickRandomLine(sakuyaLines.normal),
    });
    setCurrentTurn((turn) => (turn === 'white' ? 'black' : 'white'));
  }

  return (
    <main className="app">
      <section className="gameArea" aria-label="CryptoNinja chess board">
        <div className="titleArea">
          <p className="eyebrow">CryptoNinja Chess</p>
          <h1>忍びの盤</h1>
          <div className="statusRow">
            <p className="turnText">{statusText}</p>
            <button className="bgmButton" type="button" onClick={toggleBgm}>
              BGM {bgmIsOn ? 'OFF' : 'ON'}
            </button>
          </div>
          {bgmMessage ? <p className="bgmMessage">{bgmMessage}</p> : null}
        </div>

        <div className="opponentPanel" aria-label={`${opponentName} opponent`}>
          <div className="opponentPortrait">
            {shouldShowSakuyaImage ? (
              <img
                src={sakuyaImageUrl}
                alt={`${opponentName} ${sakuyaStatus.mood}`}
                onError={() =>
                  setFailedSakuyaImages((failedImages) => ({
                    ...failedImages,
                    [sakuyaStatus.mood]: true,
                  }))
                }
              />
            ) : (
              <span>{opponentName}</span>
            )}
          </div>
          <div className="opponentSpeech">
            <p className="opponentName">{opponentName}</p>
            <p className="opponentLine">{sakuyaStatus.line}</p>
          </div>
        </div>

        <div className="boardFrame">
          <div className="board" role="grid" aria-label="8 by 8 chess board">
            {boardRows.map((_, rowIndex) =>
              boardColumns.map((_, columnIndex) => {
                const isDarkSquare = (rowIndex + columnIndex) % 2 === 1;
                const squareName = `${String.fromCharCode(65 + columnIndex)}${8 - rowIndex}`;
                const piece = findPieceByPosition(pieces, squareName);
                const selectedPiece = pieces.find((currentPiece) => currentPiece.id === selectedPieceId);
                const isSelected = piece?.id === selectedPieceId;
                const isCheckedKing = piece?.type === 'king' && isKingInCheck(pieces, piece.color);
                const isLegalMove = selectedPiece
                  ? getLegalMovesForPiece(pieces, selectedPiece).includes(squareName)
                  : false;
                const squareClassName = [
                  'square',
                  isDarkSquare ? 'darkSquare' : 'lightSquare',
                  isSelected ? 'selectedSquare' : '',
                  isCheckedKing ? 'checkedKingSquare' : '',
                  isLegalMove ? 'legalMoveSquare' : '',
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <button
                    className={squareClassName}
                    type="button"
                    role="gridcell"
                    aria-pressed={isSelected}
                    aria-label={piece ? `${squareName} ${piece.color} ${piece.type}` : squareName}
                    onClick={() => handleSquareClick(squareName)}
                    key={squareName}
                  >
                    <span className="squareName">{squareName}</span>
                    {piece ? (
                      <span
                        className={`piece ${piece.color}Piece`}
                        aria-label={piece.characterName}
                        title={piece.characterName}
                      >
                        {piece.imageUrl ? (
                          <img src={piece.imageUrl} alt={piece.characterName} />
                        ) : (
                          pieceSymbols[piece.color][piece.type]
                        )}
                      </span>
                    ) : (
                      <span className="ninjaMark">{isDarkSquare ? '忍' : '影'}</span>
                    )}
                  </button>
                );
              }),
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
