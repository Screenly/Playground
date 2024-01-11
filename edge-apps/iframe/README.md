# Creating an Edge App with iFrame in Screenly

This guide will walk you through the steps to create an Edge App in Screenly that uses an iFrame to load another HTML page or dashboard.

## Prerequisites

* Install Screenly CLI - Please follow the guide [here](https://github.com/Screenly/cli)

## Steps

Step 1. **Log in to the Screenly account via CLI**

Follow the on-screen instructions to log in to your Screenly account.

   `$ screenly login`

Step 2. **Download and Open Edge App Playground**

`$ git clone https://github.com/Screenly/Playground.git`

`$ cd edge-apps/iframe`

Step 3. **Enter iFrame Edge App Directory**

`$ cd edge-apps/iframe`

Step 4. **Create a New iFrame Edge App:**

`$ screenly edge-app create --name iframePage --in-place`

> Replace "iframePage" with your desired app name.

Step 5. **Upload the Edge App**

`$ screenly edge-app upload`

> Wait for the upload to complete.

Step 6. **Specify the iFrame URL**

Replace "WEBPAGE_URL" with the actual URL you want to display in the iFrame.

`$ screenly edge-app setting set iframe=WEBPAGE_URL`
or

`$ screenly edge-app setting set iframe='<iframe src="WEBPAGE_URL" title="programiz pro website" height="500" width="500" ></iframe>`

Step 7. **Deploy the Edge App as Asset**

`$ screenly edge-app version promote --latest`

> This promotes the latest version of the Edge App as an asset.

Step 8. **Check the Screenly Dashboard**

Open the Screenly dashboard and verify that the new Edge App has been added as an asset.

Steps 9. **Assign Asset to Playlist and Device**

* Assign the new asset to a playlist.
* Assign the playlist to a device.

Now, the iFrame Edge App has been configured, and the designated webpage/dashboard will be presented on the Screenly-connected TV/Monitor.
