"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Pencil, Check } from "lucide-react";
import { updateNameAction } from "@/app/(app)/settings/actions";

export function ProfileCard({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(name);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      await updateNameAction(newName);
      setIsEditing(false);
    });
  };

  return (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          Perfil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between rounded-lg bg-accent/30 px-3 py-2.5">
          <span className="text-xs text-muted-foreground">Nombre</span>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-7 w-40 text-sm bg-background border-0 focus-visible:ring-1"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                disabled={isPending}
                onClick={handleSave}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{name}</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-3 w-3 text-muted-foreground" />
              </Button>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center rounded-lg bg-accent/30 px-3 py-2.5">
          <span className="text-xs text-muted-foreground">Email</span>
          <span className="text-sm font-medium">{email}</span>
        </div>
      </CardContent>
    </Card>
  );
}
