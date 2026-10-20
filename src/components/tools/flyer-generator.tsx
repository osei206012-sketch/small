"use client";

import { useEffect, useRef, useState } from "react";
import { Card, Field, Input, Textarea, Button } from "@/components/ui";

interface FlyerRow {
  id: string;
  title: string;
  createdAt: string;
}

const PALETTES = [
  { name: "Indigo", bg: "#4f46e5", accent: "#fbbf24", text: "#ffffff" },
  { name: "Emerald", bg: "#059669", accent: "#a7f3d0", text: "#ffffff" },
  { name: "Rose", bg: "#e11d48", accent: "#fecdd3", text: "#ffffff" },
  { name: "Slate", bg: "#0f172a", accent: "#38bdf8", text: "#ffffff" },
  { name: "Amber", bg: "#d97706", accent: "#1f2937", text: "#ffffff" },
  { name: "Light", bg: "#f8fafc", accent: "#4f46e5", text: "#0f172a" },
];

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function FlyerGenerator() {
  const [title, setTitle] = useState("Grand Opening Flyer");
  const [business, setBusiness] = useState("Your Business Name");
  const [headline, setHeadline] = useState("Big Sale This Weekend!");
  const [description, setDescription] = useState(
    "Visit us this Saturday and enjoy up to 50% off everything in store. Bring this flyer and get an extra 10% off your first purchase."
  );
  const [phone, setPhone] = useState("+1 555 0100");
  const [email, setEmail] = useState("hello@yourbusiness.com");
  const [website, setWebsite] = useState("www.yourbusiness.com");
  const [address, setAddress] = useState("123 Main Street, City");
  const [paletteIdx, setPaletteIdx] = useState(0);
  const [saved, setSaved] = useState<FlyerRow[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const palette = PALETTES[paletteIdx];

  useEffect(() => {
    fetch("/api/flyers")
      .then((r) => r.json())
      .then((d) => setSaved(d.flyers || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    drawFlyer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business, headline, description, phone, email, website, address, paletteIdx]);

  function drawFlyer() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = 540;
    const H = 675;
    canvas.width = W;
    canvas.height = H;

    // Background
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, W, H);

    // Accent shapes
    ctx.fillStyle = palette.accent;
    ctx.beginPath();
    ctx.arc(W - 90, 110, 130, 0, Math.PI * 2);
    ctx.globalAlpha = 0.9;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillRect(0, H - 70, W, 70);

    // Business name
    ctx.fillStyle = palette.text;
    ctx.globalAlpha = 0.85;
    ctx.font = "600 22px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(business.toUpperCase(), 40, 70);
    ctx.globalAlpha = 1;

    // Headline (wrapped, big)
    ctx.font = "800 52px system-ui, sans-serif";
    const headlineLines = wrapText(ctx, headline, W - 80);
    let y = 180;
    for (const ln of headlineLines) {
      ctx.fillText(ln, 40, y);
      y += 60;
    }

    // Description (wrapped, smaller)
    ctx.font = "400 22px system-ui, sans-serif";
    ctx.globalAlpha = 0.9;
    const descLines = wrapText(ctx, description, W - 80);
    y += 20;
    for (const ln of descLines) {
      ctx.fillText(ln, 40, y);
      y += 32;
    }
    ctx.globalAlpha = 1;

    // Contact bar at bottom
    ctx.fillStyle = palette.text;
    ctx.font = "600 20px system-ui, sans-serif";
    const contact = [phone, email, website, address].filter(Boolean).join("   •   ");
    ctx.fillText(contact, 40, H - 30);
  }

  function downloadPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${title.replace(/\s+/g, "-").toLowerCase() || "flyer"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  async function save() {
    setMsg(null);
    const res = await fetch("/api/flyers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        data: { business, headline, description, phone, email, website, address, palette: palette.name },
      }),
    });
    if (res.ok) {
      const d = await res.json();
      setSaved((s) => [d.flyer, ...s]);
      setMsg("Flyer saved to your account.");
    } else {
      setMsg("Could not save flyer.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🎨 Business Flyer Generator</h1>
          <p className="text-sm text-slate-500">Design a flyer and download it as a PNG or print it as a PDF.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>🖨️ Print / PDF</Button>
          <Button variant="outline" onClick={downloadPng}>⬇️ Download PNG</Button>
          <Button onClick={save}>Save</Button>
        </div>
      </div>

      {msg ? <p className="text-sm text-emerald-600">{msg}</p> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Flyer content">
          <div className="space-y-4">
            <Field label="Flyer title (for saving)">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <Field label="Business name">
              <Input value={business} onChange={(e) => setBusiness(e.target.value)} />
            </Field>
            <Field label="Headline">
              <Input value={headline} onChange={(e) => setHeadline(e.target.value)} />
            </Field>
            <Field label="Description">
              <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone">
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </Field>
              <Field label="Email">
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Website">
                <Input value={website} onChange={(e) => setWebsite(e.target.value)} />
              </Field>
              <Field label="Address">
                <Input value={address} onChange={(e) => setAddress(e.target.value)} />
              </Field>
            </div>
            <div>
              <span className="mb-2 block text-sm font-medium text-slate-700">Colour palette</span>
              <div className="flex flex-wrap gap-2">
                {PALETTES.map((p, i) => (
                  <button
                    key={p.name}
                    onClick={() => setPaletteIdx(i)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium ${
                      paletteIdx === i ? "border-indigo-500 ring-2 ring-indigo-500" : "border-slate-200"
                    }`}
                  >
                    <span className="h-5 w-5 rounded-full border border-black/10" style={{ background: p.bg }} />
                    <span className="h-5 w-5 rounded-full border border-black/10" style={{ background: p.accent }} />
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card title="Preview" subtitle="This is exactly what will be downloaded.">
          <div className="print-area flex justify-center">
            <canvas
              ref={canvasRef}
              className="w-full max-w-md rounded-2xl shadow-lg"
              style={{ aspectRatio: "4 / 5" }}
            />
          </div>
        </Card>
      </div>

      <Card title="Saved flyers">
        {saved.length === 0 ? (
          <p className="text-sm text-slate-500">No saved flyers yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {saved.map((f) => (
              <li key={f.id} className="flex items-center justify-between py-2">
                <span className="font-medium text-slate-800">{f.title}</span>
                <span className="text-slate-500">{new Date(f.createdAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
