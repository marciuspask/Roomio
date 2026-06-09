import { useState } from "react";
import { CircleHelp, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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

type FeedbackType = "Bug" | "Suggestion" | "Other";

interface FeedbackForm {
  type: FeedbackType | "";
  subject: string;
  description: string;
}

const INITIAL: FeedbackForm = { type: "", subject: "", description: "" };

const BugReportModal = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FeedbackForm>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleOpen = (v: boolean) => {
    setOpen(v);
    if (!v) {
      setForm(INITIAL);
      setSuccess(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.type) return;
    setSubmitting(true);
    try {
      await apiClient.instance.post("/api/v1/feedback/", {
        type: form.type,
        subject: form.subject,
        description: form.description,
      });
      setSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Send feedback or report a bug"
        className="fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform duration-200 hover:scale-110 hover:shadow-lg"
      >
        <CircleHelp className="h-5 w-5" />
      </button>

      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Feedback</DialogTitle>
          </DialogHeader>

          {success ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="h-10 w-10 text-primary" />
              <p className="font-medium text-foreground">Thank you for your feedback!</p>
              <p className="text-sm text-muted-foreground">
                We'll review your report and get back to you if needed.
              </p>
              <Button className="mt-2" onClick={() => handleOpen(false)}>
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="feedback-type">Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm((f) => ({ ...f, type: v as FeedbackType }))}
                  required
                >
                  <SelectTrigger id="feedback-type">
                    <SelectValue placeholder="Select type…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bug">Bug</SelectItem>
                    <SelectItem value="Suggestion">Suggestion</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="feedback-subject">Subject</Label>
                <Input
                  id="feedback-subject"
                  placeholder="Brief summary…"
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  required
                  maxLength={200}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="feedback-description">Description</Label>
                <Textarea
                  id="feedback-description"
                  placeholder="Describe the issue or suggestion in detail…"
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  required
                  maxLength={5000}
                  className="resize-none"
                />
              </div>

              <Button type="submit" disabled={submitting || !form.type} className="mt-1">
                {submitting ? "Sending…" : "Send Feedback"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BugReportModal;
