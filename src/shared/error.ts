export class AlgorithmError extends Error {
  constructor(
    public message: string,
    public title: string,
    public description: string,
  ) { super(message) }
}

export class UnknownError extends AlgorithmError {
  constructor(error: any) {
    if (error instanceof Error) {
      error = error.message;
    }

    super(error.message,
      "Неизвестная ошибка",
      `В ходе расчетов возникла непредвиденная ошибка! Сообщите о ней разработчику: "${error}"`
    )
  }
}

export function catchAlgorithmError(process: () => void): AlgorithmError | null {
  try {
    process()
  } catch (e) {
    if (e instanceof AlgorithmError) {
      return e;      
    } else {
      return new UnknownError(e)
    }
  }
  return null;
}