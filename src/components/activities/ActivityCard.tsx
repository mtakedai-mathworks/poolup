import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";

interface Activity {
  id: string;
  name: string;
  date: string;
  campus: "Apple Hill" | "Lakeside";
  participantCount: number;
}

interface ActivityCardProps {
  activity: Activity;
  onJoinCarpool: (activityId: string) => void;
}

export function ActivityCard({ activity, onJoinCarpool }: ActivityCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="hover:shadow-elevated transition-all duration-300 cursor-pointer bg-gradient-card border-0">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-card-foreground">
            {activity.name}
          </CardTitle>
          <Badge 
            variant={activity.campus === "Apple Hill" ? "default" : "secondary"}
            className="text-xs"
          >
            {activity.campus}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4" />
          {formatDate(activity.date)}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{activity.participantCount} participant{activity.participantCount !== 1 ? 's' : ''}</span>
          </div>
          <Button 
            onClick={() => onJoinCarpool(activity.id)}
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
            size="sm"
          >
            Join Carpool
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}