import { ref } from "vue";
import Decimal from "decimal.js";

export type ApproxResult = {
    k: Decimal, 
    b: Decimal, 
    Squared: Decimal,
    er: boolean
}

const isunic = (a: Decimal[], b: Decimal)=>{
    let c: number= 0;
    for (let i = 0; i < a.length; i++){
        if(a[i]===b){
            c+=1;
        }
    }
    if(c===0){
        return true;
    }
    else{
        return false;
    }
}

const unicArr = (a: Decimal[])=>{
    for(let i = 0; i < a.length; i++){
        if (isunic(a, a[i]!)===false){
            return false
        }
    }
    return true
}

export default function useMinSquareMethod() {
    const xValues = ref<number[]>([0,0,0,0,0]);
    const xadditionalUs = ref<Record<number, number>>({});
    const xadditionalTs = ref<Record<number, number>>({});

    const yValues = ref<number[]>([0,0,0,0,0]);
    const yadditionalUs = ref<Record<number, number>>({});
    const yadditionalTs = ref<Record<number, number>>({});
    const result = ref<ApproxResult | null>(null)

    const approximate = (xArr: number[], yArr: number[], type?: string) => {
    if (type === "linear") {
        const n = new Decimal(xArr.length);
        
        const xDec = xArr.map(x => new Decimal(x));
        const yDec = yArr.map(y => new Decimal(y));
        
        let sumX = new Decimal(0), sumY = new Decimal(0), sumXY = new Decimal(0), sumX2 = new Decimal(0);
        
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
                er: true
            }
            return result;
        }

        const k = n.times(sumXY).minus(sumX.times(sumY)).dividedBy(denominator);
        const b = sumY.minus(k.times(sumX)).dividedBy(n);

        // Вычисление R²
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
        
        const Squared = new Decimal(1).minus(sumResiduals.dividedBy(sumTotal));

        result.value = {
            k: k,
            b: b,
            Squared: Squared,
            er: false
        }
        return result.value;
    }
    
    if (type === "exponential") {
        
        const n = new Decimal(xArr.length);
        
        const xDec = xArr.map(x => new Decimal(x));
        
        // Проверка: все y должны быть положительными для логарифма
        for (let i = 0; i < yArr.length; i++) {
            if (yArr[i]! <= 0) {
                result.value = {
                    k: new Decimal(0),
                    b: new Decimal(0),
                    Squared: new Decimal(0),
                    er: true
                }
                return result;
            }
        }
        
        const yTransformed = yArr.map(y => Math.log(y));
        const yDecTransformed = yTransformed.map(y => new Decimal(y));
        
        let sumX = new Decimal(0), sumY = new Decimal(0), sumXY = new Decimal(0), sumX2 = new Decimal(0);
        
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
                er: true
            }
            return result;
        }

        const k = n.times(sumXY).minus(sumX.times(sumY)).dividedBy(denominator);
        const b_lin = sumY.minus(k.times(sumX)).dividedBy(n);
        
        const a = Decimal.exp(b_lin);
        
        // Вычисление R²
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
        
        const Squared = new Decimal(1).minus(sumResiduals.dividedBy(sumTotal));

        result.value = {
            k: k,
            b: a,
            Squared: Squared,
            er: false
        }
        return result.value;
    }
    
    return null;
}


    return {
        xValues,
        xadditionalUs,
        xadditionalTs,
        yValues,
        yadditionalUs,
        yadditionalTs,
        result,
        approximate
    }
}