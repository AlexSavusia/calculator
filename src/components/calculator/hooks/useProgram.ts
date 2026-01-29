// src/components/calculator/hooks/useProgram.ts
import { useQuery } from "@tanstack/react-query";
import type { Program } from "../../../api/types";
import { getProgramById } from "../../../api";

export function useProgram(programId: string) {
  return useQuery<Program>({
    queryKey: ["program", programId],
    queryFn: ({ signal }) => getProgramById(programId, signal),
  });
}
