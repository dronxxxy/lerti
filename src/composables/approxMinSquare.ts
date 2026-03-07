import { ref } from "vue";
import Decimal from "decimal.js";

export type ApproxResult = {
    k: Decimal, 
    b: Decimal, 
    Squared: Decimal,
    er: number
}

export type ApproximationType = "linear" | "exponential" | "hyperbolic";

export default function useMinSquareMethod() {
    const xValues = ref<number[]>([0, 0, 0, 0, 0]);
    const xadditionalUs = ref<Record<number, number>>({});
    const xadditionalTs = ref<Record<number, number>>({});

    const yValues = ref<number[]>([0, 0, 0, 0, 0]);
    const yadditionalUs = ref<Record<number, number>>({});
    const yadditionalTs = ref<Record<number, number>>({});
    const result = ref<ApproxResult | null>(null);

    const approximate = (xArr: number[], yArr: number[], type?: ApproximationType): ApproxResult | null => {
        if (xArr.length === 0 || yArr.length === 0 || xArr.length !== yArr.length) {
            result.value = {
                k: new Decimal(0),
                b: new Decimal(0),
                Squared: new Decimal(0),
                er: 3
            };
            return result.value;
        }

        if (type === "linear") {
            const n = new Decimal(xArr.length);
            
            const xDec = xArr.map(x => new Decimal(x));
            const yDec = yArr.map(y => new Decimal(y));
            
            let sumX = new Decimal(0);
            let sumY = new Decimal(0);
            let sumXY = new Decimal(0);
            let sumX2 = new Decimal(0);
            
            for (let i = 0; i < xArr.length; i++) {
                sumX = sumX.plus(xDec[i]!);
                sumY = sumY.plus(yDec[i]!);
                sumXY = sumXY.plus(xDec[i]!.times(yDec[i]!));
                sumX2 = sumX2.plus(xDec[i]!.times(xDec[i]!));
            }
            
            const denominator = n.times(sumX2).minus(sumX.times(sumX));

            if (denominator.equals(0)) {
                result.value = {
                    k: new Decimal(0),
                    b: new Decimal(0),
                    Squared: new Decimal(0),
                    er: 1
                };
                return result.value;
            }

            const k = n.times(sumXY).minus(sumX.times(sumY)).dividedBy(denominator);
            const b = sumY.minus(k.times(sumX)).dividedBy(n);

            let sumResiduals = new Decimal(0);
            let sumTotal = new Decimal(0);
            const meanY = sumY.dividedBy(n);
            
            for (let i = 0; i < xArr.length; i++) {
                const yPredicted = k.times(xDec[i]!).plus(b);
                const residual = yDec[i]!.minus(yPredicted);
                sumResiduals = sumResiduals.plus(residual.times(residual));
                
                const totalDiff = yDec[i]!.minus(meanY);
                sumTotal = sumTotal.plus(totalDiff.times(totalDiff));
            }
            
            let Squared: Decimal;
            if (sumTotal.equals(0)) {
                Squared = new Decimal(1);
            } else {
                Squared = new Decimal(1).minus(sumResiduals.dividedBy(sumTotal));
            }

            result.value = {
                k,
                b,
                Squared,
                er: 0
            };
            return result.value;
        }
        
        if (type === "exponential") {
            const n = new Decimal(xArr.length);
            
            const xDec = xArr.map(x => new Decimal(x));
            
            for (let i = 0; i < yArr.length; i++) {
                if (yArr[i]! <= 0) {
                    result.value = {
                        k: new Decimal(0),
                        b: new Decimal(0),
                        Squared: new Decimal(0),
                        er: 2
                    };
                    return result.value;
                }
            }
            
            const yTransformed = yArr.map(y => Math.log(y));
            const yDecTransformed = yTransformed.map(y => new Decimal(y));
            
            let sumX = new Decimal(0);
            let sumY = new Decimal(0);
            let sumXY = new Decimal(0);
            let sumX2 = new Decimal(0);
            
            for (let i = 0; i < xArr.length; i++) {
                sumX = sumX.plus(xDec[i]!);
                sumY = sumY.plus(yDecTransformed[i]!);
                sumXY = sumXY.plus(xDec[i]!.times(yDecTransformed[i]!));
                sumX2 = sumX2.plus(xDec[i]!.times(xDec[i]!));
            }
            
            const denominator = n.times(sumX2).minus(sumX.times(sumX));

            if (denominator.equals(0)) {
                result.value = {
                    k: new Decimal(0),
                    b: new Decimal(0),
                    Squared: new Decimal(0),
                    er: 1
                };
                return result.value;
            }

            const k = n.times(sumXY).minus(sumX.times(sumY)).dividedBy(denominator);
            const b_lin = sumY.minus(k.times(sumX)).dividedBy(n);
            
            const a = Decimal.exp(b_lin);
            
            let sumResiduals = new Decimal(0);
            let sumTotal = new Decimal(0);
            
            const yDec = yArr.map(y => new Decimal(y));
            let sumY_original = new Decimal(0);
            for (let i = 0; i < yArr.length; i++) {
                sumY_original = sumY_original.plus(yDec[i]!);
            }
            const meanY_original = sumY_original.dividedBy(n);
            
            for (let i = 0; i < xArr.length; i++) {
                const exponent = k.times(xDec[i]!);
                const yPredicted = a.times(Decimal.exp(exponent));
                
                const residual = yDec[i]!.minus(yPredicted);
                sumResiduals = sumResiduals.plus(residual.times(residual));
                
                const totalDiff = yDec[i]!.minus(meanY_original);
                sumTotal = sumTotal.plus(totalDiff.times(totalDiff));
            }
            
            let Squared: Decimal;
            if (sumTotal.equals(0)) {
                Squared = new Decimal(1);
            } else {
                Squared = new Decimal(1).minus(sumResiduals.dividedBy(sumTotal));
            }

            result.value = {
                k,
                b: a,
                Squared,
                er: 0
            };
            return result.value;
        }
        
        if (type === "hyperbolic") {
            const n = new Decimal(xArr.length);
            
            const xDec = xArr.map(x => new Decimal(x));
            const yDec = yArr.map(y => new Decimal(y));
            
            let sumXInv = new Decimal(0);
            let sumY = new Decimal(0);
            let sumXInvY = new Decimal(0);
            let sumXInv2 = new Decimal(0);
            
            for (let i = 0; i < xArr.length; i++) {
                if (xDec[i]!.equals(0)) {
                    result.value = {
                        k: new Decimal(0),
                        b: new Decimal(0),
                        Squared: new Decimal(0),
                        er: 4
                    };
                    return result.value;
                }
                
                const xInv = new Decimal(1).dividedBy(xDec[i]!);
                sumXInv = sumXInv.plus(xInv);
                sumY = sumY.plus(yDec[i]!);
                sumXInvY = sumXInvY.plus(xInv.times(yDec[i]!));
                sumXInv2 = sumXInv2.plus(xInv.times(xInv));
            }
            
            const denominator = n.times(sumXInv2).minus(sumXInv.times(sumXInv));

            if (denominator.equals(0)) {
                result.value = {
                    k: new Decimal(0),
                    b: new Decimal(0),
                    Squared: new Decimal(0),
                    er: 1
                };
                return result.value;
            }

            const k = n.times(sumXInvY).minus(sumXInv.times(sumY)).dividedBy(denominator);
            const b = sumY.minus(k.times(sumXInv)).dividedBy(n);

            let sumResiduals = new Decimal(0);
            let sumTotal = new Decimal(0);
            const meanY = sumY.dividedBy(n);
            
            for (let i = 0; i < xArr.length; i++) {
                const xInv = new Decimal(1).dividedBy(xDec[i]!);
                const yPredicted = k.times(xInv).plus(b);
                const residual = yDec[i]!.minus(yPredicted);
                sumResiduals = sumResiduals.plus(residual.times(residual));
                
                const totalDiff = yDec[i]!.minus(meanY);
                sumTotal = sumTotal.plus(totalDiff.times(totalDiff));
            }
            
            let Squared: Decimal;
            if (sumTotal.equals(0)) {
                Squared = new Decimal(1);
            } else {
                Squared = new Decimal(1).minus(sumResiduals.dividedBy(sumTotal));
            }

            result.value = {
                k,
                b,
                Squared,
                er: 0
            };
            return result.value;
        }
        
        return null;
    };

    return {
        xValues,
        xadditionalUs,
        xadditionalTs,
        yValues,
        yadditionalUs,
        yadditionalTs,
        result,
        approximate
    };
}