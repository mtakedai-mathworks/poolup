import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Car, Users } from "lucide-react";
import { DriverSetup } from "@/components/scheduler/DriverSetup";
import { DriverList } from "@/components/scheduler/DriverList";
import { useToast } from "@/hooks/use-toast";

interface DriverSlot {
  id: string;
  time: string;
  driverId: string;
  driverName: string;
  location: string;
  note?: string;
  capacity: number;
  passengers: string[];
}

interface SchedulerProps {
  user: { id: string; email: string } | null;
}

export function Scheduler({ user }: SchedulerProps) {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isDriver, setIsDriver] = useState<boolean | null>(null);
  const [driverSlots, setDriverSlots] = useState<DriverSlot[]>(() => {
    const saved = localStorage.getItem(`poolup-scheduler-${activityId}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [showDriverSetup, setShowDriverSetup] = useState(false);

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
    time: "",
    campus: "Unknown Location"
  };

  const handleRoleSelection = (selectedRole: "driver" | "passenger") => {
    setIsDriver(selectedRole === "driver");
    if (selectedRole === "driver") {
      setShowDriverSetup(true);
    }
  };

  const handleCreateDriverSlot = (data: {
    time: string;
    location: string;
    note: string;
    capacity: number;
  }) => {
    if (!user) return;

    const newSlot: DriverSlot = {
      id: `slot-${Date.now()}`,
      time: data.time,
      driverId: user.id,
      driverName: user.email.split('@')[0],
      location: data.location,
      note: data.note,
      capacity: data.capacity,
      passengers: []
    };

    const updatedSlots = [...driverSlots, newSlot];
    setDriverSlots(updatedSlots);
    localStorage.setItem(`poolup-scheduler-${activityId}`, JSON.stringify(updatedSlots));
    setShowDriverSetup(false);
    
    toast({
      title: "Driver slot created!",
      description: `You're now driving from ${data.location} at ${data.time} with ${data.capacity} passenger spots`,
    });
  };

  const handleJoinDriver = (slotId: string) => {
    if (!user) return;

    const updatedSlots = driverSlots.map(slot => 
      slot.id === slotId 
        ? { ...slot, passengers: [...slot.passengers, user.id] }
        : slot
    );
    setDriverSlots(updatedSlots);
    localStorage.setItem(`poolup-scheduler-${activityId}`, JSON.stringify(updatedSlots));
    
    const slot = driverSlots.find(s => s.id === slotId);
    if (slot) {
      toast({
        title: "Joined carpool!",
        description: `You've joined ${slot.driverName}'s carpool from ${slot.location} at ${slot.time}`,
      });
    }
  };

  const handleLeaveDriver = (slotId: string) => {
    if (!user) return;

    const updatedSlots = driverSlots.map(slot => 
      slot.id === slotId 
        ? { ...slot, passengers: slot.passengers.filter(id => id !== user.id) }
        : slot
    );
    setDriverSlots(updatedSlots);
    localStorage.setItem(`poolup-scheduler-${activityId}`, JSON.stringify(updatedSlots));
    
    toast({
      title: "Left carpool",
      description: "You've left the carpool",
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
                {new Date(activity.date).toLocaleDateString()}
                {activity.time && ` • ${activity.time}`} • {activity.campus}
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

        {/* Driver Setup */}
        {showDriverSetup && (
          <DriverSetup
            onCreateSlot={handleCreateDriverSlot}
            onCancel={() => setShowDriverSetup(false)}
          />
        )}

        {/* Driver List for Passengers */}
        {isDriver === false && !showDriverSetup && (
          <DriverList
            drivers={driverSlots}
            currentUserId={user.id}
            onJoinDriver={handleJoinDriver}
            onLeaveDriver={handleLeaveDriver}
          />
        )}

        {/* Current Status */}
        {isDriver !== null && !showDriverSetup && (
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
                  {driverSlots.filter(slot => slot.driverId === user.id).length === 0 ? (
                    <p className="text-muted-foreground">
                      Set up your driver details above to start offering rides.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {driverSlots
                        .filter(slot => slot.driverId === user.id)
                        .map(slot => (
                          <div key={slot.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="font-medium">Driving from {slot.location} at {slot.time}</span>
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
                  {driverSlots.filter(slot => slot.passengers.includes(user.id)).length === 0 ? (
                    <p className="text-muted-foreground">
                      Choose a driver from the list above to join a carpool.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {driverSlots
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
