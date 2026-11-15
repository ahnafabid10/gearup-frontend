# GearUp Dashboard Professional Redesign Plan
**Crafted strictly adhering to the `unslop` design philosophy and enterprise UI architecture**

---

## 🧭 1. Design Direction (`unslop` Core Definition)

* **Product:** GearUp is a sports and outdoor equipment rental service connecting gear providers with outdoor enthusiasts.
* **Character:** *Sturdy, grounded, utilitarian* (নির্ভরযোগ্য, টেকসই, কার্যকরী এবং পেশাদার—কোনো কৃত্রিম গ্লো বা ভাইব-কোডিং টেমপ্লেট নয়)।
* **World:** Field equipment, topographic trail maps, weather gear, durable canvas, brushed alloy, and forest pine.
* **Moments:** 
  1. **Tactile Rental Progression:** প্রতিটি অর্ডারের লাইফসাইকেল স্টেপ ট্র্যাকার (`PLACED` ➔ `CONFIRMED` ➔ `PAID` ➔ `PICKED_UP` ➔ `RETURNED`)।
  2. **Customer Action Center:** পেন্ডিং পেমেন্টের জন্য হাই-কনট্রাস্ট কুইক-অ্যাকশন কার্ড ("Pay with Stripe 💳")।
* **Signature:** মিনিমালিস্ট টেকনিক্যাল ট্রেইল-মার্ক (`↗` / `•`) এবং সুনির্দিষ্ট মোনোস্পেস স্ট্যাটাস চিপস।

---

## 🏛️ 2. Dashboard Architecture & Layout Shell

বর্তমানে ড্যাশবোর্ডটি অনুভূমিক ট্যাব এবং আলাদা আলাদা পেজে বিভক্ত। নতুন আর্কিটেকচারে এটি একটি **Persistent 2-Column Dashboard Shell** হবে:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TOPBAR: Logo [gearup↗]  |  Active Space: [ADMIN / PROVIDER / CUSTOMER]  | User Profile │
├──────────────────────┬─────────────────────────────────────────────────────────────────┤
│ LEFT SIDEBAR (260px) │ MAIN CONTENT AREA (Flex 1)                                      │
│                      │                                                                 │
│ [User Identity Card] │ [Breadcrumbs & Active Section Header]                           │
│                      │ ┌─────────────────────────────────────────────────────────────┐ │
│ ── NAVIGATION ──     │ │ Stat Cards Grid (Deliberate 4px grid spacing, no glows)     │ │
│ • Overview           │ └─────────────────────────────────────────────────────────────┘ │
│ • Section Link 1     │                                                                 │
│ • Section Link 2     │ ┌─────────────────────────────────────────────────────────────┐ │
│ • Payments [Badge 1] │ │ Primary Data Work Area (Filterable tables, CRUD, Reviews)   │ │
│                      │ │                                                             │ │
│ ── SECONDARY ──      │ │                                                             │ │
│ • Help / Guidelines  │ └─────────────────────────────────────────────────────────────┘ │
│ • Sign out           │                                                                 │
└──────────────────────┴─────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ 3. Role-Based Sidebar Navigation Map

### 👤 Customer View (`/dashboard/customer`)
* **Overview** (`icon: layout-grid`): সাম্প্রতিক বুকিং ও অ্যাক্টিভিটি সামারি।
* **My Rentals** (`icon: package`): বুক করা সরঞ্জামের বিস্তারিত তালিকা ও স্ট্যাটাস ব্যাজ।
* **Pending Payments** (`icon: credit-card` | **Badge: Pending Count**):
  * *UX Focus:* যে অর্ডারগুলো প্রোভাইডার কনফার্ম করেছে কিন্তু পেমেন্ট বাকি, সেগুলো এখানে সরাসরি ফিল্টার হবে।
  * কাস্টমার একটি ক্লিকেই সরাসরি **Stripe Payment Sheet / Checkout** সম্পন্ন করতে পারবে।
* **Equipment Reviews** (`icon: star`): রিটার্ন করা গিয়ারে রিভিউ ও রেটিং দেওয়ার তালিকা।
* **Profile & Address** (`icon: user`): কন্টাক্ট ইনফো ও ডেলিভারি/পিকআপ অ্যাড্রেস।

