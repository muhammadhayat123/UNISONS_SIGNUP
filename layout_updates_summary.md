# Layout and Responsiveness Update

All requested layout and responsiveness updates have been successfully applied to the frontend:

### 1. Sidebar Header Re-layout
- Changed "Inquiry System" to "Inquiry Management System"
- Re-layouted the sidebar header to stack the application name cleanly below the UNISONS logo.
- Added subtle uppercase typography and spacing for a polished look.

### 2. Mobile Navigation & Sidebar
- **Mobile/Tablet**: Added a sticky top navigation bar (for screens `< 1024px`) that shows the logo/app name and a hamburger menu button.
- The sidebar now behaves as a **slide-over drawer** on mobile, complete with a backdrop blur and a close button inside. It no longer squishes the page layout.
- **Desktop**: The sidebar remains fixed on the left for screens `>= 1024px` as expected.

### 3. Tables & Inquiry Cards Responsiveness
- Verified and enforced that **all data tables** (`admin/admins`, `admin/sellers`, `admin/customers`, `admin/inquiries`, and the `seller/` variants) are wrapped in `overflow-x-auto` containers.
- Tables now scroll horizontally on small screens instead of breaking the layout bounds.

### 4. 10-Step Wizard & Forms Responsiveness
- Refactored the `md:grid-cols-2` and `md:grid-cols-3` classes across all forms (Company Profile) and all 10 steps of the New Inquiry Wizard.
- Grids now correctly use single-column layouts (`grid-cols-1`) on mobile and switch to multi-column (`sm:grid-cols-2` / `sm:grid-cols-3`) starting at the tablet breakpoint.
- Converted `flex` rows in the Furnace and Stands wizard steps to fully responsive grids so inputs stack vertically on mobile instead of overflowing.
- Modals like `ConfirmModal` were verified to use `max-w-md w-full` with container padding to respect the `100vw` constraint.

### 5. Dashboard Crash Fix
- Fixed the `recentInquiries.slice is not a function` error on both the Seller and Admin dashboards.
- The dashboards were incorrectly trying to slice the raw pagination object (`{ total, inquiries: [] }`). They now correctly extract the `.inquiries` array.

You can verify the updates by testing the application on a mobile device or by resizing your browser window.
