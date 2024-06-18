const ansiColors = [
  "\x1b[38;2;107;255;37m", // #6bff25
  "\x1b[38;2;103;230;46m",
  "\x1b[38;2;99;205;55m",
  "\x1b[38;2;95;180;64m",
  "\x1b[38;2;91;155;73m",
  "\x1b[38;2;87;130;82m",
  "\x1b[38;2;83;105;91m",
  "\x1b[38;2;79;80;100m",
  "\x1b[38;2;75;55;109m",
  "\x1b[38;2;71;30;118m",
  "\x1b[38;2;67;5;127m", // #43057f
  "\x1b[38;2;65;0;140m",
  "\x1b[38;2;68;0;153m",
  "\x1b[38;2;71;0;166m",
  "\x1b[38;2;74;0;179m",
  "\x1b[38;2;77;0;192m",
  "\x1b[38;2;80;0;205m",
  "\x1b[38;2;83;0;218m",
  "\x1b[38;2;86;0;231m",
  "\x1b[38;2;89;0;244m",
  "\x1b[38;2;19;102;234m", // #1366ea
];
const reset = "\x1b[0m";

export const gradientText = (text: string) => {
  const length = text.length;
  const step = Math.floor(ansiColors.length / length);
  let coloredText = "";
  for (let i = 0; i < length; i++) {
    coloredText += ansiColors[i * step]! + text[i];
  }
  return coloredText + reset;
};
