import { Card, Button, Separator } from "@heroui/react";

export default function AdminDashboard() {
  const stats = [
    { label: "Total Users", value: "1,284", change: "+12%", color: "primary" },
    { label: "System Uptime", value: "99.98%", change: "Stable", color: "success" },
    { label: "Critical Alerts", value: "3", change: "-2", color: "danger" },
    { label: "Data Processed", value: "48.2 GB", change: "+5.4 GB", color: "warning" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-foreground">Command Center</h1>
          <p className="text-zinc-500 mt-2 font-medium">Real-time system overview and administration metrics.</p>
        </div>
        <div className="flex gap-3">
           <Button variant="ghost" className="rounded-2xl font-bold border-divider">Download Report</Button>
           <Button variant="primary" className="rounded-2xl font-bold shadow-xl shadow-primary/20">System Update</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card.Root key={stat.label} className="p-8 border-divider shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2.5rem] bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm group">
            <Card.Header className="pb-4">
              <p className="text-[10px] font-black uppercase tracking-[3px] text-zinc-400 group-hover:text-primary transition-colors">{stat.label}</p>
            </Card.Header>
            <Card.Content>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black tracking-tighter italic">{stat.value}</span>
                <span className={`text-xs font-bold ${
                  stat.color === 'danger' ? 'text-danger' : 
                  stat.color === 'success' ? 'text-success' : 
                  'text-primary'
                }`}>
                  {stat.change}
                </span>
              </div>
            </Card.Content>
          </Card.Root>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card.Root className="lg:col-span-2 p-8 border-divider rounded-[2.5rem] bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm shadow-sm">
          <Card.Header className="flex flex-row items-center justify-between pb-8">
             <h3 className="text-xl font-bold tracking-tight">System Performance</h3>
             <div className="flex gap-2">
               <span className="h-2 w-10 bg-primary/20 rounded-full overflow-hidden">
                 <div className="h-full bg-primary w-2/3" />
               </span>
               <span className="h-2 w-10 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
             </div>
          </Card.Header>
          <Card.Content>
             <div className="h-64 flex items-end gap-2 px-2">
                {[40, 70, 45, 90, 65, 80, 50, 85, 95, 60, 75, 55].map((h, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-primary/10 hover:bg-primary transition-all duration-500 rounded-t-lg group relative cursor-pointer"
                    style={{ height: `${h}%` }}
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black text-white text-[10px] py-1 px-2 rounded-lg transition-all">
                      {h}%
                    </div>
                  </div>
                ))}
             </div>
             <div className="mt-6 flex justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>23:59</span>
             </div>
          </Card.Content>
        </Card.Root>

        <Card.Root className="p-8 border-divider rounded-[2.5rem] bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm shadow-sm">
          <Card.Header className="pb-6">
             <h3 className="text-xl font-bold tracking-tight">Security Logs</h3>
          </Card.Header>
          <Card.Content className="space-y-6">
             {[
               { user: "Admin", action: "Login Success", time: "2m ago", status: "success" },
               { user: "System", action: "Db Backup", time: "45m ago", status: "primary" },
               { user: "Dr. Smith", action: "Update Patient", time: "1h ago", status: "primary" },
               { user: "Unknown", action: "Auth Failure", time: "3h ago", status: "danger" },
             ].map((log, i) => (
               <div key={i} className="flex items-center gap-4 group cursor-pointer">
                  <div className={`h-2 w-2 rounded-full ${
                    log.status === 'danger' ? 'bg-danger animate-pulse' : 
                    log.status === 'success' ? 'bg-success' : 'bg-primary'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{log.action}</p>
                    <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-tighter">{log.user}</p>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-400 whitespace-nowrap">{log.time}</span>
               </div>
             ))}
             <Separator className="my-6 opacity-30" />
             <Button variant="ghost" fullWidth className="rounded-2xl border-divider text-xs font-bold uppercase tracking-widest">
               View All Audit Logs
             </Button>
          </Card.Content>
        </Card.Root>
      </div>
    </div>
  );
}
