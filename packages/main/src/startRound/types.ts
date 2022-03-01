export type ConnectionData = {
  CID: string;
  DiceCount: number;
  Player: string;
};

export type DiceData = {
  byConnection: {
    [cid: string]: Array<number>;
  };
  byPlayer: {
    [player: string]: Array<number>;
  };
};
