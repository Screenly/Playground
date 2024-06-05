# TFL Bus Information Edge App

This guide will walk you through the steps to create an TFL Bus Status Edge App in Screenly.


## Prerequisites

* Install Screenly CLI - Please follow the guide [here](https://github.com/Screenly/cli)

## Steps

Step 1. **Log in to the Screenly account via CLI**

Follow the on-screen instructions to log in to your Screenly account.

`$ screenly login`

Step 2. **Download and Open Edge App Playground**

`$ git clone https://github.com/Screenly/Playground.git`

Step 3. **Enter tfl-bus-status Edge App Directory**

`$ cd edge-apps/tfl-bus-status`

Step 4. **Create a New tfl-bus-status Edge App:**

`$ screenly edge-app create --name TFL_EdgeApp --in-place`

Replace "TFL_EdgeApp" with your desired app name.

Step 5. **Upload the Edge App**

`$ screenly edge-app upload`

Wait for the upload to complete.

Step 6. **Specify the TFL API and STOP ID** for example: 490005186S1.

Replace "API" with the actual API that obtained from [https://api-portal.tfl.gov.uk/](https://api-portal.tfl.gov.uk/)

`$ screenly edge-app secret set tfl_api=API`

and provide the STOP ID also - replace the "stopID" with actual Stop ID.

`$ screenly edge-app setting set stop_id=stopID`


Step 7. **Deploy the Edge App as Asset**

`$ screenly edge-app version promote --latest`

This promotes the latest version of the Edge App as an asset.

Step 8. **Check the Screenly Dashboard**

Open the Screenly dashboard and verify that the new Edge App has been added as an asset.

Steps 9. **Assign Asset to Playlist and Device**

* Assign the new asset to a playlist.
* Assign the playlist to a device.

Now, the TFL Bus status Edge App has been configured, and the designated webpage/dashboard will be presented on the Screenly-connected TV/Monitor.
