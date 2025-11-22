# Installation Guide - Homebridge Sanremo Coffee Machines v1.2.0

## 🎯 Overview

This guide will help you install the improved v1.2.0 plugin with automatic status polling.

---

## 📦 Installation Methods

### **Method 1: Install from GitHub** ⭐ **RECOMMENDED FOR TESTING**

This installs directly from your forked repository.

#### **Step 1: Access Homebridge Container**

Since SSH is disabled, you'll need to use the Synology Docker UI or enable SSH temporarily.

**Option A: Using Synology Docker UI**
1. Open **Docker** app on Synology
2. Go to **Container** tab
3. Select **homebridge** container
4. Click **Details** → **Terminal** → **Create** → Select `/bin/bash`

**Option B: Temporarily Enable SSH** (if preferred)
1. Open Synology **Control Panel** → **Terminal & SNMP**
2. Enable **SSH service**
3. Connect: `ssh franc@192.168.68.101`
4. Remember to disable SSH after installation

#### **Step 2: Remove Old Plugin**

```bash
# Enter the homebridge container
sudo docker exec -it homebridge bash

# Remove the old plugin
npm uninstall homebridge-sanremo-cube

# Exit container
exit
```

#### **Step 3: Install New Plugin**

```bash
# Enter the homebridge container
sudo docker exec -it homebridge bash

# Install from GitHub (replace YOUR_USERNAME with your GitHub username)
npm install https://github.com/YOUR_USERNAME/homebridge-sanremo-coffee-machines.git

# Exit container
exit
```

#### **Step 4: Update Configuration**

1. Open Homebridge UI: `http://192.168.68.101:8581`
2. Go to **Config** tab
3. Find your Sanremo configuration
4. **Replace** the old accessory config with the new platform config:

**OLD Configuration (Remove This):**
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

**NEW Configuration (Use This):**
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

**Key Changes:**
- `"accessory"` → `"platform"`
- `"SanremoCube"` → `"SanremoCoffeeMachines"`
- Machine details now in `"machines"` array
- Removed `"disableTemperatureSensor"` (not needed - plugin supports up to 150°C)

#### **Step 5: Restart Homebridge**

```bash
sudo docker restart homebridge
```

#### **Step 6: Verify Installation**

1. Open Homebridge UI: `http://192.168.68.101:8581`
2. Go to **Logs** tab
3. Look for:
   ```
   Starting automatic polling every 5 seconds for Coffee Machine
   ```

---

### **Method 2: Install Locally (Advanced)**

If you want to test locally before pushing to GitHub:

```bash
# On your Mac
cd "/Users/francisdierer/Dev Environment/homebridge-sanremo-coffee-machines"

# Create a tarball
npm pack

# This creates: homebridge-sanremo-coffee-machines-1.2.0.tgz

# Copy to NAS (you'll need to enable SSH temporarily or use file sharing)
scp homebridge-sanremo-coffee-machines-1.2.0.tgz franc@192.168.68.101:/volume1/docker/homebridge/

# SSH into NAS
ssh franc@192.168.68.101

# Install in Homebridge container
sudo docker exec -it homebridge bash
cd /homebridge
npm uninstall homebridge-sanremo-cube
npm install ./homebridge-sanremo-coffee-machines-1.2.0.tgz
exit

# Restart
sudo docker restart homebridge
```

---

## 🔧 Configuration Options

### **Minimal Configuration**

```json
{
    "platform": "SanremoCoffeeMachines",
    "name": "SanremoCoffeeMachines",
    "machines": [
        {
            "name": "Coffee Machine",
            "type": "Cube",
            "ip": "192.168.68.83"
        }
    ]
}
```
*Defaults to 30-second polling*

### **Recommended Configuration**

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
*5-second polling for best accuracy*

### **Multiple Machines**