---

### 🏪 Provider View (`/dashboard/provider`)
* **Business Overview** (`icon: bar-chart-2`): মোট তালিকাভুক্ত সরঞ্জাম, সক্রিয় রেন্টাল ও রেভিনিউ মেট্রিক্স।
* **Equipment Inventory** (`icon: boxes`): নিজের সরঞ্জামের তালিকা, স্টক পরিবর্তন এবং এডিট/রিমুভ অ্যাকশন।
* **List New Gear** (`icon: plus-circle`): সরাসরি ইনভেন্টরি লিস্টিং ফর্ম।
* **Incoming Orders** (`icon: clipboard-list` | **Badge: New Order Count**):
  * বুকিং রিকোয়েস্ট টেবিল।
  * স্ট্যাটাস অনুযায়ী লাইভ অ্যাকশন বাটন: `Confirm`, `Mark Picked Up`, `Mark Returned`।
* **Category Suggestions** (`icon: tag`): নতুন ক্যাটাগরি সাজেস্ট করা ও এডমিন রেসপন্স ট্র্যাকিং।

---

### 🛡️ Admin View (`/dashboard/admin`)
* **Platform Health** (`icon: activity`): মোট ব্যবহারকারী, সক্রিয় সরঞ্জাম ও রেন্টাল ভলিউম।
* **User Management** (`icon: users`): সার্চ, রোল ফিল্টার, পেজিনেশন এবং এক-ক্লিকে `Suspend / Activate` বাটন।
* **Equipment Moderation** (`icon: shield`): প্ল্যাটফর্মের সমস্ত লিস্টিং তদারকি।
* **Rental Operations** (`icon: receipt`): সমস্ত রেন্টাল লেনদেন ও অর্ডার লাইফসাইকেল মনিটরিং।
* **Category Master** (`icon: folder-tree`): ক্যাটাগরি তৈরি, রিনেম, এক্টিভেশন এবং প্রোভাইডার সাজেশন অনুমোদন/প্রত্যাখ্যান।

---

## 🎨 4. Unslopping Passes (9-Pass Execution Plan)

### Pass 1: Spacing & Rhythm
* **৪-পিক্সেল গ্রিড:** সাইডবার প্রস্থ ২৬০px, সাইডবার আইটেম হাইট ৩৬px, আইটেমগুলোর মাঝখানের গ্যাপ ৪px।
* **প্যাডিং টিয়ার:** ড্যাশবোর্ড কন্টেইনার ২৪px প্যাডিং, কার্ডসমূহ ২০px, টেবিল সেল ১২px × ১৬px।

### Pass 2: Color & Contrast (Quiet Chrome)
* **নিউট্রাল র্যাম্প:** স্লেট-গ্রাফাইট র্যাম্প (`#fbfcfb` ব্যাকগ্রাউন্ড, `#ffffff` সারফেস, `#191c19` প্রাইমারি টেক্সট, `#5f665e` সেকেন্ডারি টেক্সট)।
* **একসেন্ট কালার:** ডিপ ফরেস্ট পাইন (`#2e5233` / `#355a38`)—শুধুমাত্র সিলেক্টেড রুট এবং প্রাইমারি বাটনে সীমিত থাকবে।
* **কোনো এআই স্লপ নয়:** কোনো পার্পল নিয়ন গ্রেডিয়েন্ট, গ্লোয়িং বর্ডার বা রঙিন ব্যাকগ্রাউন্ড ওয়াশ থাকবে না। বর্ডারগুলো হবে শান্ত হেয়ারলাইন (`1px solid #e2e6e1`)।

### Pass 3: Icons
* কোনো অসংলগ্ন ইমোজি নয়। প্রতিটি রুটের জন্য নির্ধারিত ১৬px × ১৬px সুনির্দিষ্ট লাইন আইকন (১.৫ স্ট্রোক)।
* আইকন কনটেইনারের প্রস্থ ২০px এবং টেক্সট লেবেলের দূরত্ব ১০px ফিক্সড থাকবে, যাতে সবগুলো টেক্সট নিখুঁত ভার্টিক্যাল লাইনে থাকে।

