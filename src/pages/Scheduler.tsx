import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Car, Users } from "lucide-react";
import { CalendarGrid } from "@/components/scheduler/CalendarGrid";
import { useToast } from "@/hooks/use-toast";

interface TimeSlot {
  id: string;
  time: string;
  driverId?: string;
  driverName?: string;
  capacity?: number;
  passengers: string[];
  isAvailable: boolean;
}

interface SchedulerProps {
  user: { id: string; email: string } | null;
}

export function Scheduler({ user }: SchedulerProps) {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isDriver, setIsDriver] = useState<boolean | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(() => {
    const saved = localStorage.getItem(`poolup-scheduler-${activityId}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [showCapacityInput, setShowCapacityInput] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [capacity, setCapacity] = useState<number>(4);
  const [driverCampus, setDriverCampus] = useState<string>("");

  // Get activity data from localStorage
  const getActivityData = () => {
    const saved = localStorage.getItem('poolup-activities');
    if (saved) {
      const activities = JSON.parse(saved);
      return activities.find((act: any) => act.id === activityId);
    }
    return null;
  };

  const activity = getActivityData() || {
    id: activityId,
    name: "Unknown Activity",
    date: new Date().toISOString().split('T')[0],
    campus: "Unknown Location"
  };

  const handleRoleSelection = (selectedRole: "driver" | "passenger") => {
    setIsDriver(selectedRole === "driver");
  };

  const handleSlotSelect = (slotId: string, time: string) => {
    if (isDriver) {
      if (slotId.startsWith("new-")) {
        // New driver slot
        setSelectedTime(time);
        setShowCapacityInput(true);
      } else {
        // Existing slot - allow driver to modify
        const slot = timeSlots.find(s => s.id === slotId);
        if (slot && slot.driverId === user?.id) {
          // Driver can modify their own slot
          toast({
            title: "Modify Slot",
            description: "Feature to modify existing slots coming soon!",
          });
        }
      }
    } else {
      // Passenger joining a slot
      const slot = timeSlots.find(s => s.id === slotId);
      if (slot && slot.driverId && slot.passengers.length < (slot.capacity || 0) && !slot.passengers.includes(user?.id || "")) {
        const updatedSlots = timeSlots.map(s => 
          s.id === slotId 
            ? { ...s, passengers: [...s.passengers, user?.id || ""] }
            : s
        );
        setTimeSlots(updatedSlots);
        localStorage.setItem(`poolup-scheduler-${activityId}`, JSON.stringify(updatedSlots));
        
        toast({
          title: "Joined carpool!",
          description: `You've joined ${slot.driverName}'s carpool at ${slot.time}`,
        });
      }
    }
  };

  const handleCreateDriverSlot = () => {
    if (!selectedTime || !user || !driverCampus) return;

    const newSlot: TimeSlot = {
      id: `slot-${Date.now()}`,
      time: selectedTime,
      driverId: user.id,
      driverName: user.email.split('@')[0],
      capacity: capacity,
      passengers: [],
      isAvailable: true
    };

    const updatedSlots = [...timeSlots, newSlot];
    setTimeSlots(updatedSlots);
    localStorage.setItem(`poolup-scheduler-${activityId}`, JSON.stringify(updatedSlots));
    setShowCapacityInput(false);
    setSelectedTime("");
    setDriverCampus("");
    
    toast({
      title: "Driver slot created!",
      description: `You're now driving from ${driverCampus} at ${selectedTime} with ${capacity} passenger spots`,
    });
  };

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/activities')}
              className="hover:bg-muted"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Activities
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">{activity.name}</h1>
              <p className="text-sm text-muted-foreground">
                {new Date(activity.date).toLocaleDateString()} • {activity.campus}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Role Selection */}
        {isDriver === null && (
          <Card className="mb-8 shadow-elevated">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Choose Your Role</CardTitle>
              <CardDescription>
                Are you planning to drive or looking for a ride?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-24 flex flex-col gap-2 hover:shadow-glow transition-all duration-300"
                  onClick={() => handleRoleSelection("driver")}
                >
                  <Car className="h-8 w-8 text-primary" />
                  <span className="font-semibold">I'm a Driver</span>
                  <span className="text-xs text-muted-foreground">
                    I can offer rides to others
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex flex-col gap-2 hover:shadow-glow transition-all duration-300"
                  onClick={() => handleRoleSelection("passenger")}
                >
                  <Users className="h-8 w-8 text-primary" />
                  <span className="font-semibold">I'm a Passenger</span>
                  <span className="text-xs text-muted-foreground">
                    I need a ride to the event
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Capacity Input Modal */}
        {showCapacityInput && (
          <Card className="mb-8 shadow-elevated">
            <CardHeader>
              <CardTitle>Set Your Driver Details</CardTitle>
              <CardDescription>
                Configure your carpool details for {selectedTime}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Number of Passengers</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    max="8"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-32"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driverCampus">Your Campus/Starting Point</Label>
                  <select
                    id="driverCampus"
                    value={driverCampus}
                    onChange={(e) => setDriverCampus(e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                    required
                  >
                    <option value="">Select your campus</option>
                    <option value="Apple Hill">Apple Hill</option>
                    <option value="Lakeside">Lakeside</option>
                    <option value="Other">Other Location</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleCreateDriverSlot}
                    className="bg-gradient-primary"
                    disabled={!driverCampus}
                  >
                    Create Driver Slot
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCapacityInput(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Calendar Grid */}
        {isDriver !== null && !showCapacityInput && (
          <CalendarGrid
            timeSlots={timeSlots}
            isDriver={isDriver}
            currentUserId={user.id}
            onSlotSelect={handleSlotSelect}
          />
        )}

        {/* Current Status */}
        {isDriver !== null && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Your Status
                <Badge variant={isDriver ? "default" : "secondary"}>
                  {isDriver ? "Driver" : "Passenger"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isDriver ? (
                <div>
                  {timeSlots.filter(slot => slot.driverId === user.id).length === 0 ? (
                    <p className="text-muted-foreground">
                      Select a time slot above to start offering rides.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {timeSlots
                        .filter(slot => slot.driverId === user.id)
                        .map(slot => (
                          <div key={slot.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="font-medium">Driving at {slot.time}</span>
                            <Badge variant="outline">
                              {slot.passengers.length}/{slot.capacity} passengers
                            </Badge>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {timeSlots.filter(slot => slot.passengers.includes(user.id)).length === 0 ? (
                    <p className="text-muted-foreground">
                      Select an available time slot above to join a carpool.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {timeSlots
                        .filter(slot => slot.passengers.includes(user.id))
                        .map(slot => (
                          <div key={slot.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="font-medium">Riding with {slot.driverName} at {slot.time}</span>
                            <Badge variant="outline">Confirmed</Badge>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
