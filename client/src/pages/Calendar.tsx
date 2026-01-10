import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useLogs, useCreateLog, useDeleteLog } from "@/hooks/use-logs";
import { useState } from "react";
import { format, isSameDay } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Trash2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const logSchema = z.object({
  flowIntensity: z.enum(["light", "medium", "heavy"]),
  notes: z.string().optional(),
});

type LogFormData = z.infer<typeof logSchema>;

export default function CalendarPage() {
  const { data: logs, isLoading } = useLogs();
  const { mutate: createLog, isPending } = useCreateLog();
  const { mutate: deleteLog } = useDeleteLog();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Find log for selected date
  const selectedLog = logs?.find(log => 
    selectedDate && isSameDay(log.startDate, selectedDate)
  );

  // Form handling
  const form = useForm<LogFormData>({
    resolver: zodResolver(logSchema),
    defaultValues: {
      flowIntensity: "medium",
      notes: ""
    }
  });

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setIsDialogOpen(true);
    
    // Reset form for new entry or populate?
    // For simplicity, just reset. Real app would populate if log exists.
    if (!selectedLog) {
      form.reset({ flowIntensity: "medium", notes: "" });
    }
  };

  const onSubmit = (data: LogFormData) => {
    if (!selectedDate) return;
    
    // Simple logic: Single day log for now
    createLog({
      startDate: selectedDate,
      endDate: selectedDate,
      flowIntensity: data.flowIntensity,
      notes: data.notes,
      symptoms: [], // Adding empty array to satisfy schema if needed
    }, {
      onSuccess: () => setIsDialogOpen(false)
    });
  };

  const handleDelete = () => {
    if (selectedLog) {
      deleteLog(selectedLog.id, {
        onSuccess: () => setIsDialogOpen(false)
      });
    }
  };

  // Custom modifiers for calendar highlighting
  const periodDays = logs?.map(log => log.startDate) || [];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">Cycle Calendar</h1>
          <p className="text-muted-foreground mt-1">Log your periods to improve predictions.</p>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-card rounded-3xl p-6 shadow-sm border border-border">
            {isLoading ? (
              <div className="h-96 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="flex justify-center calendar-wrapper">
                <style>{`
                  .rdp { --rdp-cell-size: 50px; --rdp-accent-color: hsl(var(--primary)); }
                  .rdp-day_selected:not([disabled]) { 
                    background-color: hsl(var(--primary)); 
                    color: white;
                  }
                  .period-day {
                    background-color: hsl(var(--primary) / 0.15);
                    color: hsl(var(--primary));
                    font-weight: bold;
                    border-radius: 50%;
                  }
                `}</style>
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  onDayClick={handleDayClick}
                  modifiers={{ period: periodDays }}
                  modifiersClassNames={{ period: "period-day" }}
                  className="p-4"
                />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-secondary/30 rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4">Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Cycle Length</span>
                  <span className="font-bold">28 Days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Period Length</span>
                  <span className="font-bold">5 Days</span>
                </div>
                <div className="h-px bg-border/50 my-2" />
                <div className="text-sm text-muted-foreground">
                  Your cycle is regular. Keep logging for better insights!
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-accent/10 to-primary/5 rounded-2xl p-6 border border-accent/10">
              <h3 className="font-bold text-lg mb-2 text-accent">Did you know?</h3>
              <p className="text-sm text-muted-foreground">
                Tracking symptoms like headaches or cravings can help predict PMS in future cycles.
              </p>
            </div>
          </div>
        </div>

        {/* Log Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">
                {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Log Details"}
              </DialogTitle>
            </DialogHeader>

            {selectedLog ? (
              <div className="space-y-4 py-4">
                <div className="bg-secondary/30 p-4 rounded-xl">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Flow Intensity</p>
                  <p className="text-lg font-bold capitalize text-primary">{selectedLog.flowIntensity}</p>
                </div>
                {selectedLog.notes && (
                  <div className="bg-secondary/30 p-4 rounded-xl">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
                    <p className="text-foreground">{selectedLog.notes}</p>
                  </div>
                )}
                
                <div className="flex justify-end gap-2 mt-4">
                  <button 
                    onClick={handleDelete}
                    className="flex items-center gap-2 text-destructive hover:bg-destructive/10 px-4 py-2 rounded-xl transition-colors font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Log
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Flow Intensity</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["light", "medium", "heavy"].map((intensity) => (
                      <label 
                        key={intensity}
                        className={`
                          cursor-pointer text-center py-2 rounded-xl border-2 transition-all font-medium capitalize
                          ${form.watch("flowIntensity") === intensity 
                            ? "border-primary bg-primary/5 text-primary" 
                            : "border-border hover:border-primary/30 text-muted-foreground"}
                        `}
                      >
                        <input 
                          type="radio" 
                          value={intensity}
                          {...form.register("flowIntensity")}
                          className="hidden" 
                        />
                        {intensity}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notes</label>
                  <textarea 
                    {...form.register("notes")}
                    className="w-full p-3 rounded-xl bg-secondary/30 border-transparent focus:border-primary focus:ring-0 resize-none h-24"
                    placeholder="How are you feeling?"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit" 
                    disabled={isPending}
                    className="btn-primary"
                  >
                    {isPending ? "Saving..." : "Save Log"}
                  </button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