### Pass 4: Copy & Micro-Interactions
* কোনো অতিরঞ্জিত মার্কেটিং বুলি নয়। বাটন টেক্সট হবে সরাসরি ও সুস্পষ্ট:
  * "Pay with Stripe ↗" (কাস্টমারের জন্য)
  * "Confirm Reservation" (প্রোভাইডারের জন্য)
  * "Mark Picked Up" ও "Mark Returned"
* প্রতিটি অ্যাকশনে `src/components/shared/toast.tsx`-এর মাধ্যমে মার্জিত ফিডব্যাক নোটিফিকেশন।

### Pass 5: Typography
* পরিষ্কার টাইপোগ্রাফিক স্কেল: ১২px (মেটাডেটা ও ব্যাজ), ১৪px (সাইডবার মেনু ও টেবিল ডেটা), ১৮px (কার্ড হেডিং), ২৩px (ড্যাশবোর্ড পেজ টাইটেল)।

### Pass 6: Layout & Responsive Drawer
* **Desktop:** ফিক্সড লেফট সাইডবার যা স্ক্রোল করার সময়ও স্থির থাকবে।
* **Mobile / Tablet:** সাইডবারটি লুকানো থাকবে; উপরে হ্যামবার্গার আইকন চাপলে মসৃণ সাইড-ড্রয়ার (Off-canvas Drawer) হিসেবে ওপেন হবে।

### Pass 7: Details & States
* অ্যাক্টিভ রুটের জন্য সাবটল ব্যাকগ্রাউন্ড শিফট (`#eef3ec`) এবং ৩px লেফট বর্ডার পাইন অ্যাকসেন্ট।
* স্ট্যাটাস ব্যাজের ক্ষেত্রে স্পেসিফিকেশনের নির্ধারিত কালার প্যালেট বজায় রাখা হবে (`PLACED` অ্যাম্বার, `CONFIRMED` ব্লু, `PAID` পার্পল, `PICKED_UP` গ্রিন, `RETURNED` গ্রে, `CANCELLED` রেড)।

### Pass 8: Visuals & Data Density
* গিয়ার আইটেমগুলোর জন্য সুনির্দিষ্ট থাম্বনেইল ভিউ।
* এম্পটি স্টেটগুলোর জন্য পরিষ্কার নির্দেশনামূলক বার্তা (যেমন: "No pending payments. You're all settled up!").

### Pass 9: Motion
* কোনো স্লো বা বাউন্সি অ্যানিমেশন নয়। ড্রয়ার ও মোডালের জন্য ট্রানজিশন হবে ১৫০ms ইজ-ইন-আউট।

---

## 🛠️ 5. Implementation Roadmap (ফাইল তৈরির পরিকল্পনা)

1. **`src/components/layout/dashboard-sidebar.tsx`**
   * রোল অনুযায়ী রুট কনফিগ (`customerNav`, `providerNav`, `adminNav`)।
   * ইউজারের নাম, ইমেইল, রোল ব্যাজ এবং সাইনআউট বাটন।
2. **`src/components/layout/dashboard-shell.tsx`**
   * ২-কলাম গ্রিড লেআউট র‍্যাপার (ডেস্কটপ সাইডবার + মোবাইল ড্রয়ার + মেইন কন্টেন্ট উইন্ডো)।
3. **`src/app/dashboard/[role]/layout.tsx`**
   * বিদ্যমান সার্ভার-সাইড রোল ভ্যালিডেশন বজায় রেখে কনটেন্টকে `DashboardShell`-এর ভেতর রেন্ডার করা।
4. **`src/features/dashboard/dashboard.tsx`**
   * অনুভূমিক ট্যাবের পরিবর্তে সাইডবার রুটের সাথে সিঙ্ক করা।
   * কাস্টমার পেমেন্টের জন্য ডেডিকেটেড হাইলাইট সেকশন তৈরি করা যাতে সরাসরি স্ট্রাইপ পেমেন্টে যাওয়া যায়।
5. **`src/app/globals.css`**
   * `unslop` টোকেন মেনে সাইডবার, ড্রয়ার ও প্রফেশনাল টেবিলের ডেডিকেটেড সিএসএস স্টাইলিং।

---
*Created for GearUp Frontend — Ready for implementation upon your approval.*
