// src/components/calculator/hooks/useDictionary.ts
import { useQuery } from "@tanstack/react-query";
import type { DictionaryRow, DictionarySchema, PageableRs } from "../../../api/types";
import { getDictionary, getDictionaryRowsByDictId } from "../../../api";

export function useDictionary(dictId: string) {
  const schemaQ = useQuery<DictionarySchema>({
    queryKey: ["dict-schema", dictId],
    queryFn: ({ signal }) => getDictionary(dictId, signal), // ✅ только dictionary-schema через getDictionary
    enabled: !!dictId,
  });

  const rowsQ = useQuery<PageableRs<DictionaryRow>>({
    queryKey: ["dict-rows", dictId],
    queryFn: ({ signal }) => getDictionaryRowsByDictId(dictId, { page: 1, size: 200 }, signal),
    enabled: !!dictId,
  });

  return {
    schema: schemaQ.data,
    rows: rowsQ.data?.data ?? [],
    isLoading: schemaQ.isLoading || rowsQ.isLoading,
    error: schemaQ.error ?? rowsQ.error,
  };
}
