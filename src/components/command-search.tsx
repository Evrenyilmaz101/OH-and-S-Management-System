"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Users, Search } from "lucide-react";
import { getEmployees } from "@/lib/store/employees";

interface SearchResult {
  id: string;
  label: string;
  description: string;
  href: string;
  group: string;
  icon: React.ElementType;
}

export function CommandSearch() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (!open) {
      setResults([]);
      return;
    }
    async function loadResults() {
      const employeesData = await getEmployees();

      const r: SearchResult[] = [];

      employeesData.forEach((e) => {
        r.push({
          id: e.id,
          label: `${e.first_name} ${e.last_name}`,
          description: `${e.role} — ${e.employment_type} — ${e.status}`,
          href: `/personnel/${e.id}`,
          group: "Employee Files",
          icon: Users,
        });
      });

      setResults(r);
    }
    loadResults();
  }, [open]);

  const handleSelect = (href: string) => {
    setOpen(false);
    router.push(href);
  };
  const groups = [...new Set(results.map((r) => r.group))];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search employees..." />
      <CommandList>
        <CommandEmpty>
          <div className="flex flex-col items-center gap-2 py-6">
            <Search className="w-8 h-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No results found.</p>
          </div>
        </CommandEmpty>
        {groups.map((group) => (
          <CommandGroup key={group} heading={group}>
            {results
              .filter((r) => r.group === group)
              .map((result) => (
                <CommandItem
                  key={result.id}
                  value={`${result.label} ${result.description}`}
                  onSelect={() => handleSelect(result.href)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <result.icon className="w-4 h-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{result.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                  </div>
                </CommandItem>
              ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
