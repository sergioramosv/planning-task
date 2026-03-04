import { NextResponse } from 'next/server';
import { writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

function getMemoryPath() {
  return process.env.KOMODO_MEMORY_PATH || resolve(process.cwd(), '..', 'memory', 'patterns.json');
}

export async function DELETE() {
  try {
    const patternsFile = getMemoryPath();
    if (!existsSync(patternsFile)) {
      return NextResponse.json({ cleared: true, message: 'No patterns file found' });
    }

    const emptyStore = { patterns: [], reviewOutcomes: [] };
    writeFileSync(patternsFile, JSON.stringify(emptyStore, null, 2), 'utf-8');

    return NextResponse.json({ cleared: true, message: 'Memory cleared successfully' });
  } catch (err) {
    return NextResponse.json(
      { cleared: false, message: `Failed to clear memory: ${(err as Error).message}` },
      { status: 500 },
    );
  }
}
