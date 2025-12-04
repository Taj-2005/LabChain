# LabChain Experiment Guide

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

1. On the experiment page, click **"🎨 Visual Builder"** button
2. You'll see the visual protocol builder with drag-and-drop blocks

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
- Add another reagent block:
  - **Chemical Name:** `Forward Primer (10μM)`
  - **Quantity:** `2`
  - **Unit:** `μl`
- Add another:
  - **Chemical Name:** `Reverse Primer (10μM)`
  - **Quantity:** `2`
  - **Unit:** `μl`
- Add another:
  - **Chemical Name:** `Template DNA (50ng/μl)`
  - **Quantity:** `1`
  - **Unit:** `μl`
- Add another:
  - **Chemical Name:** `Nuclease-free Water`
  - **Quantity:** `20`
  - **Unit:** `μl`

**Block 3: Temperature Step - Initial Denaturation**

- Click **"+ Temperature"** button
- Fill in:
  - **Label:** `Initial Denaturation`
  - **Temperature:** `95`
  - **Duration:** `300` (5 minutes)

**Block 4: Text Step - PCR Cycling**

- Click **"+ Text Step"** button
- Enter content:
  ```
  Perform 35 cycles of:
  - Denaturation: 95°C for 30 seconds
  - Annealing: 58°C for 30 seconds
  - Extension: 72°C for 45 seconds
  ```

**Block 5: Temperature Step - Final Extension**

- Click **"+ Temperature"** button
- Fill in:
  - **Label:** `Final Extension`
  - **Temperature:** `72`
  - **Duration:** `600` (10 minutes)

**Block 6: Temperature Step - Hold**

- Click **"+ Temperature"** button
- Fill in:
  - **Label:** `Hold`
  - **Temperature:** `4`
  - **Duration:** (leave empty - indefinite)

**Block 7: Timer Step - Cooling**

- Click **"+ Timer"** button
- Fill in:
  - **Label:** `Cool to room temperature`
  - **Duration:** `1800` (30 minutes)

**Block 8: Text Step - Storage**

- Click **"+ Text Step"** button
- Enter content:
  ```
  Store PCR products at -20°C until gel electrophoresis analysis
  ```

#### **Use AI Suggestions:**

- Click **"Suggest Improvements (AI)"** button
- Review suggestions (e.g., missing durations, standard temperatures)
- Click **"Accept"** on relevant suggestions or **"Accept All"**

#### **Reorder Blocks (Drag & Drop):**

- Drag blocks up/down to reorder
- The order automatically saves

#### **Save & Exit:**

- Changes autosave automatically (watch for "Protocol saved" toast)
- Click **"← Back"** to return to experiment page

---

### **Step 3: Add Experiment Image**

1. On the experiment detail page, scroll to **"Experiment Image"** section
2. Click the upload area or drag an image
3. Upload a photo (e.g., your PCR setup, gel electrophoresis result)
4. Image automatically saves to Cloudinary

---

### **Step 4: Take Voice Notes (Real-time Notebook)**

1. Click **"Notebook"** tab in the experiment page
2. Click the **microphone icon** to start recording
3. Speak your observations:

   **Example Voice Note:**

   ```
   "Started PCR at 2:30 PM. All reagents were thawed and mixed on ice.
   Master mix appeared clear with no visible contamination.
   Template DNA concentration verified at 52 ng per microliter using
   Nanodrop. Thermal cycler pre-heated to 95 degrees Celsius.
   Program started successfully."
   ```

4. Click **"Stop Recording"**
5. The voice note is automatically transcribed and saved
6. You can also type notes manually in the text area

---

### **Step 5: Add Attachments**

1. Scroll to **"Attachments"** section
2. Click upload area
3. Upload files such as:
   - Gel electrophoresis images
   - Nanodrop readings (screenshots)
   - Lab notebook pages (photos)
   - Data spreadsheets
4. Multiple attachments can be added
5. Click **"X"** on any attachment to remove it

---

### **Step 6: Update Experiment Status**

1. Find the **"Status"** dropdown
2. Change status as you progress:
   - `Draft` → When planning
   - `Active` → When running the experiment
   - `Completed` → When finished
   - `On Hold` → If paused
   - `Failed` → If something went wrong

---

### **Step 7: Document Observations (Notes Section)**

1. Scroll to **"Notes"** section
2. Type detailed observations:

   **Example Notes:**

   ```
   Date: 2024-01-15
   Time Started: 2:30 PM

   Observations:
   - All reagents were at room temperature before mixing
   - No bubbles observed in master mix after vortexing
   - Thermal cycler lid closed properly, no condensation
   - Program completed without errors at 3:45 PM

   Issues:
   - None observed

   Next Steps:
   - Run gel electrophoresis to verify amplification
   - Quantify PCR product using Qubit
   ```

3. Notes autosave as you type

