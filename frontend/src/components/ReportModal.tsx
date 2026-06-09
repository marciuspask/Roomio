import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/api/client";

type ReportReason = "SPAM" | "FAKE" | "INAPPROPRIATE" | "SCAM" | "OTHER";

const REASON_LABELS: Record<ReportReason, string> = {
  SPAM: "Spam",
  FAKE: "Fake / misleading",
  INAPPROPRIATE: "Inappropriate content",
  SCAM: "Scam",
  OTHER: "Other",
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: "listing" | "user";
  targetId: string;
}

const ReportModal = ({ open, onOpenChange, targetType, targetId }: Props) => {
  const [reason, setReason] = useState<ReportReason | "">("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (v: boolean) => {
    onOpenChange(v);
    if (!v) {
      setReason("");
      setDescription("");
      setSuccess(false);
    setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiClient.instance.post("/api/v1/moderation/report", {
        target_type: targetType,
        target_id: targetId,
        reason,
        description,
      });
      setSuccess(true);
    } catch {
      setError("Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report {targetType === "listing" ? "listing" : "user"}</DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-primary" />
            <p className="font-medium text-foreground">Report submitted</p>
            <p className="text-sm text-muted-foreground">
              Thank you — we'll review this and take action if needed.
            </p>
            <Button className="mt-2" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="report-reason">Reason</Label>
              <Select
                value={reason}
                onValueChange={(v) => setReason(v as ReportReason)}
                required
              >
                <SelectTrigger id="report-reason">
                  <SelectValue placeholder="Select a reason…" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(REASON_LABELS) as ReportReason[]).map((r) => (
                    <SelectItem key={r} value={r}>
                      {REASON_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="report-description">
                Additional details{" "}
                <span className="text-xs text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="report-description"
                placeholder="Describe what's wrong…"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                className="resize-none"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" disabled={submitting || !reason} className="mt-1">
              {submitting ? "Submitting…" : "Submit report"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;
