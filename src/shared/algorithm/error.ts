export class AlgorithmError extends Error {
  constructor(
    public message: string,
    public title: string,
    public description: string,
  ) { super(message) }
}