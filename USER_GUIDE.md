# LabChain User Guide

## What is LabChain?

LabChain is a **reproducibility and collaboration platform for scientific experiments**. It helps researchers:

- 📝 **Document experiments** with structured protocols
- 🔄 **Share and replicate** research with others
- ✅ **Verify results** with cryptographic hashing
- 👥 **Collaborate in real-time** on experiments
- 📊 **Track versions** and replication attempts
- 🎤 **Capture notes** using voice-to-text

Think of it as a "GitHub for scientific experiments" with real-time collaboration features.

---

## Key Features

### 1. **Experiment Management**

- Create, view, edit, and delete experiments
- Organize experiments by status (draft, active, completed, archived)
- Track experiment versions and changes
- View experiment history and replication attempts

### 2. **Protocol Builder**

- Build structured experiment protocols
- Drag-and-drop interface for organizing steps
- Voice-to-text note capture
- Automatic protocol standardization using ML

### 3. **Real-Time Collaboration**

- See who's viewing an experiment (presence indicators)
- Real-time cursor tracking
- Instant updates when others make changes
- Collaborative editing

### 4. **Verification & Reproducibility**

- Cryptographic hashing of experiment data
- Digital signatures for verification
- Track replication attempts
- Version control for protocols

### 5. **Voice Notes**

- Hands-free note-taking using browser speech recognition
- Automatic saving of notes
- Convert voice to structured protocol steps

---

## How to Use LabChain

### Getting Started

#### 1. **Create an Account**

- Go to the homepage
- Click "Get started" or "Sign Up"
- Enter your:
  - Name
  - Email address
  - Password (minimum 6 characters)
- Click "Register"

#### 2. **Log In**

- Click "Sign in" on the homepage
- Enter your email and password
- You'll be redirected to your dashboard

---

### Dashboard

The dashboard is your main workspace where you can:

- **View all your experiments** in a list
- **Filter by status**: All, Draft, Active, Completed, Archived
- **Create new experiments** using the "New Experiment" button
- **Navigate to experiment details** by clicking on any experiment card

**To create a new experiment:**

1. Click the "New Experiment" button
2. Enter a title for your experiment
3. Click "Create Experiment"
4. You'll be taken to the experiment detail page

---

### Experiment Detail Page

This is where you view and manage a single experiment.

**What you can see:**

- Experiment title and status
- Owner information
- Protocol (structured experiment steps)
- Version number
- Creation and update timestamps

**Navigation:**

- Click "← Back" to return to the dashboard
- Click "Notebook" to access the notebook/voice notes feature

---

### Creating/Editing Experiments

#### Creating a New Experiment:

1. From the dashboard, click "New Experiment"
2. Enter a title (required)
3. Click "Create Experiment"
4. The experiment starts as a "draft" status

#### Editing an Experiment:

- Currently, you can view experiments
- Full editing features can be added to update title, protocol, and status
- Changes are tracked with version numbers

---

### Experiment Notebook

The notebook feature allows you to:

1. **Take Voice Notes:**
   - Click the microphone button
   - Speak your notes (browser will transcribe)
   - Notes are automatically saved
   - Convert voice notes to structured protocol steps

2. **View Notes:**
   - See all saved notes for the experiment
   - Notes are linked to the experiment

3. **Protocol Building:**
   - Use the protocol builder to structure your experiment
   - Drag and drop steps
   - Organize your experimental procedure

**To use voice notes:**

1. Navigate to an experiment
2. Click "Notebook" in the navigation
3. Click the microphone icon
4. Allow browser microphone access
5. Start speaking - your words will appear as text
6. Notes are automatically saved

---

### Real-Time Collaboration

When multiple users view the same experiment:

- **Presence indicators** show who's currently viewing
- **Cursor tracking** shows where others are looking
- **Live updates** when someone makes changes
- **Notifications** when experiments are updated

**How it works:**

- Just open an experiment - collaboration is automatic
- You'll see other users' presence in real-time
- Changes sync automatically across all viewers

---

### Experiment Statuses

Experiments can have different statuses:

- **Draft**: Work in progress, not yet started
- **Active**: Experiment is currently running
- **Completed**: Experiment is finished
- **Archived**: Old experiment, kept for reference

**To filter by status:**

- Use the dropdown on the dashboard
- Select the status you want to see
- Only experiments with that status will be displayed

