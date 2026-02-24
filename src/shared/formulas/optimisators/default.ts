import { ComplexOptimisator } from "../optimisator";
import { AddCompressOptimisator, MultiplyCompressOptimisator } from "./compress";
import { MultiplyUnaryOptimisator } from "./multiplyUnary";
import { PowUnaryOptimisator } from "./powUnary";

export const DefaultOptimisator = new ComplexOptimisator([
  new PowUnaryOptimisator(),
  new MultiplyUnaryOptimisator(),
  new AddCompressOptimisator(),
  new MultiplyCompressOptimisator(),
])