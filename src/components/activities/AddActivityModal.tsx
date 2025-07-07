import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface AddActivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddActivity: (activity: { name: string; date: string; campus: string }) => void;
  existingActivities: Array<{ name: string; date: string; campus: string }>;
}

export function AddActivityModal({ 
  open, 
  onOpenChange, 
  onAddActivity, 
  existingActivities 
}: AddActivityModalProps) {
  const [name, setName] = useState("");
  const [date, setDate] = useState<Date>();
  const [campus, setCampus] = useState("");
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictActivity, setConflictActivity] = useState<any>(null);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !date || !campus) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const activityData = {
      name: name.trim(),
      date: date.toISOString().split('T')[0],
      campus
    };

    // Check for conflicts
    const conflict = existingActivities.find(
      activity => 
        activity.name.toLowerCase() === activityData.name.toLowerCase() &&
        activity.date === activityData.date &&
        activity.campus === activityData.campus
    );

    if (conflict) {
      setConflictActivity(activityData);
      setShowConflictDialog(true);
      return;
    }

    // No conflict, add the activity
    onAddActivity(activityData);
    resetForm();
    onOpenChange(false);
    
    toast({
      title: "Activity created",
      description: "Your activity has been added successfully",
    });
  };

  const handleCreateAnyway = () => {
    if (conflictActivity) {
      onAddActivity(conflictActivity);
      resetForm();
      setShowConflictDialog(false);
      onOpenChange(false);
      
      toast({
        title: "Activity created",
        description: "Your activity has been added successfully",
      });
    }
  };

  const resetForm = () => {
    setName("");
    setDate(undefined);
    setCampus("");
    setConflictActivity(null);
  };

  const handleCancel = () => {
    resetForm();
    setShowConflictDialog(false);
    onOpenChange(false);
  };

  if (showConflictDialog) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Similar Activity Found</DialogTitle>
            <DialogDescription>
              An activity with the same name, date, and campus already exists. 
              Would you like to create a new one anyway or cancel?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleCreateAnyway} className="bg-gradient-primary">
              Create Anyway
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Activity</DialogTitle>
          <DialogDescription>
            Create a new activity for carpooling coordination.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="activityName">Activity Name</Label>
            <Input
              id="activityName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Concert at Downtown Arena"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="pointer-events-auto"
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              value={campus}
              onChange={(e) => setCampus(e.target.value)}
              placeholder="Enter event location or address"
              required
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-primary">
              Create Activity
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}