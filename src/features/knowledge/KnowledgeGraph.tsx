import { useEffect, useRef, useCallback, useState } from 'react';
import type { GraphData, GraphNode, GraphEdge } from '../../lib/graph';

interface Props {
  data: GraphData;
  onSelect: (nodeId: string) => void;
  activeId?: string;
}

// ── Color mapping ───────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  news:    '#00c2cb',
  podcast: '#45d483',
  clip:    '#f2b441',
};

const TYPE_NAMES: Record<string, string> = {
  news:    'N',
  podcast: 'P',
  clip:    'C',
};

// ── Force constants ─────────────────────────────────────────────────────────

const REPULSION     = 8000;
const ATTRACTION    = 0.004;
const DAMPING       = 0.85;
const MIN_VELOCITY  = 0.3;
const MAX_VELOCITY  = 30;
const RADIUS_BASE   = 22;
const RADIUS_PER_CONN = 4;
const MAX_RADIUS    = 44;

function nodeRadius(n: GraphNode): number {
  return Math.min(MAX_RADIUS, RADIUS_BASE + n.connections * RADIUS_PER_CONN);
}

// ── Initial layout: circle ─────────────────────────────────────────────────

function initPositions(nodes: GraphNode[], width: number, height: number) {
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(cx, cy) * 0.6;
  nodes.forEach((n, i) => {
    const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
    n.x = cx + r * Math.cos(angle) + (Math.random() - 0.5) * 40;
    n.y = cy + r * Math.sin(angle) + (Math.random() - 0.5) * 40;
    n.vx = 0;
    n.vy = 0;
  });
}

// ── Hit test ────────────────────────────────────────────────────────────────

function hitTest(x: number, y: number, nodes: GraphNode[]): GraphNode | null {
  for (let i = nodes.length - 1; i >= 0; i--) {
    const n = nodes[i]!;
    const dx = x - n.x;
    const dy = y - n.y;
    const r = nodeRadius(n);
    if (dx * dx + dy * dy <= r * r) return n;
  }
  return null;
}

// ── Clamp helper ────────────────────────────────────────────────────────────

function clamp(v: number, max: number): number {
  if (v > max) return max;
  if (v < -max) return -max;
  return v;
}

// ── Component ───────────────────────────────────────────────────────────────

