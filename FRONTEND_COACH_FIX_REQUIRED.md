# Frontend Coach Security Fix - CRITICAL

## 🚨 ISSUE CONFIRMED IN BROWSER

**Current Behavior:**
- Coach logs in with `rajkale01@gmail.com / Coach@123`
- Gets redirected to `/` (admin dashboard)
- Sees FULL admin interface (sidebar with all menu items)
- Backend APIs return 403 (secured ✅)
- BUT frontend doesn't check role and shows admin UI ❌

## 📊 Current Status

### Backend Security: ✅ WORKING
- Coach API calls to `/api/dashboard/stats` → 403 Forbidden
- Coach API calls to `/api/students` → 403 Forbidden
- Coach can only access `/api/coach/*` endpoints
- **Backend is SECURE**

### Frontend Security: ❌ BROKEN
- Coach sees admin dashboard UI
- Coach sees admin sidebar menu
- Coach can click on admin pages (but APIs fail with 403)
- No role-based routing
- **Frontend shows everything to everyone**

---

## 🎯 Required Fixes

### 1. Update `client/src/App.tsx`

**Add role-based redirect after login:**

```typescript
// Around line 49-52, change:
onLoginSuccess={() => {
  checkAuth();
  // Redirect to dashboard after successful login
  window.location.href = '/';
}} 

// TO:
onLoginSuccess={async () => {
  await checkAuth();
  // Role-based redirect
  const response = await fetch('/api/auth/me', { credentials: 'include' });
  const data = await response.json();
  
  if (data.user.role === 'coach') {
    window.location.href = '/coach/dashboard';
  } else {
    window.location.href = '/';
  }
}} 
```

**Add coach routes:**

```typescript
// After line 74, add coach routes:
<Switch>
  {/* Coach Routes */}
  {user?.role === 'coach' && (
    <>
      <Route path="/" component={() => {
        window.location.href = '/coach/dashboard';
        return null;
      }} />
      <Route path="/coach/dashboard" component={CoachDashboard} />
      <Route path="/coach/attendance" component={CoachAttendance} />
      <Route path="/coach/*" component={NotFound} />
      <Route path="/*" component={() => {
        return <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
          <p>Coaches cannot access this page</p>
          <a href="/coach/dashboard" className="text-blue-600">Go to Coach Dashboard</a>
        </div>;
      }} />
    </>
  )}
  
  {/* Admin/Manager Routes */}
  {(user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager') && (
    <>
      <Route path="/" component={Dashboard} />
      <Route path="/students" component={Students} />
      // ... existing routes
    </>
  )}
</Switch>
```

### 2. Update `client/src/components/layout/sidebar.tsx`

**Add role check to hide admin menu from coaches:**

```typescript
// Near the top of Sidebar component:
import { useAuth } from "@/contexts/auth-context";

export function Sidebar({ isCollapsed, onToggle, isMobileOpen, onMobileToggle }: SidebarProps) {
  const { user } = useAuth();
  const isCoach = user?.role === 'coach';
  
  // Define coach menu items
  const coachMenuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/coach/dashboard' },
    { name: 'My Batches', icon: Users, href: '/coach/batches' },
    { name: 'Mark Attendance', icon: ClipboardCheck, href: '/coach/attendance' },
  ];
  
  // Show coach menu if user is coach
  if (isCoach) {
    return <SidebarContent items={coachMenuItems} />;
  }
  
  // Show admin menu for admin/manager
  // ... existing admin menu
}
```

### 3. Create `client/src/pages/coach-dashboard.tsx` (NEW FILE)

