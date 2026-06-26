export type ReelSegment = {
  narration: string;
  b_roll_visual: string;
  b_roll_keyword: string;
};

export type ReelData = {
  title: string;
  facts: string[];
  segments: ReelSegment[];
};
