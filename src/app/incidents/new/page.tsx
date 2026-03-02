"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { addIncident } from "@/lib/store/incidents";
import { getEmployees } from "@/lib/store/employees";
import { generateId } from "@/lib/utils";
import type {
  Employee,
  IncidentType,
  IncidentSeverity,
} from "@/lib/types";

const incidentTypes: IncidentType[] = [
  "Near Miss",
  "First Aid",
  "Medical Treatment",
  "Lost Time Injury",
  "Dangerous Occurrence",
  "Property Damage",
];

const incidentSeverities: IncidentSeverity[] = [
  "Insignificant",
  "Minor",
  "Moderate",
  "Major",
  "Catastrophic",
];

export default function NewIncidentPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const today = new Date().toISOString().split("T")[0];
  const now = new Date().toTimeString().slice(0, 5);

  const [form, setForm] = useState({
    date: today,
    time: now,
    location: "",
    type: "Near Miss" as IncidentType,
    severity: "Minor" as IncidentSeverity,
    description: "",
    immediate_actions: "",
    reported_by: "",
    involved_person_ids: [] as string[],
    witness_ids: [] as string[],
  });

  useEffect(() => {
    async function load() {
      const emps = await getEmployees();
      setEmployees(emps);
      if (emps.length > 0) {
        setForm((prev) => ({ ...prev, reported_by: emps[0].id }));
      }
    }
    load();
  }, []);

  const handleInvolvedToggle = (id: string) => {
    setForm((prev) => ({
      ...prev,
      involved_person_ids: prev.involved_person_ids.includes(id)
        ? prev.involved_person_ids.filter((p) => p !== id)
        : [...prev.involved_person_ids, id],
    }));
  };

  const handleWitnessToggle = (id: string) => {
    setForm((prev) => ({
      ...prev,
      witness_ids: prev.witness_ids.includes(id)
        ? prev.witness_ids.filter((w) => w !== id)
        : [...prev.witness_ids, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = generateId();
    const incidentCount = Math.floor(Math.random() * 900) + 100;
    const incident = {
      id,
      incident_number: `INC-${incidentCount}`,
      date: form.date,
      time: form.time,
      location: form.location,
      type: form.type,
      severity: form.severity,
      status: "Open" as const,
      reported_by: form.reported_by,
      reported_date: today,
      involved_person_ids: form.involved_person_ids,
      witness_ids: form.witness_ids,
      description: form.description,
      immediate_actions: form.immediate_actions,
      root_cause: "",
      contributing_factors: "",
      investigated_by: "",
      investigation_date: "",
      notes: "",
      closed_date: "",
    };
    await addIncident(incident);
    router.push(`/incidents/${id}`);
  };

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 pt-12 lg:pt-0">
        <Link
          href="/incidents"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Incidents
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Report New Incident
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Record details of a workplace incident, near miss, or dangerous occurrence
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Date, Time, Location */}
        <Card className="border-border/60">
          <CardContent className="p-6">
            <h2 className="section-header">Date, Time & Location</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  placeholder="e.g. Workshop Bay 3"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Type & Severity */}
        <Card className="border-border/60">
          <CardContent className="p-6">
            <h2 className="section-header">Classification</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Incident Type</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value as IncidentType })
                  }
                  required
                >
                  {incidentTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Severity</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={form.severity}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      severity: e.target.value as IncidentSeverity,
                    })
                  }
                  required
                >
                  {incidentSeverities.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Reported By</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={form.reported_by}
                  onChange={(e) =>
                    setForm({ ...form, reported_by: e.target.value })
                  }
                  required
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Description & Immediate Actions */}
        <Card className="border-border/60">
          <CardContent className="p-6">
            <h2 className="section-header">Incident Details</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe what happened, including events leading up to the incident..."
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Immediate Actions Taken</Label>
                <Textarea
                  placeholder="Describe any immediate actions taken to control the situation..."
                  rows={3}
                  value={form.immediate_actions}
                  onChange={(e) =>
                    setForm({ ...form, immediate_actions: e.target.value })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Involved Persons & Witnesses */}
        <Card className="border-border/60">
          <CardContent className="p-6">
            <h2 className="section-header">Involved Persons & Witnesses</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Involved Persons</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Select all persons directly involved in the incident
                </p>
                <div className="border border-border rounded-md max-h-48 overflow-y-auto">
                  {employees.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-3">
                      No employees found
                    </p>
                  ) : (
                    employees.map((emp) => (
                      <label
                        key={emp.id}
                        className="flex items-center gap-2.5 px-3 py-2 hover:bg-muted/50 cursor-pointer text-sm border-b border-border/50 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={form.involved_person_ids.includes(emp.id)}
                          onChange={() => handleInvolvedToggle(emp.id)}
                          className="rounded border-input"
                        />
                        <span>
                          {emp.first_name} {emp.last_name}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {emp.role}
                        </span>
                      </label>
                    ))
                  )}
                </div>
                {form.involved_person_ids.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {form.involved_person_ids.length} selected
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Witnesses</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Select any witnesses to the incident
                </p>
                <div className="border border-border rounded-md max-h-48 overflow-y-auto">
                  {employees.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-3">
                      No employees found
                    </p>
                  ) : (
                    employees.map((emp) => (
                      <label
                        key={emp.id}
                        className="flex items-center gap-2.5 px-3 py-2 hover:bg-muted/50 cursor-pointer text-sm border-b border-border/50 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={form.witness_ids.includes(emp.id)}
                          onChange={() => handleWitnessToggle(emp.id)}
                          className="rounded border-input"
                        />
                        <span>
                          {emp.first_name} {emp.last_name}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {emp.role}
                        </span>
                      </label>
                    ))
                  )}
                </div>
                {form.witness_ids.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {form.witness_ids.length} selected
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link href="/incidents">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" className="gap-2">
            <Save className="w-4 h-4" />
            Save Incident
          </Button>
        </div>
      </form>
    </div>
  );
}