```json
{
    "platform": "SanremoCoffeeMachines",
    "name": "SanremoCoffeeMachines",
    "machines": [
        {
            "name": "Kitchen Coffee Machine",
            "type": "Cube",
            "ip": "192.168.68.83",
            "pollingInterval": 5
        },
        {
            "name": "Office Coffee Machine",
            "type": "Cube",
            "ip": "192.168.68.84",
            "pollingInterval": 10
        }
    ]
}
```

---

## 🧪 Testing

### **Test 1: Verify Polling is Working**

1. Check logs for: `Starting automatic polling every X seconds`
2. You should see regular status updates

### **Test 2: Test Status Updates**

1. **Turn machine ON** physically
2. **Wait 5-10 seconds**
3. **Check Home app** - should show ON
4. **Turn machine OFF** physically
5. **Wait 5-10 seconds**
6. **Check Home app** - should show OFF

### **Test 3: Temperature Monitoring**

1. Open Home app
2. Long-press Coffee Machine
3. Check current temperature
4. Should show actual boiler temperature (115-130°C range)
5. **No warnings in logs** about temperature exceeding 100°C

---

## 🔍 Troubleshooting

### **Plugin Not Loading**

**Check logs for:**
```
Error: Cannot find module 'homebridge-sanremo-coffee-machines'
```

**Solution:**
```bash
sudo docker exec -it homebridge bash
npm list | grep sanremo
# Should show: homebridge-sanremo-coffee-machines@1.2.0
```

### **No Polling Messages in Logs**

**Check configuration:**
- Ensure you're using `"platform": "SanremoCoffeeMachines"` (not `"accessory"`)
- Ensure `machines` array is properly formatted

### **Temperature Warnings Still Appearing**

This means you're still using the old `homebridge-sanremo-cube` plugin.

**Verify:**
```bash
sudo docker exec -it homebridge bash
npm list | grep sanremo
```

Should show `homebridge-sanremo-coffee-machines`, not `homebridge-sanremo-cube`.

### **Status Still Not Updating**

1. Check polling interval in config
2. Check logs for errors
3. Verify machine is reachable: `ping 192.168.68.83`
4. Check machine is connected to WiFi

---

## 🚀 Next Steps

### **1. Fork the Repository on GitHub**

1. Go to: https://github.com/nsinenian/homebridge-sanremo-coffee-machines
2. Click **Fork** (top right)
3. This creates: `https://github.com/YOUR_USERNAME/homebridge-sanremo-coffee-machines`

### **2. Push Your Changes**

```bash
cd "/Users/francisdierer/Dev Environment/homebridge-sanremo-coffee-machines"

# Set up your fork as origin
git remote set-url origin https://github.com/YOUR_USERNAME/homebridge-sanremo-coffee-machines.git

# Create a feature branch
git checkout -b feature/automatic-polling

# Commit changes
git add .
git commit -m "feat: Add automatic status polling with configurable interval

- Implement automatic polling mechanism (default 30s)
- Add configurable pollingInterval parameter (5-300s)
- Update all characteristics automatically
- Add comprehensive logging
- Update to v1.2.0"

# Push to your fork
git push origin feature/automatic-polling
```

### **3. Create Pull Request** (Optional)

If you want to contribute back to the original project:

1. Go to your fork on GitHub
2. Click **Pull Request**
3. Select `feature/automatic-polling` branch
4. Write description of changes
5. Submit PR to original repository

---

## 📝 Summary

**What Changed:**
- ✅ Plugin type: `accessory` → `platform`
- ✅ Added automatic polling
- ✅ Added `pollingInterval` configuration
- ✅ Temperature range already supports 115-130°C (no warnings!)
- ✅ Better status accuracy in Home app

**What to Do:**
1. Fork repository on GitHub
2. Install from your fork
3. Update configuration (accessory → platform)
4. Restart Homebridge
5. Test and enjoy real-time status updates!

---

## 🆘 Need Help?

If you encounter issues:
1. Check Homebridge logs
2. Verify configuration format
3. Ensure machine is reachable
4. Check plugin is installed correctly

Feel free to open an issue on GitHub with:
- Your configuration (remove sensitive data)
- Relevant log excerpts
- Steps to reproduce the issue

