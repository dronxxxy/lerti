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
                if ((i==0)||(xDec[i-1]!<Decimal(0))||(i>0 && xDec[i]!=Decimal(0))){
                sumX = sumX.plus(xDec[i]!);
                sumY = sumY.plus(yDec[i]!);
                sumXY = sumXY.plus(xDec[i]!.times(yDec[i]!));
                sumX2 = sumX2.plus(xDec[i]!.times(xDec[i]!));
                }
            }
            
            const denominator = n.times(sumX2).minus(sumX.times(sumX));


            if (denominator.equals(0)) {//Доделать условие игнорирования посчёта по x 
                result.value = {
                    k:Decimal(0),
                    b:Decimal(0),
                    Squared: Decimal(0),
                    er:true
                }
                return result;
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
            
            const Squared = new Decimal(1).minus(sumResiduals.dividedBy(sumTotal));

            const approxResult: ApproxResult = {
                k: k,
                b: b,
                Squared: Squared,
                er: false
            }
            result.value = approxResult;
            return result.value
        }
        return null;
    }

    const calculateFromRefs = () => {
        return approximate(xValues.value, yValues.value, "linear");
    }

    return {
        xValues,
        xadditionalUs,
        xadditionalTs,
        yValues,
        yadditionalUs,
        yadditionalTs,
        result,
        approximate,
        calculateFromRefs
    }
}