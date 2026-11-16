export type FloorId = "ground" | "first";

export type Vec = { x: number; y: number };

export type Booth = {
  id: string;
  sponsor: string;
  category: string;
  tagline: string;
  offer: string;
  color: string;
  x: number;
  y: number;
  w: number;
  h: number;
  image?: string;
  link?: string;
  kicker?: string;
  featured?: boolean;
};

export type ZoneTone = "stage" | "sponsor" | "food" | "lounge" | "market" | "build" | "entry";

export type Zone = {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  tone: ZoneTone;
};

export type PropKind = "plant" | "pillar" | "sofa" | "table" | "bar" | "desk" | "bench";

export type Prop = {
  id: string;
  kind: PropKind;
  x: number;
  y: number;
  w: number;
  h: number;
  solid?: boolean;
};

export type Stage = {
  id: string;
  room: string;
  session: string;
  speaker: string;
  time: string;
  x: number;
  y: number;
  w: number;
  h: number;
  tone: "purple" | "green";
};

export type Stair = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  to: FloorId;
  spawn: Vec;
  label: string;
  direction: "up" | "down";
};

export type Terminal = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  subtitle: string;
};

export type Secret = {
  id: string;
  x: number;
  y: number;
  label: string;
};

export type Floor = {
  id: FloorId;
  name: string;
  subtitle: string;
  width: number;
  height: number;
  spawn: Vec;
  zones: Zone[];
  booths: Booth[];
  props: Prop[];
  stages: Stage[];
  stairs: Stair[];
  terminals: Terminal[];
  secret?: Secret;
};

export type SpotKind = "booth" | "stage" | "stairs" | "terminal" | "secret";

export type Spot = {
  id: string;
  kind: SpotKind;
  label: string;
  hint: string;
  x: number;
  y: number;
  radius: number;
  booth?: Booth;
  stage?: Stage;
  stair?: Stair;
  terminal?: Terminal;
  secret?: Secret;
};
