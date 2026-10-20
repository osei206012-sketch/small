"use client";

import { useEffect, useState } from "react";
import { Card, Field, Input, Textarea, Button } from "@/components/ui";

interface Experience {
  role: string;
  company: string;
  start: string;
  end: string;
  bullets: string;
}
interface Education {
  school: string;
  degree: string;
  year: string;
}
interface CvRow {
  id: string;
  title: string;
  updatedAt: string;
}

const emptyExp = (): Experience => ({ role: "", company: "", start: "", end: "", bullets: "" });
const emptyEdu = (): Education => ({ school: "", degree: "", year: "" });

export function CvGenerator() {
  const [title, setTitle] = useState("My CV");
  const [fullName, setFullName] = useState("Jane Doe");
  const [jobTitle, setJobTitle] = useState("Operations Manager");
  const [email, setEmail] = useState("jane@email.com");
  const [phone, setPhone] = useState("+1 555 0100");
  const [location, setLocation] = useState("Cape Town, ZA");
  const [summary, setSummary] = useState(
    "Results-driven operations manager with 6+ years of experience running small-business teams, managing stock and cutting costs."
  );
  const [skills, setSkills] = useState("Excel, Inventory, Invoicing, Customer service, Team leadership");
  const [experience, setExperience] = useState<Experience[]>([emptyExp()]);
  const [education, setEducation] = useState<Education[]>([emptyEdu()]);
  const [saved, setSaved] = useState<CvRow[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cvs")
      .then((r) => r.json())
      .then((d) => setSaved(d.cvs || []))
      .catch(() => {});
  }, []);

  function updateExp(i: number, patch: Partial<Experience>) {
    setExperience((a) => a.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  }
  function updateEdu(i: number, patch: Partial<Education>) {
    setEducation((a) => a.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  }

  async function save() {
    setMsg(null);
    const res = await fetch("/api/cvs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        data: { fullName, jobTitle, email, phone, location, summary, skills, experience, education },
      }),
    });
    if (res.ok) {
      const d = await res.json();
      setSaved((s) => [d.cv, ...s]);
      setMsg("CV saved to your account.");
    } else {
      setMsg("Could not save CV.");
    }
  }

  const skillList = skills.split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">📄 CV Generator</h1>
          <p className="text-sm text-slate-500">Build a clean, professional CV and export it as a PDF.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>🖨️ Print / PDF</Button>
          <Button onClick={save}>Save</Button>
        </div>
      </div>

      {msg ? <p className="text-sm text-emerald-600">{msg}</p> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <div className="space-y-6">
          <Card title="Personal details">
            <div className="space-y-4">
              <Field label="CV title (for saving)">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </Field>
              <Field label="Full name">
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </Field>
              <Field label="Job title">
                <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Email">
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                </Field>
                <Field label="Phone">
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                </Field>
              </div>
              <Field label="Location">
                <Input value={location} onChange={(e) => setLocation(e.target.value)} />
              </Field>
              <Field label="Professional summary">
                <Textarea rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} />
              </Field>
              <Field label="Skills (comma separated)">
                <Textarea rows={2} value={skills} onChange={(e) => setSkills(e.target.value)} />
              </Field>
            </div>
          </Card>

          <Card title="Experience" subtitle="Add your roles, most recent first.">
            <div className="space-y-4">
              {experience.map((exp, i) => (
                <div key={i} className="space-y-3 rounded-xl border border-slate-200 p-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Role"><Input value={exp.role} onChange={(e) => updateExp(i, { role: e.target.value })} /></Field>
                    <Field label="Company"><Input value={exp.company} onChange={(e) => updateExp(i, { company: e.target.value })} /></Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Start"><Input value={exp.start} onChange={(e) => updateExp(i, { start: e.target.value })} placeholder="Jan 2022" /></Field>
                    <Field label="End"><Input value={exp.end} onChange={(e) => updateExp(i, { end: e.target.value })} placeholder="Present" /></Field>
                  </div>
                  <Field label="Key achievements (one per line)">
                    <Textarea rows={3} value={exp.bullets} onChange={(e) => updateExp(i, { bullets: e.target.value })} />
                  </Field>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setExperience((a) => a.filter((_, idx) => idx !== i))}
                      className="text-xs text-rose-500 hover:underline"
                    >Remove</button>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setExperience((a) => [...a, emptyExp()])}>+ Add role</Button>
            </div>
          </Card>

          <Card title="Education">
            <div className="space-y-4">
              {education.map((edu, i) => (
                <div key={i} className="space-y-3 rounded-xl border border-slate-200 p-3">
                  <Field label="School / Institution"><Input value={edu.school} onChange={(e) => updateEdu(i, { school: e.target.value })} /></Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Qualification"><Input value={edu.degree} onChange={(e) => updateEdu(i, { degree: e.target.value })} /></Field>
                    <Field label="Year"><Input value={edu.year} onChange={(e) => updateEdu(i, { year: e.target.value })} placeholder="2020" /></Field>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setEducation((a) => a.filter((_, idx) => idx !== i))}
                      className="text-xs text-rose-500 hover:underline"
                    >Remove</button>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setEducation((a) => [...a, emptyEdu()])}>+ Add education</Button>
            </div>
          </Card>
        </div>

        {/* Preview */}
        <div className="print-area lg:sticky lg:top-6 lg:self-start">
          <Card title="Preview">
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm">
              <h2 className="text-3xl font-bold text-slate-900">{fullName}</h2>
              <p className="text-indigo-600">{jobTitle}</p>
              <p className="mt-1 text-xs text-slate-500">
                {email} · {phone} · {location}
              </p>

              <Section title="Profile">
                <p className="text-slate-600">{summary}</p>
              </Section>

              <Section title="Skills">
                <div className="flex flex-wrap gap-2">
                  {skillList.map((s) => (
                    <span key={s} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">{s}</span>
                  ))}
                </div>
              </Section>

              <Section title="Experience">
                {experience.filter((e) => e.role || e.company).map((e, i) => (
                  <div key={i} className="mb-3">
                    <div className="flex items-baseline justify-between">
                      <p className="font-semibold text-slate-800">{e.role || "Role"}</p>
                      <p className="text-xs text-slate-400">{e.start}{e.end ? ` – ${e.end}` : ""}</p>
                    </div>
                    <p className="text-xs text-indigo-600">{e.company}</p>
                    {e.bullets ? (
                      <ul className="mt-1 list-disc pl-5 text-slate-600">
                        {e.bullets.split("\n").map((b, j) => b.trim() ? <li key={j}>{b}</li> : null)}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </Section>

              <Section title="Education">
                {education.filter((e) => e.school || e.degree).map((e, i) => (
                  <div key={i} className="mb-2 flex items-baseline justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{e.degree || "Qualification"}</p>
                      <p className="text-xs text-slate-500">{e.school}</p>
                    </div>
                    <p className="text-xs text-slate-400">{e.year}</p>
                  </div>
                ))}
              </Section>
            </div>
          </Card>
        </div>
      </div>

      <Card title="Saved CVs">
        {saved.length === 0 ? (
          <p className="text-sm text-slate-500">No saved CVs yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {saved.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-2">
                <span className="font-medium text-slate-800">{c.title}</span>
                <span className="text-slate-500">{new Date(c.updatedAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h3 className="border-b border-slate-200 pb-1 text-xs font-bold uppercase tracking-widest text-slate-400">
        {title}
      </h3>
      <div className="mt-2">{children}</div>
    </div>
  );
}
