import type { SavedItem } from './saved';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface GraphNode {
  id: string;
  label: string;
  type: 'news' | 'podcast' | 'clip';
  connections: number;   // how many edges this node has
  // Layout state (mutable)
  x: number;
  y: number;
  vx: number;
  vy: number;
  pinned: boolean;
}

export interface GraphEdge {
  source: string;
  target: string;
  strength: number;      // 0..1
  label: string;         // how they're connected
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// ── Connection scoring ────────────────────────────────────────────────────────

const KEYWORD_STOP_WORDS = new Set([
  'the','a','an','and','or','but','in','on','at','to','for','of','with',
  'by','from','as','is','it','its','this','that','was','are','be','been',
  'has','have','had','not','no','will','would','could','should','may','can',
  'all','each','every','some','any','about','into','over','up','out','off',
  'more','most','than','so','too','very','just','also','only','now',
]);

function keywords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/g)
      .filter((w) => w.length > 2 && !KEYWORD_STOP_WORDS.has(w)),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const item of a) if (b.has(item)) intersection++;
  const union = new Set([...a, ...b]);
  return intersection / union.size;
}

/**
 * Build a graph from saved items by computing connections based on:
 * - Shared glossary terms
 * - Overlapping takeaways/language keywords
 * - Same content type + source
 *
 * Returns nodes and edges ready for the force-directed layout to consume.
 */
export function buildGraph(items: SavedItem[]): GraphData {
  if (items.length === 0) return { nodes: [], edges: [] };

  // Build node index
  const nodeMap = new Map<string, GraphNode>();
  for (const item of items) {
    nodeMap.set(item.id, {
      id: item.id,
      label: item.title,
      type: item.type,
      connections: 0,
      x: 0, y: 0, vx: 0, vy: 0, pinned: false,
    });
  }

  const edgeMap = new Map<string, GraphEdge>();

  function addEdge(source: string, target: string, strength: number, label: string) {
    const key = source < target ? `${source}::${target}` : `${target}::${source}`;
    const existing = edgeMap.get(key);
    if (existing) {
      // Accumulate strength from different connection types
      existing.strength = Math.min(1, existing.strength + strength);
      if (!existing.label.includes(label)) existing.label += ', ' + label;
    } else {
      edgeMap.set(key, { source, target, strength, label });
    }
  }

  const ids = items.map((i) => i.id);

  // Compare every pair
  for (let i = 0; i < items.length; i++) {
    const a = items[i]!;

    for (let j = i + 1; j < items.length; j++) {
      const b = items[j]!;
      let totalStrength = 0;
      const reasons: string[] = [];

      // ── 1. Shared glossary terms ──
      if (a.glossary.length > 0 && b.glossary.length > 0) {
        const aTerms = new Set(a.glossary.map((g) => g.split(':')[0]!.trim().toLowerCase()));
        const bTerms = new Set(b.glossary.map((g) => g.split(':')[0]!.trim().toLowerCase()));
        const overlap = [...aTerms].filter((t) => bTerms.has(t));
        if (overlap.length > 0) {
          totalStrength += Math.min(0.5, overlap.length * 0.15);
          reasons.push(`${overlap.length} shared term${overlap.length > 1 ? 's' : ''}`);
        }
      }

      // ── 2. Shared key takeaways keywords ──
      const aKws = keywords(a.keyTakeaways.join(' '));
      const bKws = keywords(b.keyTakeaways.join(' '));
      const kwSim = jaccard(aKws, bKws);
      if (kwSim > 0.12) {
        totalStrength += kwSim * 0.6;
        reasons.push('related ideas');
      }

      // ── 3. Same type + strength based on shared source ──
      if (a.type === b.type) {
        totalStrength += 0.1;
        if (a.source === b.source) {
          totalStrength += 0.2;
          reasons.push('same source');
        } else {
          reasons.push('same type');
        }
      }

      // ── 4. Shared howItMattersToYou keywords ──
      if (a.howItMattersToYou && b.howItMattersToYou) {
        const edgeAws = keywords(a.howItMattersToYou);
        const edgeBws = keywords(b.howItMattersToYou);
        const edgeSim = jaccard(edgeAws, edgeBws);
        if (edgeSim > 0.1) totalStrength += edgeSim * 0.4;
      }

      // Only create edge if above threshold
      if (totalStrength >= 0.18) {
        const label = reasons.length > 0 ? reasons.join(', ') : 'connected';
        addEdge(a.id, b.id, Math.min(1, totalStrength), label);
      }
    }
  }

  // Update connection counts
  const nodes = [...nodeMap.values()];
  for (const edge of edgeMap.values()) {
    const s = nodeMap.get(edge.source);
    const t = nodeMap.get(edge.target);
    if (s) s.connections++;
    if (t) t.connections++;
  }

  return {
    nodes,
    edges: [...edgeMap.values()],
  };
}
