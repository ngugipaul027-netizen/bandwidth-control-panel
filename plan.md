# Implementation Plan - Navigation Structure Update

Update the `DashboardLayout.tsx` to implement a nested navigation structure as requested by the user.

## 1. Sidebar Component Refactoring (`src/components/layout/DashboardLayout.tsx`)
- Implement a hierarchical navigation data structure.
- Create a `NavItem` component that handles both single links and expandable sub-menus.
- Use `lucide-react` icons for each category:
    - Dashboard: `LayoutDashboard`
    - Customer: `Users`
    - Services: `Zap`
    - Reports: `BarChart3`
    - Hotspot: `Wifi`
    - Network: `Network`
- Use `framer-motion` for smooth sub-menu animations (expand/collapse).
- Ensure the "AvatarPamnet" brand is displayed at the top.
- Maintain mobile responsiveness using the existing `Sheet` component.

## 2. Navigation Structure
- **Dashboard** (`/admin`)
- **Customer**
    - Add Customer (`/admin/customer/add`)
- **Services**
    - Stats Revenue (`/admin/services/stats`)
    - Customer Usage (`/admin/services/usage`)
    - Internet Plan (`/admin/services/plans`)
    - GenieACS Manager (`/admin/services/genieacs`)
- **Reports**
    - Mpesa Transactions (`/admin/reports/mpesa`)
    - Payment Transactions (`/admin/reports/payments`)
    - Send Message (`/admin/reports/messages`)
- **Hotspot**
    - Hotspot Voucher (`/admin/hotspot/vouchers`)
    - Hotspot Payment Token (`/admin/hotspot/tokens`)
- **Network**
    - Radius (`/admin/network/radius`)
    - Settings (`/admin/network/settings`)
    - SMS Gateway (`/admin/network/sms`)
    - Whatsapp Gateway (`/admin/network/whatsapp`)
    - DHCP Server Leases (`/admin/network/dhcp`)
    - Hotspot Settings (`/admin/network/hotspot-settings`)
    - IP Bindings (`/admin/network/ip-bindings`)
    - PPPoE Clients (`/admin/network/pppoe`)

## 3. Visual Styling
- Use the existing blue/slate theme.
- Sub-menu items should be slightly indented and have a smaller font size/muted color.
- Active states should apply to both sub-items and parent items (if a child is active).

## 4. Verification
- Validate the sidebar renders all nested items correctly.
- Test mobile menu functionality.
- Ensure transitions are smooth.
