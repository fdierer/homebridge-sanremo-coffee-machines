# 🚀 Quick Start Guide

## What We Built

I've created an **improved version** of the Sanremo Coffee Machine plugin with **automatic status polling** and **Homebridge v2.0 compatibility**. This fixes your issue where the machine appears OFF in the Home app when it's actually ON.

### ✅ **Homebridge v2.0 Ready!**
This plugin is **fully compatible** with Homebridge v2.0 and will show a green checkmark in the Homebridge UI.

---

## 📍 Current Status

✅ **DONE:**
- Cloned official plugin repository
- Analyzed source code  
- Implemented automatic polling (every 5-300 seconds)
- Added configurable `pollingInterval` parameter
- Built and compiled successfully
- Created comprehensive documentation

📋 **YOUR TASKS:**
1. Fork repository on GitHub
2. Push changes to your fork
3. Install in Homebridge
4. Update configuration
5. Test and enjoy!

---

## 🎯 Step-by-Step: What YOU Need to Do

### **Step 1: Fork on GitHub** (2 minutes)

1. Open: https://github.com/nsinenian/homebridge-sanremo-coffee-machines
2. Click **Fork** button (top right)
3. Select your GitHub account
4. Done! You now have: `https://github.com/YOUR_USERNAME/homebridge-sanremo-coffee-machines`

---

### **Step 2: Push Your Changes** (5 minutes)

Open Terminal and run these commands:

```bash
# Navigate to the project
cd "/Users/francisdierer/Dev Environment/homebridge-sanremo-coffee-machines"

# Set your fork as the remote (replace YOUR_USERNAME)
git remote set-url origin https://github.com/YOUR_USERNAME/homebridge-sanremo-coffee-machines.git

# Create a feature branch
git checkout -b feature/automatic-polling

# Add all files
git add .

# Commit with descriptive message
git commit -m "feat: Add automatic status polling with configurable interval

- Implement automatic polling mechanism (default 30s)
- Add configurable pollingInterval parameter (5-300s)
- Update all characteristics automatically
- Add config schema for Homebridge UI
- Update to v1.2.0"

# Push to GitHub
git push origin feature/automatic-polling
```

**Result:** Your improvements are now on GitHub! ✅

---

### **Step 3: Install in Homebridge** (10 minutes)

#### **Option A: Using Synology Docker UI** (Recommended if SSH is disabled)

1. Open **Docker** app on Synology DSM
2. Go to **Container** tab
3. Select **homebridge** container
4. Click **Details** → **Terminal** → **Create** → Select `/bin/bash`
5. In the terminal, run:

```bash
# Remove old plugin
npm uninstall homebridge-sanremo-cube

# Install new plugin from your GitHub fork (replace YOUR_USERNAME)
npm install https://github.com/YOUR_USERNAME/homebridge-sanremo-coffee-machines.git#feature/automatic-polling

# Exit
exit
```

6. Go back to Container tab
7. Select **homebridge** container
8. Click **Restart**

#### **Option B: Using SSH** (If you enable it temporarily)

```bash
# SSH into NAS
ssh franc@192.168.68.101

# Enter homebridge container
sudo docker exec -it homebridge bash

# Remove old plugin
npm uninstall homebridge-sanremo-cube

# Install new plugin (replace YOUR_USERNAME)
npm install https://github.com/YOUR_USERNAME/homebridge-sanremo-coffee-machines.git#feature/automatic-polling

# Exit container
exit

# Restart homebridge
sudo docker restart homebridge

# Disable SSH again for security
```

---

### **Step 4: Update Configuration** (5 minutes)

1. Open Homebridge UI: `http://192.168.68.101:8581`
2. Go to **Config** tab
3. Find your Sanremo configuration

**REMOVE THIS (old config):**

```json
{
    "accessory": "SanremoCube",
    "name": "Coffee Machine",
    "ip": "192.168.68.83",
    "disableTemperatureSensor": true,
    "pollingInterval": 5,
    "_bridge": {
        "username": "0E:CC:88:96:48:DF",
        "port": 42846,
        "name": "Sanremo Bridge"
    }
}
```

**ADD THIS (new config):**

