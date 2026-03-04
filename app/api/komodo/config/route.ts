import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import type { KomodoConfig } from '@/lib/komodo/config-types';
import { DEFAULT_CONFIG } from '@/lib/komodo/config-types';

const CONFIG_PATH = '/komodoConfig';

export async function GET() {
  try {
    const snapshot = await adminDb.ref(CONFIG_PATH).once('value');
    const saved = snapshot.val() as Partial<KomodoConfig> | null;

    if (!saved) {
      return NextResponse.json(DEFAULT_CONFIG);
    }

    const config: KomodoConfig = {
      ...DEFAULT_CONFIG,
      ...saved,
      agents: {
        planner: { ...DEFAULT_CONFIG.agents.planner, ...saved.agents?.planner },
        coder: { ...DEFAULT_CONFIG.agents.coder, ...saved.agents?.coder },
        reviewer: { ...DEFAULT_CONFIG.agents.reviewer, ...saved.agents?.reviewer },
      },
    };

    return NextResponse.json(config);
  } catch {
    return NextResponse.json(DEFAULT_CONFIG);
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as KomodoConfig;

    if (body.maxReviewCycles < 1 || body.maxReviewCycles > 10) {
      return NextResponse.json(
        { error: 'maxReviewCycles must be between 1 and 10' },
        { status: 400 },
      );
    }

    const validModels = ['sonnet', 'opus', 'haiku'];
    for (const agent of ['planner', 'coder', 'reviewer'] as const) {
      if (!validModels.includes(body.agents[agent].model)) {
        return NextResponse.json(
          { error: `Invalid model for ${agent}: ${body.agents[agent].model}` },
          { status: 400 },
        );
      }
      if (body.agents[agent].maxTurns < 1 || body.agents[agent].maxTurns > 100) {
        return NextResponse.json(
          { error: `maxTurns for ${agent} must be between 1 and 100` },
          { status: 400 },
        );
      }
    }

    await adminDb.ref(CONFIG_PATH).set(body);

    return NextResponse.json({ saved: true, config: body });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
