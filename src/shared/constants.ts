export const MAX_FRACTION_DIGITS = 16
export const SAMPLE_INPUT_WIDTH = 5;

export const buildPdfPath = (page: number, module: string | undefined) =>
  `https://www.physicsleti.ru/labs/Methodichki/1semestr/experiment2020.pdf#page=${page}` +
    (module ? `&search=${module}` : '')