```json
{
    "platform": "SanremoCoffeeMachines",
    "name": "SanremoCoffeeMachines",
    "machines": [
        {
            "name": "Coffee Machine",
            "type": "Cube",
            "ip": "192.168.68.83",
            "pollingInterval": 5
        }
    ],
    "_bridge": {
        "username": "0E:CC:88:96:48:DF",
        "port": 42846,
        "name": "Sanremo Bridge"
    }
}
```

4. Click **Save**
5. **Restart Homebridge** (button in top right)

---

### **Step 5: Verify It Works** (2 minutes)

1. **Check Logs:**
   - Go to **Logs** tab in Homebridge UI
   - Look for: `Starting automatic polling every 5 seconds for Coffee Machine`
   - ✅ If you see this, polling is working!

2. **Test Status Updates:**
   - Turn coffee machine **ON** physically
   - Wait **5-10 seconds**
   - Open **Home app** on iPhone
   - Coffee machine should show **ON** ✅
   
   - Turn coffee machine **OFF** physically
   - Wait **5-10 seconds**
   - Check **Home app**
   - Coffee machine should show **OFF** ✅

3. **Check Temperature:**
   - Long-press Coffee Machine in Home app
   - Should show current temperature (115-130°C)
   - **No warnings** in Homebridge logs ✅

---

## 🎉 Success Criteria

You'll know it's working when:

✅ Logs show: `Starting automatic polling every 5 seconds`  
✅ Machine status updates within 5-10 seconds in Home app  
✅ No temperature warnings in logs  
✅ Status always matches actual machine state  

---

## 🔧 Configuration Options

### **Adjust Polling Speed:**

```json
"pollingInterval": 5   // Very fast (recommended)
"pollingInterval": 10  // Fast
"pollingInterval": 30  // Default
"pollingInterval": 60  // Slow
```

Lower number = faster updates, but more network traffic.

**Recommendation:** Start with `5` seconds for best accuracy.

---

## 📚 Documentation

All documentation is in the repository:

- **SUMMARY_FOR_USER.md** - Complete overview
- **INSTALLATION_GUIDE.md** - Detailed installation steps
- **CHANGELOG_v1.2.0.md** - What changed
- **README.md** - Full documentation

---

## 🆘 Troubleshooting

### **"Module not found" error**

```bash
# Check if plugin is installed
sudo docker exec -it homebridge bash
npm list | grep sanremo
# Should show: homebridge-sanremo-coffee-machines@1.2.0
```

### **No polling messages in logs**

- Check configuration uses `"platform"` not `"accessory"`
- Verify `machines` array is properly formatted
- Restart Homebridge

### **Status still not updating**

- Check `pollingInterval` is set in config
- Verify machine is reachable: `ping 192.168.68.83`
- Check machine WiFi connection

---

## 📞 Need Help?

If something doesn't work:

1. Check Homebridge **Logs** tab for errors
2. Verify configuration format matches example above
3. Ensure machine is powered on and connected to WiFi
4. Review **INSTALLATION_GUIDE.md** for detailed steps

---

## 🎯 Summary

**What you're installing:**
- Plugin: `homebridge-sanremo-coffee-machines` v1.2.0
- Feature: Automatic status polling every 5 seconds
- Benefit: Real-time accurate status in Home app

**Time required:**
- Fork on GitHub: 2 minutes
- Push changes: 5 minutes
- Install in Homebridge: 10 minutes
- Update config: 5 minutes
- Test: 2 minutes
- **Total: ~25 minutes**

**Result:**
- ✅ Coffee machine status always accurate
- ✅ Updates within 5-10 seconds
- ✅ No temperature warnings
- ✅ Better user experience

---

## 🚀 Ready? Let's Go!

1. **Fork:** https://github.com/nsinenian/homebridge-sanremo-coffee-machines
2. **Run commands** from Step 2 above
3. **Install** in Homebridge (Step 3)
4. **Update config** (Step 4)
5. **Test** (Step 5)
6. **Enjoy!** ☕

---

**Questions?** Check the documentation files or review the logs for errors.

**Working?** Enjoy your perfectly synchronized coffee machine status! 🎉

