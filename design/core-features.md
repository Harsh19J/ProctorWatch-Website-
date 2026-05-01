# ProctorWatch: Core Features & UI Design

ProctorWatch is an AI-powered exam integrity platform designed for modern educational institutions. The application focuses on delivering high-security proctoring with an elegant, multi-tier user interface.

## 🎨 UI/UX Design System

The application employs a highly stylized, modern presentation emphasizing a professional "cyber-security" aesthetic while remaining intuitive for standard educational users.

### Color Palette Constraints
- **Light Mode (`#F8FAFF`)**: Clean, clinical interface prioritizing content legibility.
- **Dark Mode (`#09090F`)**: Deep, elevated experience prioritizing less eye strain for proctors staring at monitors.
- **Brand Gradients**: `#6C63FF` (Primary Purple) bridging to `#38BDF8` (Sky Blue) is prominently featured on actionable buttons, avatars, and hero text.

### Role-Based Color Coding
The platform serves 5 functional roles simultaneously, each color-coded for instant visual context recognition within the User Interface:
- **Admin**: `#6C63FF` (Purple) — System and User Management
- **Teacher**: `#38BDF8` (Blue) — Exam Creation and Review
- **Student**: `#4ECDC4` (Teal) — Exam Taking and Performance Context
- **Parent**: `#FFB74D` (Orange) — Viewing Performance
- **Technical**: `#FF4D6A` (Red) — Blacklisting and System Hardening

---

## 🚀 Core Platform Features

These capabilities are securely baked into the backend architecture and vividly displayed on the frontend via unified dashboards.

### 1. ArcFace Biometrics
- **UI Information**: Captured within camera-enabled modal windows with live border-color indicators reflecting authentication status.
- **Technical Capability**: Utilizes ResNet-50 face verification intertwined with liveness detection to prevent spoofing with photos or videos.

### 2. Audio Intelligence
- **UI Information**: Real-time waveform visualizers and incident flag ribbons presented during active exam review modes. 
- **Technical Capability**: Employs Voice Activity Detection (VAD) coupled with spectral acoustic analysis to detect whispers or unauthorized peripheral speakers out-of-frame.

### 3. Deep Analytics
- **UI Information**: Presented using visually engaging dashboard widgets featuring score distributions (bar charts), flag breakdowns (pie/doughnut charts), and quick-action CSV Export buttons. 
- **Technical Capability**: Stores longitudinal and cross-sectional data, calculating integrity scores contextualized per course, student, and institution limits.

### 4. Multi-Role Portals
- **UI Information**: A dynamic sidebar (animated `DashboardLayout.jsx`) that instantly collapses, auto-reconfigures its navigation array (`navConfig`), and updates application branding colors based on the `user.role` from the active JWT session.
- **Capabilities**: Isolated views ensuring privacy. Students can never see admin logs, and Teachers only see active students mapped to their courses.

## Layout Anatomy (`DashboardLayout`)
1. **Dynamic Navigation Drawer**: Responsive left-hand sidebar which automatically displays icons and paths corresponding to the specific user's tier. Accompanied by glowing tooltips on hover states.
2. **Glassmorphic AppBar**: Sticky top header carrying context names, notification triggers, and Dark Mode/Light Mode toggle buttons on a blurred translucent background.
3. **Floating Accent Orbs**: Animated radial background gradients mapping to the active Role Color, instilling a highly polished and dynamic feel on the dashboard backdrop.
