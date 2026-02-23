import { ref } from "vue";
export type approx = {
}

export default function useMinSquareMethod() {
    const xValues = ref<number[]>([0, 0, 0, 0, 0]);
    const xadditionalUs = ref<Record<number, number>>({});
    const xadditionalTs = ref<Record<number, number>>({});

    const yValues = ref<number[]>([0, 0, 0, 0, 0]);
    const yadditionalUs = ref<Record<number, number>>({});
    const yadditionalTs = ref<Record<number, number>>({});
    const result = ref<{a: number, b: number, rSquared: number} | null>(null)

    const approximate = () => {
    }

    return{
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