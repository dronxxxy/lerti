import { ref } from "vue";
export type approx = {
}

export default function useMinSquareMethod() {
    const xvalues = ref<number[]>([0, 0, 0, 0, 0]);
    const xadditionalUs = ref<Record<number, number>>({});
    const xadditionalTs = ref<Record<number, number>>({});

    const yvalues = ref<number[]>([0, 0, 0, 0, 0]);
    const yadditionalUs = ref<Record<number, number>>({});
    const yadditionalTs = ref<Record<number, number>>({});

    return{
        xvalues,
        xadditionalUs,
        xadditionalTs,
        yvalues,
        yadditionalUs,
        yadditionalTs
    }
}