---

### **Step 8: Track Replication Attempts**

1. Scroll to **"Replication Attempts"** section
2. Click **"Start Replication Attempt"** button
3. Fill in the form:
   - **Notes:**
     ```
     Replication attempt #1
     Date: 2024-01-16
     Replicated by: [Your Name]
     Changes made: Used different thermal cycler (Bio-Rad T100)
     ```
   - **Status:** `In Progress` (or `Completed` if done)
4. Click **"Save Replication"**
5. The attempt appears in the list with timestamp

---

### **Step 9: Verify Experiment (Cryptographic Verification)**

1. Scroll to **"Verification"** section
2. Click **"Create Verification Stamp"** button
3. This creates a cryptographic hash of your experiment data
4. You'll receive:
   - **Verification ID:** (unique identifier)
   - **Hash:** (SHA-256 hash of experiment data)
   - **Timestamp:** (when verified)
5. Save this information for future reference
6. Use **"Verify Stamp"** to verify the integrity later

---

### **Step 10: Collaborate (Real-time Features)**

1. **Share the experiment** with collaborators (they need accounts)
2. When they open the experiment:
   - You'll see their **presence** (green dot indicator)
   - Their **cursor position** is shown in real-time
   - **Live updates** appear as they make changes
3. Multiple users can edit simultaneously
4. Changes sync automatically via Socket.io

---

### **Step 11: View Protocol History**

1. The protocol builder automatically creates versions
2. Each time you save, version number increments
3. View version history in the protocol section
4. Compare versions to see what changed

---

## 🎯 **Complete Experiment Checklist**

- [ ] Experiment created with title and description
- [ ] Protocol built using visual builder (all block types used)
- [ ] Experiment image uploaded
- [ ] Voice notes recorded during experiment
- [ ] Manual notes added with observations
- [ ] Attachments uploaded (gel images, data files)
- [ ] Status updated to reflect current state
- [ ] Replication attempts documented
- [ ] Verification stamp created
- [ ] Collaborators invited (if applicable)

---

## 💡 **Tips for Best Results**

1. **Use Voice Notes During Experiment:**
   - Record observations in real-time
   - Don't wait until the end
   - Speak clearly and mention timestamps

2. **Take Photos:**
   - Before starting (setup)
   - During critical steps
   - After completion (results)

3. **Be Detailed in Notes:**
   - Include exact quantities
   - Note any deviations from protocol
   - Document unexpected observations

4. **Use AI Suggestions:**
   - Helps standardize protocols
   - Suggests missing values
   - Improves reproducibility

5. **Update Status Regularly:**
   - Helps track experiment progress
   - Makes it easy to filter experiments
   - Useful for project management

6. **Document Replications:**
   - Note any changes made
   - Compare results
   - Build on previous attempts

---

## 🔬 **Example: Complete Protocol Structure**

```
1. [Equipment] Thermal Cycler Setup
2. [Reagent] PCR Master Mix (25μl)
3. [Reagent] Forward Primer (2μl)
4. [Reagent] Reverse Primer (2μl)
5. [Reagent] Template DNA (1μl)
6. [Reagent] Nuclease-free Water (20μl)
7. [Temperature] Initial Denaturation: 95°C for 5 min
8. [Text] PCR Cycling (35 cycles)
9. [Temperature] Final Extension: 72°C for 10 min
10. [Temperature] Hold: 4°C
11. [Timer] Cool to room temperature (30 min)
12. [Text] Storage instructions
```

---

## 📊 **Sample Data to Record**

### **Before Starting:**

- Template DNA concentration
- Primer sequences
- Expected product size
- Reagent lot numbers

### **During Experiment:**

- Exact mixing times
- Temperature readings
- Any equipment issues
- Time stamps for each step

### **After Completion:**

- PCR product appearance
- Gel electrophoresis results
- Quantification data
- Any unexpected results

---

## 🚨 **Common Issues & Solutions**

**Issue:** Protocol not saving

- **Solution:** Check internet connection, ensure you're logged in

**Issue:** Voice notes not working

- **Solution:** Allow microphone permissions in browser

**Issue:** Images not uploading

- **Solution:** Check file size (max 5MB), ensure it's an image format

**Issue:** Can't see collaborator cursors

- **Solution:** Ensure socket server is running on port 3001

---

## 📝 **Next Steps After This Experiment**

1. **Analyze Results:**
   - Review gel electrophoresis images
   - Quantify PCR products
   - Compare with expected results

2. **Plan Next Experiment:**
   - Use this as a template
   - Modify protocol based on results
   - Create new experiment for optimization

3. **Share Results:**
   - Export experiment data
   - Share with team
   - Publish findings

---

**Happy Experimenting! 🧪**

This guide demonstrates all major features of LabChain. Feel free to adapt this workflow to your specific research needs.
