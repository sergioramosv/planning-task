import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

function getMemoryPath() {
  return process.env.KOMODO_MEMORY_PATH || resolve(process.cwd(), '..', 'memory', 'patterns.json');
}

export async function GET() {
  try {
    const patternsFile = getMemoryPath();
    if (!existsSync(patternsFile)) {
      return NextResponse.json({ patterns: [], reviewOutcomes: [] });
    }

    const raw = readFileSync(patternsFile, 'utf-8');
    const data = JSON.parse(raw);

    return NextResponse.json({
      patterns: Array.isArray(data.patterns) ? data.patterns : [],
      reviewOutcomes: Array.isArray(data.reviewOutcomes) ? data.reviewOutcomes : [],
    });
  } catch {
    return NextResponse.json({ patterns: [], reviewOutcomes: [] });
  }
}
