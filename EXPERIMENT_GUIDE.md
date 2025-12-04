# LabChain Experiment Guide (Updated to Match UI)

## Sample Experiment: PCR Amplification of DNA

This guide walks you through creating and managing a complete experiment in LabChain, demonstrating all key features.

---

## 📋 **Experiment Overview**

**Title:** PCR Amplification of Beta-Actin Gene from Human DNA  
**Objective:** Amplify a 200bp fragment of the beta-actin gene using polymerase chain reaction  
**Expected Duration:** 3-4 hours

---

## 🚀 **Step-by-Step Workflow**

### **Step 1: Create the Experiment**

1. **Log in** to LabChain
2. Go to **Dashboard** → Click **"New Experiment"**
3. Fill in the form:
   - **Title:** `PCR Amplification of Beta-Actin Gene`
   - **Status:** `Draft` (will change to `Active` when you start)
   - **Image (Optional):** Upload a photo of your lab setup or sample
4. Click **"Create Experiment"**

---

### **Step 2: Build the Protocol (Visual Builder)**

1. On the experiment page, scroll to the **Protocol** section
2. Click the **🎨 Visual Builder** button (next to "✏️ Edit Protocol")
3. You'll be taken to the visual protocol builder page at `/protocols/[id]/builder`
4. Use drag-and-drop blocks to construct the protocol

#### **Add Protocol Blocks:**

**Block 1: Equipment Setup**

- Click **"+ Equipment"** button
- In the inspector panel (right side):
  - **Equipment Name:** `Thermal Cycler (Applied Biosystems 2720)`
  - **Notes:** `Pre-heat to 95°C before use`
- Click **"Save Changes"**

**Block 2: Reagent Preparation**

- Click **"+ Reagent"** button
- Fill in:
  - **Chemical Name:** `PCR Master Mix (2X)`
  - **Quantity:** `25`
  - **Unit:** `μl`
- Add more reagent blocks as needed

**Block 3: Temperature Steps**

- Click **"+ Temperature"** button
- Fill in temperature, duration, and optional label

**Block 4: Text Steps**

- Click **"+ Text Step"** button
- Enter detailed instructions

**Block 5: Timer Steps**

- Click **"+ Timer"** button
- Set duration and optional label

#### **Use AI Suggestions:**

- Click **"Suggest Improvements (AI)"** button
- Review recommendations (e.g., missing durations, temperatures)
- Accept individually or **Accept All**

#### **Reorder Blocks:**

- Drag blocks up/down to reorder
- Changes autosave automatically

#### **Save & Exit:**

- Changes autosave automatically (watch for "Protocol saved" toast)
- Click **"← Back"** to return to experiment page

---

### **Step 3: Upload Experiment Image**

1. On the experiment page, scroll to the **Experiment Image** section (at the top, before the title section)
2. Click the upload area or drag-and-drop an image
3. Image is automatically saved to Cloudinary
4. The image will appear as a preview once uploaded
5. **Note:** This section is only visible to the experiment owner

---

### **Step 4: Add Voice Notes**

1. On the experiment page, click the **📓 Notebook** button (top right)
2. You'll be taken to the Notebook page at `/experiments/[id]/notebook`
3. Click **🎤 Start Voice Input** button to begin recording
4. Speak your observations (browser will transcribe automatically)
5. Example:
   ```
   Started PCR at 2:30 PM. Reagents thawed on ice. Template DNA at 52 ng/μl. Thermal cycler pre-heated to 95°C.
   ```
6. Click **⏹ Stop Recording** when done
7. The transcribed text is automatically added to your notes
8. You can also type notes manually in the text area below
9. Notes autosave every 2 seconds

---

### **Step 5: Add Attachments**

1. On the experiment page, scroll to the **Attachments** section (after Protocol section)
2. Click the upload area to add files
3. Upload multiple attachments:
   - Gel electrophoresis images
   - Nanodrop screenshots
   - Data spreadsheets
   - Lab notebook photos
4. Attachments appear in a grid layout (2-4 columns depending on screen size)
5. Hover over an attachment and click the **✕** button to delete it
6. All attachments are automatically saved
7. **Note:** This section is only visible to the experiment owner

---

### **Step 6: Update Experiment Status**

1. On the experiment page, click the **✏️ Edit** button (top right, next to status badge)
2. A dropdown will appear for **Status**
3. Select from:
   - **Draft** - Planning phase
   - **Active** - Currently running
   - **Completed** - Finished
   - **Archived** - Archived
4. Click **Save** to update
5. The status badge will update immediately

---

### **Step 7: Add Observations (Notes)**

**Note:** Notes are in the **Notebook** tab, not on the main experiment page.

