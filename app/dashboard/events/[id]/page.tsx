"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Users, Wallet, Leaf, CheckCircle2, Circle, MoreHorizontal } from "lucide-react";

export default function EventDashboardPage({ params }: { params: { id: string } }) {
  // Mock event data
  const event = {
    title: "Green Tech Summit 2026",
    date: "August 15, 2026",
    status: "PLANNING",
    budget: {
      allocated: 50000000,
      spent: 12500000,
      saved: 3500000
    },
    guests: {
      attending: 45,
      pending: 20
    }
  };

  const [tasks, setTasks] = useState([
    { id: 1, stage: "PRE", title: "Book reusable bamboo plates", completed: true },
    { id: 2, stage: "PRE", title: "Send digital e-invitations", completed: true },
    { id: 3, stage: "PRE", title: "Confirm local organic catering", completed: false },
    { id: 4, stage: "DURING", title: "Set up recycling stations", completed: false },
    { id: 5, stage: "POST", title: "Collect and return rented gear", completed: false }
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Tech Conference
            </Badge>
            <Badge variant="secondary">{event.status}</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><MoreHorizontal className="h-4 w-4" /></Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white">Publish Event Page</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Budget Tracker</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{event.budget.spent.toLocaleString()} ₫</div>
            <p className="text-xs text-muted-foreground mt-1">
              of {event.budget.allocated.toLocaleString()} ₫ allocated
            </p>
            <div className="mt-4 h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500" 
                style={{ width: `${(event.budget.spent / event.budget.allocated) * 100}%` }}
              />
            </div>
            <p className="text-xs text-green-600 font-medium mt-2 flex items-center">
              <Leaf className="h-3 w-3 mr-1" /> {event.budget.saved.toLocaleString()} ₫ saved via eco-rentals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Guest List (RSVP)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{event.guests.attending}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Confirmed Attending
            </p>
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <span className="text-sm text-muted-foreground">{event.guests.pending} Pending</span>
              <Button variant="link" className="p-0 h-auto text-green-600">Manage Guests</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Event Date</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{event.date}</div>
            <p className="text-xs text-muted-foreground mt-1">
              18 days remaining
            </p>
            <Button variant="outline" className="w-full mt-4">View Schedule</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Kanban Task Board</CardTitle>
              <CardDescription>Keep track of everything needed for your sustainable event.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {["PRE", "DURING", "POST"].map(stage => (
                  <div key={stage}>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wider">{stage} EVENT</h3>
                    <div className="space-y-2">
                      {tasks.filter(t => t.stage === stage).map(task => (
                        <div 
                          key={task.id} 
                          className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => toggleTask(task.id)}
                        >
                          <button className="mt-0.5 text-muted-foreground hover:text-green-600 transition-colors">
                            {task.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <Circle className="h-5 w-5" />
                            )}
                          </button>
                          <span className={`${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {task.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
           <Card className="bg-green-50/50 dark:bg-green-950/20 border-green-200">
             <CardHeader>
               <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-400">
                 <Leaf className="h-5 w-5" />
                 AI Recommendations
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                <div className="p-3 bg-white dark:bg-black rounded-lg border text-sm">
                  <span className="font-semibold block mb-1">Catering Opportunity</span>
                  Based on your guest list, booking a local vegan caterer could reduce carbon footprint by 40% and save 15% in costs.
                  <Button variant="link" className="p-0 h-auto text-green-600 block mt-2">Find Caterers</Button>
                </div>
                <div className="p-3 bg-white dark:bg-black rounded-lg border text-sm">
                  <span className="font-semibold block mb-1">Missing Rentals</span>
                  You haven't secured Audio/Visual equipment yet. The University Club has a projector available for rent on your date.
                  <Button variant="link" className="p-0 h-auto text-green-600 block mt-2">Rent Projector</Button>
                </div>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
