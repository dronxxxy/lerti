import { ComplexOptimisator } from "../optimisator";
import { AddCompressOptimisator, MultiplyCompressOptimisator } from "./compress";
import { ConstantPropagationOptimisator } from "./constantPropagation";
import { MultiplyOneOptimisator } from "./multiplyOne";
import { MultiplyUnaryOptimisator } from "./multiplyUnary";
import { PowUnaryOptimisator } from "./powUnary";

export const DefaultOptimisator = new ComplexOptimisator([
  new ConstantPropagationOptimisator(),
  new PowUnaryOptimisator(),
  new MultiplyOneOptimisator(),
  new MultiplyUnaryOptimisator(),
  new AddCompressOptimisator(),
  new MultiplyCompressOptimisator(),
])