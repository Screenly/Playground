"""
Example headers
 {
    "X-Screenly-hostname": "srly-jmar75ko6xp651j",
    "X-Screenly-screen-name": "dizzy cherry",
    "X-Screenly-location-name": "Cape Town",
    "X-Screenly-hardware": "x86",
    "X-Screenly-version": "v2",
    "X-Screenly-lat": "-33.925278",
    "X-Screenly-lng": "18.423889",
    "X-Screenly-tags": "srly-jmar75ko6xp651j,custom-label"
}"""

from flask import Flask, render_template, request


app = Flask(__name__)
app.config.from_pyfile('config.py')


@app.route("/")
def render_metadata_headers():
    return render_template('metadata_headers.html', headers=request.headers, apiKey=app.config['GMAPS_API_KEY'])


if __name__ == '__main__':
    app.run(host="0.0.0.0")