export function KnowledgeGraph({ data, onSelect, activeId }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const dragRef   = useRef<{ node: GraphNode | null; ox: number; oy: number; moved: boolean }>({ node: null, ox: 0, oy: 0, moved: false });
  const panRef    = useRef<{ active: boolean; sx: number; sy: number; ox: number; oy: number }>({ active: false, sx: 0, sy: 0, ox: 0, oy: 0 });
  const offsetRef = useRef({ x: 0, y: 0 });
  const scaleRef  = useRef(1);
  const sizeRef   = useRef({ w: 400, h: 500 });
  const [ready, setReady] = useState(false);

  // ── Initialize canvas + physics ──────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function setup() {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width || 400;
      const h = Math.max(300, rect.height || 500);
      sizeRef.current = { w, h };
      canvas.width = w * devicePixelRatio;
      canvas.height = h * devicePixelRatio;

      if (data.nodes.length > 0) {
        initPositions(data.nodes, w, h);
      }
      setReady(true);
    }

    requestAnimationFrame(setup);
  }, [data]);

  // ── Physics + render loop ────────────────────────────────────────────────
  useEffect(() => {
    if (!ready) return;
    const { nodes, edges } = data;

    function tick() {
      const { w, h } = sizeRef.current;

      // Forces
      for (const n of nodes) {
        if (n.pinned) continue;

        // Repulsion from other nodes
        for (const o of nodes) {
          if (o === n) continue;
          const dx = n.x - o.x;
          const dy = n.y - o.y;
          const dist = Math.max(10, Math.sqrt(dx * dx + dy * dy));
          const force = REPULSION / (dist * dist);
          n.vx += (dx / dist) * force;
          n.vy += (dy / dist) * force;
        }

        // Wall forces
        const margin = 40;
        const wForce = 200;
        if (n.x < margin) n.vx += wForce * (1 - n.x / margin);
        if (n.x > w - margin) n.vx -= wForce * (1 - (w - n.x) / margin);
        if (n.y < margin) n.vy += wForce * (1 - n.y / margin);
        if (n.y > h - margin) n.vy -= wForce * (1 - (h - n.y) / margin);
      }

      // Spring attraction along edges
      for (const edge of edges) {
        const s = nodes.find((n) => n.id === edge.source);
        const t = nodes.find((n) => n.id === edge.target);
        if (!s || !t) continue;
        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const dist = Math.max(10, Math.sqrt(dx * dx + dy * dy));
        const force = ATTRACTION * edge.strength * dist;
        if (!s.pinned) { s.vx += (dx / dist) * force; s.vy += (dy / dist) * force; }
        if (!t.pinned) { t.vx -= (dx / dist) * force; t.vy -= (dy / dist) * force; }
      }

      // Integrate with velocity clamp
      for (const n of nodes) {
        if (n.pinned) continue;
        n.vx = clamp(n.vx * DAMPING, MAX_VELOCITY);
        n.vy = clamp(n.vy * DAMPING, MAX_VELOCITY);
        if (Math.abs(n.vx) < MIN_VELOCITY && Math.abs(n.vy) < MIN_VELOCITY) {
          n.vx = 0; n.vy = 0;
        }
        n.x += n.vx;
        n.y += n.vy;
      }

      render(nodes, edges);
      animRef.current = requestAnimationFrame(tick);
    }

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [data, ready]);

  // ── Render ──────────────────────────────────────────────────────────────
  function render(nodes: GraphNode[], edges: GraphEdge[]) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = devicePixelRatio;
    const { w, h } = sizeRef.current;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const ox = offsetRef.current.x;
    const oy = offsetRef.current.y;
    const sc = scaleRef.current;

    ctx.save();
    ctx.translate(ox, oy);
    ctx.scale(sc, sc);

    // Edges
    for (const edge of edges) {
      const s = nodes.find((n) => n.id === edge.source);
      const t = nodes.find((n) => n.id === edge.target);
      if (!s || !t) continue;

      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(t.x, t.y);
      ctx.strokeStyle = `rgba(90, 99, 120, ${0.15 + edge.strength * 0.35})`;
      ctx.lineWidth = 0.5 + edge.strength * 2;
      ctx.stroke();
    }

    // Nodes
    for (const n of nodes) {
      const r = nodeRadius(n);
      const isActive = n.id === activeId;

      // Glow for active
      if (isActive) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, r + 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 194, 203, 0.2)';
        ctx.fill();
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      const color = TYPE_COLORS[n.type] ?? '#5a6378';
      ctx.fillStyle = isActive ? color : color + 'cc';
      ctx.fill();

      // Border
      ctx.strokeStyle = isActive ? '#f7f7f9' : 'rgba(255,255,255,0.12)';
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.stroke();

      // Type letter
      ctx.fillStyle = '#04141a';
      ctx.font = `bold ${Math.min(14, r * 0.65)}px "DM Sans", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(TYPE_NAMES[n.type] ?? '?', n.x, n.y + 1);

      // Label below
      ctx.fillStyle = 'rgba(247, 247, 249, 0.85)';
      ctx.font = `${Math.max(9, r * 0.4)}px "DM Sans", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      const label = n.label.length > 18 ? n.label.slice(0, 16) + '…' : n.label;
      ctx.fillText(label, n.x, n.y + r + 4);

      // Connection count badge
      if (n.connections > 0) {
        const badgeR = 10;
        ctx.beginPath();
        ctx.arc(n.x + r - badgeR, n.y - r + badgeR, badgeR, 0, Math.PI * 2);
        ctx.fillStyle = '#f2b441';
        ctx.fill();
        ctx.fillStyle = '#04141a';
        ctx.font = `bold 9px "DM Sans", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(n.connections), n.x + r - badgeR, n.y - r + badgeR);
      }
    }

    ctx.restore();
  }

  // ── Resize handling ─────────────────────────────────────────────────────
  useEffect(() => {
    function handleResize() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = Math.max(300, rect.height);
      if (w !== sizeRef.current.w || h !== sizeRef.current.h) {
        sizeRef.current = { w, h };
        canvas.width = w * devicePixelRatio;
        canvas.height = h * devicePixelRatio;
      }
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Coordinate helpers ──────────────────────────────────────────────────

  const screenToCanvas = useCallback((clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const sc = scaleRef.current;
    const ox = offsetRef.current.x;
    const oy = offsetRef.current.y;
    return {
      x: (clientX - rect.left - ox) / sc,
      y: (clientY - rect.top - oy) / sc,
    };
  }, []);

  // ── Pointer handlers ────────────────────────────────────────────────────

  const handlePointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0]!.clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]!.clientY : e.clientY;
    const pos = screenToCanvas(clientX, clientY);
    const hit = hitTest(pos.x, pos.y, data.nodes);

    if (hit) {
      // Start dragging a node
      hit.pinned = true;
      dragRef.current = { node: hit, ox: hit.x - pos.x, oy: hit.y - pos.y, moved: false };
      document.body.style.cursor = 'grabbing';
    } else {
      // Start panning
      panRef.current = { active: true, sx: clientX, sy: clientY, ox: offsetRef.current.x, oy: offsetRef.current.y };
      document.body.style.cursor = 'grabbing';
    }
  }, [data.nodes, screenToCanvas]);

  const handlePointerMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0]!.clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]!.clientY : e.clientY;

    // Node drag
    const drag = dragRef.current;
    if (drag.node) {
      const pos = screenToCanvas(clientX, clientY);
      drag.node.x = pos.x + drag.ox;
      drag.node.y = pos.y + drag.oy;
      drag.moved = true;
      return;
    }

    // Pan
    const pan = panRef.current;
    if (pan.active) {
      offsetRef.current.x = pan.ox + (clientX - pan.sx);
      offsetRef.current.y = pan.oy + (clientY - pan.sy);
    }
  }, [screenToCanvas]);

  const handlePointerUp = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const drag = dragRef.current;
    if (drag.node) {
      if (!drag.moved) {
        // Click (no significant drag)
        onSelect(drag.node.id);
      }
      drag.node.pinned = false;
      dragRef.current = { node: null, ox: 0, oy: 0, moved: false };
    }

    panRef.current = { active: false, sx: 0, sy: 0, ox: 0, oy: 0 };
    document.body.style.cursor = '';
  }, [onSelect]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.3, Math.min(3, scaleRef.current * delta));

    // Zoom toward mouse cursor
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      offsetRef.current.x = mx - (mx - offsetRef.current.x) * (newScale / scaleRef.current);
      offsetRef.current.y = my - (my - offsetRef.current.y) * (newScale / scaleRef.current);
    }

    scaleRef.current = newScale;
  }, []);

  // ── Empty state ─────────────────────────────────────────────────────────
  if (data.nodes.length === 0) {
    return (
      <div className="graph-empty">
        <p>Save content from your feed to see your knowledge graph.</p>
      </div>
    );
  }

  return (
    <div className="graph-wrap">
      <canvas
        ref={canvasRef}
        className="graph-canvas"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        onWheel={handleWheel}
      />
      <div className="graph-hint">Drag nodes · Scroll to zoom · Click-drag empty space to pan</div>
      <div className="graph-legend">
        <span className="graph-legend__item"><span className="graph-dot graph-dot--news" /> News</span>
        <span className="graph-legend__item"><span className="graph-dot graph-dot--podcast" /> Podcast</span>
        <span className="graph-legend__item"><span className="graph-dot graph-dot--clip" /> Clip</span>
      </div>
    </div>
  );
}
