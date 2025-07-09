
# StoryLoop

An Ionic/Capacitor app that generates text-adventure story previews based on your location.

## Prerequisites

- **Node.js** (v14 or newer)  
- **npm** (comes bundled with Node.js)  
- **Ionic CLI**  
  ```bash
  npm install -g @ionic/cli
* **Android Studio** (with Android SDK)
* **JDK 17+** (set `JAVA_HOME` to your JDK 17 install)

---

## 1. Clone & Install

```bash
git clone https://github.com/yourusername/yourrepo.git
cd yourrepo
npm install
```

---

## 2. Using the Ionic VS Code Extension

1. Open the project in VS Code
2. Install the **Ionic** extension (if you haven’t already)
3. Open the **Ionic** sidebar
4. Click **Build**
5. Click **Sync**
6. Click **Run Android**

![Ionic Extension Buttons](src/assets/ionicextension.png)

---

## 3. (Alternative) Command-Line Workflow

If you prefer to work in the terminal, you can achieve the same:

```bash
# 1) Build the web assets
ionic build

# 2) Copy & sync into the native Android project
npx cap sync android

# 3) Launch on your connected device or emulator
#    (use `adb devices` to list available devices)
npx cap run android --target=<YOUR_DEVICE_ID>
```

> Replace `<YOUR_DEVICE_ID>` with the ID shown by `adb devices`, or omit it to pick the default device/emulator.

---

## 4. Mobile Access & Ngrok Proxy

> **Note:** By default, the mobile app’s frontend is hard-coded to hit
> `https://dodo-novel-conversely.ngrok-free.app/api/...`. If your laptop isn’t running that exact host, API calls will fail on devices.

To run your own tunnel:

1. **Sign up** for a free account at [ngrok.com](https://ngrok.com)
2. **Install** the ngrok CLI

   ```bash
   npm install -g ngrok
   ```
3. **Authenticate** your machine

   ```bash
   ngrok authtoken <YOUR_AUTH_TOKEN>
   ```
4. **Create** a free subdomain (only one on the free plan), e.g. `my-storyloop`:

   ```bash
   ngrok http --url=my-storyloop.ngrok-free.app 3000
   ```
5. **Update** your project’s API URLs:

   ```diff
   - https://dodo-novel-conversely.ngrok-free.app/api/generateIdea
   + https://my-storyloop.ngrok-free.app/api/generateIdea

   - https://dodo-novel-conversely.ngrok-free.app/api/chat
   + https://my-storyloop.ngrok-free.app/api/chat
   ```

   > **Keep** the `/api/generateIdea` and `/api/chat` paths exactly as-is.
6. **Start** your local server on port 3000:

   ```bash
   node server.js --port=3000
   ```

   now ngrok will forward `https://my-storyloop.ngrok-free.app` → `http://localhost:3000`.

Once that’s running, any mobile device with the APK will successfully call your tunnelled API—even when your laptop isn’t on localhost.

---
