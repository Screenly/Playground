import logging
import os
import requests
import sys
from time import sleep

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
ch = logging.StreamHandler()
logger.addHandler(ch)

# Screenly config
PLAYLIST_ID = os.getenv('PLAYLIST_ID')
SCREENLY_TOKEN = os.getenv('TOKEN')
HOST = 'https://api.screenlyapp.com'

# Weather service API key and target location
DARKSKY_API_KEY = os.getenv('DARKSKY_API_KEY')
LAT = os.getenv('LAT')
LNG = os.getenv('LNG')

# LOGIC
TEMP_THRESHOLD = os.getenv('TEMP_THRESHOLD')
ABOVE_OR_BELOW = os.getenv('ABOVE_OR_BELOW')
RETRY_TIMEOUT = float(os.getenv('RETRY_TIMEOUT', default=5 * 60))


def get_temperature():
    payload = {'units': 'si'}
    weather_lookup = requests.get(
        'https://api.darksky.net/forecast/{}/{},{}'.format(
            DARKSKY_API_KEY,
            LAT,
            LNG
        ),
        params=payload,
    )

    if not weather_lookup.ok:
        logger.error('Failed to perform weather lookup.')
        return

    return weather_lookup.json()['currently']['temperature']


def control_playlist(requestor, enable=True):
    requestor.patch(
        '{}/api/v3/playlists/{}/'.format(HOST, PLAYLIST_ID),
        {"is_enabled": enable}
    )


def main():
    # Do weather lookup
    if not (DARKSKY_API_KEY and LAT and LNG):
        logger.error('Missing weather variables.')
        sys.exit(1)

    # Build logic
    if not (TEMP_THRESHOLD and ABOVE_OR_BELOW):
        logger.error('Missing logic variables.')
        sys.exit(1)

    session = requests.Session()
    session.headers["Authorization"] = "Token {}".format(SCREENLY_TOKEN)

    below = 'below' in ABOVE_OR_BELOW.lower()
    above = 'above' in ABOVE_OR_BELOW.lower()

    # local state
    enabled = None

    if below and above:
        logger.error('Specify above or below. Not both.')
        sys.exit(1)

    switch_criteria = (
        lambda temperature: temperature < float(TEMP_THRESHOLD) if below
        else lambda temperature: temperature > float(TEMP_THRESHOLD)
    )

    while True:
        temperature = get_temperature()
        logger.info('Got temperature reading: {}'.format(temperature))

        if switch_criteria(temperature):
            if enabled in [False, None]:
                control_playlist(session, enable=True)
                enabled = True
                logger.info('Enabling playlist')
            else:
                logger.info('Playlist is already enabled')
        else:
            if enabled in [None, True]:
                control_playlist(session, enable=False)
                enabled = False
                logger.info('Disabling playlist')
            else:
                logger.info('Playlist is already disabled')

        logger.info('Sleeping for {} seconds'.format(RETRY_TIMEOUT))
        sleep(RETRY_TIMEOUT)


if __name__ == '__main__':
    main()