---

### Verification & Reproducibility

LabChain helps ensure your experiments are reproducible:

1. **Version Control:**
   - Every change creates a new version
   - See the history of all changes
   - Compare different versions

2. **Cryptographic Verification:**
   - Experiments are hashed (SHA-256)
   - Digital signatures verify authenticity
   - Prevents tampering with results

3. **Replication Tracking:**
   - Record when others try to replicate your experiment
   - Track success/failure of replications
   - Build confidence in your results

---

## Common Workflows

### Workflow 1: Creating and Documenting an Experiment

1. **Create the experiment:**
   - Dashboard → "New Experiment"
   - Enter title → Create

2. **Add protocol details:**
   - Go to experiment detail page
   - Use protocol builder or notebook
   - Add structured steps

3. **Take notes:**
   - Click "Notebook"
   - Use voice-to-text for hands-free notes
   - Notes are auto-saved

4. **Update status:**
   - Change from "draft" to "active" when starting
   - Mark as "completed" when done

### Workflow 2: Collaborating on an Experiment

1. **Share experiment ID** with collaborators
2. **They navigate** to `/experiments/[id]`
3. **Real-time collaboration** begins automatically:
   - See each other's presence
   - View changes as they happen
   - Cursor positions are visible

### Workflow 3: Replicating an Experiment

1. **Find the experiment** you want to replicate
2. **View the protocol** and all details
3. **Create a replication attempt** (feature can be extended)
4. **Record your results**
5. **Compare with original** experiment

---

## Technical Details

### Authentication

- Uses JWT (JSON Web Tokens) for secure authentication
- Tokens expire after 7 days
- Stored securely in browser

### Data Storage

- MongoDB database stores all experiments
- Real-time features use Socket.io
- ML features use Next.js serverless functions

### Security

- Passwords are hashed (bcrypt)
- API endpoints require authentication
- CORS protection for API access

---

## Tips & Best Practices

1. **Use descriptive titles** for experiments
2. **Keep protocols structured** - use the protocol builder
3. **Take notes regularly** - voice notes make it easy
4. **Update status** as you progress through experiments
5. **Use version control** - don't worry about making mistakes
6. **Collaborate openly** - share experiments with team members
7. **Verify important results** - use the verification features

---

## Troubleshooting

### Can't log in?

- Check your email and password
- Make sure you've registered first
- Clear browser cache if needed

### Voice notes not working?

- Allow microphone access in browser
- Check browser compatibility (Chrome, Edge, Safari work best)
- Ensure you're on HTTPS (required for microphone access)

### Real-time features not working?

- Check that the socket server is running
- Verify your connection to the server
- Check browser console for errors

### Can't see experiments?

- Make sure you're logged in
- Check if filters are applied
- Verify you have created experiments

---

## API Endpoints (For Developers)

If you want to integrate with LabChain programmatically:

- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Get authentication token
- `GET /api/auth/me` - Get current user info
- `GET /api/experiments` - List experiments
- `POST /api/experiments` - Create experiment
- `GET /api/experiments/[id]` - Get experiment details
- `PATCH /api/experiments/[id]` - Update experiment
- `POST /api/experiments/[id]/notes` - Save notes
- `POST /api/ml/standardize-protocol` - Standardize protocol text
- `POST /api/verify/stamp` - Create verification stamp

---

## Future Features (Roadmap)

- Advanced protocol builder with templates
- File attachments for experiments
- Advanced search and filtering
- Export experiments to PDF/JSON
- Integration with lab equipment
- Blockchain anchoring for verification
- Team workspaces and permissions
- Experiment templates library

---

## Need Help?

- Check the README.md for technical setup
- Review low-level-design.md for architecture details
- Open an issue on GitHub for bugs or feature requests

---

## Quick Reference

| Action             | How To                               |
| ------------------ | ------------------------------------ |
| Create account     | Homepage → "Get started"             |
| Log in             | Homepage → "Sign in"                 |
| Create experiment  | Dashboard → "New Experiment"         |
| View experiment    | Click on experiment card             |
| Take voice notes   | Experiment → "Notebook" → Microphone |
| Filter experiments | Dashboard → Status dropdown          |
| Collaborate        | Just open an experiment (automatic)  |

---

**LabChain makes scientific research more transparent, reproducible, and collaborative!**
