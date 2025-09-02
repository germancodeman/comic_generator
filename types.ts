
export interface CharacterImage {
  file: File;
  base64: string;
  mimeType: string;
}

export interface Character {
  id: string;
  name: string;
  image: CharacterImage | null;
}

export interface Panel {
  id: string;
  description: string;
  imageUrl: string | null;
}

export enum LoadingState {
  IDLE = 'IDLE',
  GENERATING_STORY = 'GENERATING_STORY',
  GENERATING_PANELS = 'GENERATING_PANELS',
  DONE = 'DONE',
  ERROR = 'ERROR',
}
