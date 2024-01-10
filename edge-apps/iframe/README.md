# Creating an Edge App with iFrame in Screenly

This guide will walk you through the steps to create an Edge App in Screenly that uses an iFrame to load another HTML page or dashboard.

## Prerequisites

* Install Screenly CLI - Please follow the guide [here](https://github.com/Screenly/cli)

## Steps

1. **Log in to the Screenly account via CLI**

   Follow the on-screen instructions to log in to your Screenly account.

   ```bash
   screenly login
   ```

2. **Download and Open Edge App Playground**

   ```bash
   git clone https://github.com/Screenly/Playground.git
   cd edge-apps/iframe
   ```

3. **Enter iFrame Edge App Directory**

   ```bash
   cd edge-apps/iframe
   ```

4. **Create a New iFrame Edge App:**

   ```bash
   screenly edge-app create --name iframePage --in-place
   ```

   > Replace "iframePage" with your desired app name.

5. **Upload the Edge App**

   ```bash
   screenly edge-app upload
   ```

   > Wait for the upload to complete.

6. **Specify the iFrame URL**

   Replace "WEBPAGE_URL" with the actual URL you want to display in the iFrame.

   ```bash
   screenly edge-app setting set iframe=WEBPAGE_URL
   ```

   or

   ```bash
   screenly edge-app setting set iframe='<iframe src="WEBPAGE_URL" title="programiz pro website" height="500" width="500" ></iframe>'
   ```

7. **Deploy the Edge App as Asset**

   ```bash
   screenly edge-app version promote --latest
   ```

   > This promotes the latest version of the Edge App as an asset.

8. **Check the Screenly Dashboard**

   Open the Screenly dashboard and verify that the new Edge App has been added as an asset.

9. **Assign Asset to Playlist and Device**

   1. Assign the new asset to a playlist.
   2. Assign the playlist to a device.

Now, the iFrame Edge App has been configured, and the designated webpage/dashboard will be presented on the Screenly-connected TV/Monitor.
