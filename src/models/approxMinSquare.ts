import { ref } from "vue";
export type approx = {
}

export default function useMinSquareMethod() {
    const values = ref<number[]>([0, 0, 0, 0, 0]);
    const additionalUs = ref<Record<number, number>>({});
    const additionalTs = ref<Record<number, number>>({});

    return{
        values,
        additionalUs,
        additionalTs
    }
}