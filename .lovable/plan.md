

## Plan: App Marketplace with Full LMS App Flow

### Overview
Add an "App Marketplace" nav item under TOOLS in the sidebar. Create a marketplace page inspired by Razorpay's app store (screenshot reference) with education-focused apps. Build a complete Course Graphy LMS app with create course, manage students, and give access flows. Installed apps appear in the sidebar.

### New Files

1. **`src/pages/AppMarketplace.tsx`** — Marketplace listing page
   - Grid of app cards (like the Razorpay screenshot): icon, name, category, description, arrow CTA
   - Categories filter (All, LMS, Communication, Automation, Analytics)
   - Search bar
   - Apps: Course Graphy (LMS), Teachable, Thinkific, LearnDash, WhatsApp Business, Mailchimp, Google Analytics
   - Click card → app detail page

2. **`src/pages/AppDetail.tsx`** — App detail/overview page
   - Hero with app icon, name, category, description
   - Screenshots carousel (mock placeholder images)
   - Features list, pricing info, "Install" button
   - On install → store in localStorage, toast confirmation, add to sidebar

3. **`src/pages/apps/CourseGraphyApp.tsx`** — Full LMS app (post-install)
   - Tabs: Dashboard, Courses, Students
   - **Dashboard**: stats (total courses, students, revenue)
   - **Courses tab**: list of courses with create course dialog (name, description, price, modules). Each course expandable to show modules/lessons
   - **Students tab**: list of students, "Add Student" dialog (name, email, select course to enroll). Show enrolled courses per student, toggle access

### Modified Files

4. **`src/components/layout/DashboardSidebar.tsx`**
   - Add "App Store" nav item under TOOLS with `ShoppingBag` icon
   - Dynamically read installed apps from localStorage and render them below TOOLS section as a new "INSTALLED APPS" collapsible section

5. **`src/App.tsx`**
   - Add routes: `/app-marketplace`, `/app-marketplace/:appId`, `/apps/course-graphy`

### Data & State
- All state in localStorage (`marketplace-installed-apps`, `course-graphy-courses`, `course-graphy-students`)
- Installed apps list drives sidebar rendering

### Education Apps in Marketplace (mock data)
| App | Category | Description |
|-----|----------|-------------|
| Course Graphy | LMS | Full course hosting, student management, certificates |
| Teachable | LMS | Create and sell online courses |
| Thinkific | LMS | Build, market, and sell courses |
| Podia | LMS + Membership | Courses, memberships, digital downloads |
| WhatsApp Business | Communication | Student notifications via WhatsApp |
| Mailchimp | Email Marketing | Email campaigns for students |

### Course Graphy LMS — Detailed Flow
- **Create Course**: Name, description, price, thumbnail, add modules (title + lessons)
- **Manage Students**: Table with name, email, enrolled courses, access status. Add student dialog with course selection
- **Give Access**: Toggle switch per student-course to grant/revoke access

