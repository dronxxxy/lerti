import { VarTable, type VarInfo } from "@/shared/math/indirectError"
import Decimal from "decimal.js"
import { computed, reactive, ref, watch } from "vue"

export default function useVarTableInput() {
  const variables = reactive<VarInfo[]>([])
  const length = ref<number>(1)

  const stretchSample = (array: Decimal[], length: number): Decimal[] => {
    if (array.length > length) {
      array.length = length;
      return array;
    }
    while (array.length < length)
      array.push(new Decimal(0));

    return array
  }

  const setLength = (newLength: number) => {
    if (newLength < 1) newLength = 1;
    newLength = Math.round(newLength);

    if (length.value == newLength) return;
    length.value = newLength;
    
    for (const varInfo of variables)
      stretchSample(varInfo.values, newLength)
  }

  const applyNames = (names: Set<string>) => {
    const result: VarInfo[] = [];
    for (const varInfo of variables)
      if (names.has(varInfo.name))
        result.push(varInfo);

    for (const name of names)
      if (!variables.some((varInfo) => varInfo.name === name))
        result.push({
          name,
          error: new Decimal(0),
          values: stretchSample([], length.value)
        })
    
    variables.length = 0;
    for (const varInfo of result)
      variables.push(varInfo)
  }

  return {
    length: computed(() => length.value),
    setLength,
    variables,
    applyNames,
    build: () => new VarTable(length.value, variables)
  }
}