```typescript
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, CheckCircle, AlertCircle, Calendar } from "lucide-react";

export default function CoachDashboard() {
  const { data: dashboardData } = useQuery({
    queryKey: ['/api/coach/dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/coach/dashboard', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch dashboard');
      return response.json();
    },
  });

  const { data: batches } = useQuery({
    queryKey: ['/api/coach/batches'],
    queryFn: async () => {
      const response = await fetch('/api/coach/batches', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch batches');
      return response.json();
    },
  });

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {dashboardData?.coachName}</h1>
        <p className="text-gray-600 mt-2">Here's your coaching overview for today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.totalStudents || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today - Marked</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {dashboardData?.todayAttendanceMarked || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today - Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {dashboardData?.todayAttendancePending || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">My Batches</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.batches || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button asChild>
            <a href="/coach/attendance">Mark Attendance Now</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/coach/batches">View My Batches</a>
          </Button>
        </CardContent>
      </Card>

      {/* My Batches */}
      <Card>
        <CardHeader>
          <CardTitle>My Batches</CardTitle>
        </CardHeader>
        <CardContent>
          {batches && batches.length > 0 ? (
            <div className="space-y-2">
              {batches.map((batch: any) => (
                <div key={batch.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{batch.name}</p>
                    <p className="text-sm text-gray-600">{batch.studentCount} students</p>
                  </div>
                  <Button size="sm" asChild>
                    <a href={`/coach/attendance?batch=${batch.id}`}>Mark Attendance</a>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No batches assigned yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

### 4. Create `client/src/pages/coach-attendance.tsx` (NEW FILE)

```typescript
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function CoachAttendance() {
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState<Record<number, string>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: batches } = useQuery({
    queryKey: ['/api/coach/batches'],
    queryFn: async () => {
      const response = await fetch('/api/coach/batches', {
        credentials: 'include'
      });
      return response.json();
    },
  });

  const { data: students } = useQuery({
    queryKey: ['/api/coach/batch-students', selectedBatch],
    queryFn: async () => {
      if (!selectedBatch) return [];
      const response = await fetch(`/api/coach/batch/${selectedBatch}/students`, {
        credentials: 'include'
      });
      return response.json();
    },
    enabled: !!selectedBatch,
  });

  const markAttendanceMutation = useMutation({
    mutationFn: async () => {
      const attendanceList = Object.entries(attendanceMap).map(([studentId, status]) => ({
        studentId: parseInt(studentId),
        status,
      }));

      const response = await fetch('/api/coach/attendance/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          batchId: selectedBatch,
          date,
          attendanceList,
        }),
      });

      if (!response.ok) throw new Error('Failed to mark attendance');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Attendance marked successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/coach/dashboard'] });
    },
  });

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Mark Attendance</h1>

      {/* Batch and Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Batch and Date</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Batch</label>
            <select
              className="w-full p-2 border rounded"
              value={selectedBatch || ''}
              onChange={(e) => setSelectedBatch(parseInt(e.target.value))}
            >
              <option value="">Select a batch</option>
              {batches?.map((batch: any) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name} ({batch.studentCount} students)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Student List */}
      {selectedBatch && students && (
        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {students.map((student: any) => (
                <div key={student.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-gray-600">{student.studentId}</p>
                      <Badge variant={student.feeStatus === 'paid' ? 'default' : 'destructive'}>
                        {student.feeStatus === 'paid' ? '💰 Paid' : '⚠️ Unpaid'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={attendanceMap[student.id] === 'present' ? 'default' : 'outline'}
                      onClick={() => setAttendanceMap({ ...attendanceMap, [student.id]: 'present' })}
                    >
                      ✓ Present
                    </Button>
                    <Button
                      size="sm"
                      variant={attendanceMap[student.id] === 'absent' ? 'destructive' : 'outline'}
                      onClick={() => setAttendanceMap({ ...attendanceMap, [student.id]: 'absent' })}
                    >
                      ✗ Absent
                    </Button>
                    <Button
                      size="sm"
                      variant={attendanceMap[student.id] === 'late' ? 'secondary' : 'outline'}
                      onClick={() => setAttendanceMap({ ...attendanceMap, [student.id]: 'late' })}
                    >
                      ⏰ Late
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => markAttendanceMutation.mutate()}>
                Submit Attendance
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const allPresent: Record<number, string> = {};
                  students.forEach((s: any) => {
                    allPresent[s.id] = 'present';
                  });
                  setAttendanceMap(allPresent);
                }}
              >
                Mark All Present
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

---

## 🔧 Implementation Steps

1. **Update App.tsx** - Add role-based routing
2. **Update Sidebar.tsx** - Show coach menu for coaches
3. **Create CoachDashboard.tsx** - Simple coach dashboard
4. **Create CoachAttendance.tsx** - Attendance marking page
5. **Rebuild frontend** - `npm run build`
6. **Test in browser** - Verify coaches see coach interface only

---

## ✅ Expected Result After Fix

### Coach Login Experience:
1. Coach logs in → Redirected to `/coach/dashboard`
2. Coach sees simple sidebar: Dashboard, My Batches, Mark Attendance
3. Coach tries to access `/students` → Blocked with message
4. Coach tries to access admin routes → Blocked

### Admin Login Experience:
1. Admin logs in → Redirected to `/` (admin dashboard)
2. Admin sees full sidebar with all features
3. No changes to admin experience

---

**Priority**: 🔴 CRITICAL  
**Impact**: HIGH - Security issue  
**Complexity**: MEDIUM - Frontend routing changes  
**Time Required**: 2-3 hours implementation + testing  

