"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

type SaveProgressionFormProps = {
  onSave: (name: string) => void | Promise<void>;
};

export function SaveProgressionForm({ onSave }: SaveProgressionFormProps) {
  const [name, setName] = useState("");

  async function handleSave() {
    await onSave(name.trim() || "Untitled progression");
    setName("");
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="Progression name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Button type="button" onClick={handleSave}>
        Save
      </Button>
    </div>
  );
}
