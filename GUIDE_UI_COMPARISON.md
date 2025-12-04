# Guide vs UI Comparison

This document compares the steps in `EXPERIMENT_GUIDE.md` with the actual UI implementation.

## ✅ **MATCHES - Features that work as described**

### Step 1: Create Experiment ✅

- **Guide says:** Dashboard → New Experiment
- **UI has:** ✅ "New Experiment" button on dashboard
- **Status:** ✅ **MATCHES**

### Step 4: Voice Notes ✅

- **Guide says:** Open Notebook tab → Click microphone
- **UI has:** ✅ "📓 Notebook" button → Separate page with "🎤 Start Voice Input" button
- **Status:** ✅ **MATCHES** (but it's a separate page, not a tab)

### Step 6: Update Status ✅

- **Guide says:** Use Status dropdown
- **UI has:** ✅ Status dropdown in edit mode (Draft, Active, Completed, Archived)
- **Status:** ✅ **MATCHES**

### Step 8: Replication Attempts ✅

- **Guide says:** Go to Replication Attempts → Start Replication Attempt
- **UI has:** ✅ "🔄 Replications" button → Separate page with "Start Replication" button
- **Status:** ✅ **MATCHES** (but it's a separate page)

### Step 9: Verification ✅

- **Guide says:** Open Verification section → Create Verification Stamp
- **UI has:** ✅ "🔒 Create Verification Stamp" button at bottom of experiment page
- **Status:** ✅ **MATCHES**

### Step 10: Real-time Collaboration ✅

- **Guide says:** Share experiment → See presence, cursors, live sync
- **UI has:** ✅ Presence indicators showing "X people viewing this experiment"
- **Status:** ✅ **MATCHES** (presence works, cursors may need socket server)

---

## ⚠️ **PARTIALLY MATCHES - Features that exist but work differently**

### Step 2: Visual Builder ⚠️

- **Guide says:** Open experiment → Click "Visual Builder" button
- **UI has:** ❌ **NO "Visual Builder" button on experiment page**
- **What exists:** "✏️ Edit Protocol" button (uses old ProtocolBuilderEnhanced, not the new visual builder)
- **Visual Builder exists at:** `/protocols/[id]/builder` (but no link to it from experiment page)
- **Status:** ⚠️ **NEEDS FIX** - Add link to Visual Builder

### Step 7: Notes Section ⚠️

- **Guide says:** Use "Notes" section on experiment page
- **UI has:** ❌ **No separate "Notes" section on main experiment page**
- **What exists:** Notes are only in the Notebook tab (separate page)
- **Status:** ⚠️ **DIFFERENT** - Guide should say "Notes are in Notebook tab"

---

## ❌ **MISSING - Features mentioned in guide but not in UI**

### Step 3: Experiment Image Upload ❌

- **Guide says:** Scroll to "Experiment Image" → Upload image
- **UI has:** ❌ **No ImageUpload component on experiment page**
- **Status:** ❌ **MISSING** - Need to add ImageUpload to experiment page

### Step 5: Attachments ❌

- **Guide says:** Upload attachments (gel images, screenshots, etc.)
- **UI has:** ❌ **No attachments section on experiment page**
- **Status:** ❌ **MISSING** - Need to add attachments section

### Step 11: Protocol History ❌

- **Guide says:** View Protocol History to compare versions
- **UI has:** ❌ **No UI for viewing/comparing protocol versions**
- **Status:** ❌ **MISSING** - Version numbers exist but no history view

---

## 📝 **Summary of Required Fixes**

### **Critical (Guide doesn't match UI):**

1. **Add Visual Builder Link**
   - Location: Experiment page, Protocol section
   - Action: Add "🎨 Visual Builder" button next to "✏️ Edit Protocol"
   - Link to: `/protocols/${id}/builder`

2. **Add Experiment Image Upload**
   - Location: Experiment page, top section
   - Component: Use existing `ImageUpload` component
   - Save to: `experiment.image` field

3. **Add Attachments Section**
   - Location: Experiment page, after image section
   - Component: Use existing `ImageUpload` component (multiple)
   - Save to: `experiment.attachments` array

4. **Add Notes Section (or update guide)**
   - Option A: Add notes section to main experiment page
   - Option B: Update guide to clarify notes are in Notebook tab

5. **Add Protocol History View**
   - Location: Protocol section
   - Show: Version dropdown or history panel
   - Feature: Compare versions side-by-side

---

## 🔧 **Quick Fixes Needed**

### **Fix 1: Add Visual Builder Button**

In `src/app/experiments/[id]/page.tsx`, add this button in the Protocol section:

```tsx
<Link
  href={`/protocols/${id}/builder`}
  className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
>
  🎨 Visual Builder
</Link>
```

### **Fix 2: Add Image Upload**

Add ImageUpload component to experiment page (already exists in codebase).

### **Fix 3: Add Attachments**

Add attachments section with ImageUpload component for multiple files.

### **Fix 4: Update Guide**

If we don't add separate Notes section, update guide to say:

- "Notes are in the Notebook tab (click 📓 Notebook button)"

---

## ✅ **What Works Perfectly**

- ✅ Experiment creation
- ✅ Voice notes (in Notebook tab)
- ✅ Status updates
- ✅ Replication tracking (in Replications page)
- ✅ Verification stamps
- ✅ Real-time presence
- ✅ Protocol editing (basic version)

---

## 🎯 **Recommendation**

**Option 1: Fix UI to match guide (Recommended)**

- Add Visual Builder link
- Add Image upload
- Add Attachments section
- Add Notes section (or clarify in guide)

**Option 2: Update guide to match current UI**

- Remove references to Visual Builder button
- Clarify that Notes are in Notebook tab
- Remove Image and Attachments sections
- Add note about separate pages (Notebook, Replications)

**I recommend Option 1** - the features exist in the codebase, they just need to be connected to the UI.