1. Click the **📓 Notebook** button to go to the Notebook page
2. Type your observations in the large text area
3. Notes autosave every 2 seconds
4. Example:
   ```
   Thermal cycler program completed at 3:45 PM. No bubbles in master mix. No errors observed.
   Next: Run gel electrophoresis.
   ```

---

### **Step 8: Track Replication Attempts**

**Option 1: On Main Experiment Page**

1. Scroll to **Replication Attempts** section
2. Click **+ New Replication** button
3. Fill in the form and save

**Option 2: Dedicated Replications Page (Recommended)**

1. Click the **🔄 Replications** button (top right)
2. You'll be taken to the Replications page at `/experiments/[id]/replications`
3. Click **Start Replication** button
4. Add:
   ```
   Replication #1 — Jan 16, 2024
   Replicated by: [Your Name]
   Change: Used Bio-Rad T100 cycler
   ```
5. Click **Start Replication** (or **Update** if editing)
6. The attempt appears in the list with timestamp and status

---

### **Step 9: Verify Experiment (Cryptographic Stamp)**

1. On the experiment page, scroll to the bottom
2. Find the **🔒 Create Verification Stamp** button (bottom right, owner only)
3. Click the button
4. LabChain generates and displays:
   - **Verification ID** - Unique identifier
   - **SHA-256 Hash** - Cryptographic hash of experiment data
   - **Timestamp** - When verification was created
5. Save this information for future reference
6. Use the verification ID later to confirm data integrity

---

### **Step 10: Collaborate in Real-time**

1. When collaborators open the same experiment, you'll see:
   - **Presence indicator** at the top showing "👥 X people viewing this experiment"
   - Real-time updates when they make changes
2. Features:
   - Real-time user presence (green indicators)
   - Live updates via Socket.io
   - Multiple users can view simultaneously
3. **Note:** Socket server must be running on port 3001 for real-time features

---

### **Step 11: View Protocol History**

- Every time you save the protocol, the version number increments automatically
- The current version number is displayed at the bottom of the experiment page
- Version history is tracked in the database
- **Note:** A visual version comparison UI is planned for future releases

---

## 🎯 **Experiment Completion Checklist**

- [ ] Experiment created
- [ ] Full protocol built using Visual Builder
- [ ] Experiment image uploaded
- [ ] Voice notes recorded (in Notebook tab)
- [ ] Manual notes added (in Notebook tab)
- [ ] Attachments uploaded
- [ ] Status updated
- [ ] Replication attempts logged
- [ ] Verification stamp created
- [ ] Collaboration enabled (if needed)

---

## 💡 **Tips for Best Use**

- Record voice notes during critical steps
- Document deviations immediately
- Upload images for traceability
- Use AI suggestions to standardize protocols
- Keep statuses updated for project visibility
- Use the Visual Builder for complex protocols
- Use the basic Edit Protocol for quick text edits

---

## 🔬 **Example Final Protocol**

```
1. Equipment — Thermal Cycler
2. Reagent — PCR Master Mix (25 μl)
3. Reagent — Forward Primer (2 μl)
4. Reagent — Reverse Primer (2 μl)
5. Reagent — Template DNA (1 μl)
6. Reagent — Water (20 μl)
7. Temperature — 95°C for 5 min
8. Text — PCR Cycling (35 cycles)
9. Temperature — 72°C for 10 min
10. Temperature — 4°C hold
11. Timer — 30 min cooldown
12. Text — Storage instructions
```

---

## 🚨 **Common Issues & Fixes**

**Protocol not saving:** Check network + login status

**Voice notes not working:** Enable microphone permissions in browser

**Images not uploading:** Ensure <5MB + valid format (JPG, PNG, GIF, WEBP)

**Collaborator cursors missing:** Start socket server (port 3001)

**Visual Builder not accessible:** Ensure you're the experiment owner

---

## 📊 **Record Useful Data**

### **Before**

- DNA concentration
- Primer sequences
- Reagent lot numbers

### **During**

- Temperatures
- Mixing observations
- Timestamps

### **After**

- Gel electrophoresis results
- Product quantification
- Deviations

---

## 📍 **Navigation Quick Reference**

- **Main Experiment Page:** `/experiments/[id]`
- **Notebook:** Click **📓 Notebook** button → `/experiments/[id]/notebook`
- **Replications:** Click **🔄 Replications** button → `/experiments/[id]/replications`
- **Visual Builder:** Click **🎨 Visual Builder** button → `/protocols/[id]/builder`

---

**Happy Experimenting! 🧪**

This guide demonstrates all major features of LabChain. All steps have been verified to match the actual UI implementation.
