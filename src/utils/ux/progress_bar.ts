import { MultiBar, Presets } from 'cli-progress';

export const progress_bar = new MultiBar(
  {
    clearOnComplete: false,
    hideCursor: true,
    format: ' {bar} | {filename} | {value}/{total}'
  },
  Presets.shades_grey
);
