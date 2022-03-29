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

from http.server import BaseHTTPRequestHandler, HTTPServer

hostName = "0.0.0.0"
serverPort = 8080


class MyServer(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        self.wfile.write(bytes("<html><head><title>Screenly Web Asset metadata example</title></head>", "utf-8"))
        self.wfile.write(bytes("<body>", "utf-8"))
        self.wfile.write(bytes(f"<h1>Screen metadata</h1>", "utf-8"))
        self.wfile.write(bytes(f"<p><b>Hostname: </b>{self.headers['X-Screenly-hostname']}</p>", "utf-8"))
        self.wfile.write(bytes(f"<p><b>Name: </b>{self.headers['X-Screenly-screen-name']}</p>", "utf-8"))
        self.wfile.write(bytes(f"<p><b>Location: </b>{self.headers['X-Screenly-location-name']}</p>", "utf-8"))
        self.wfile.write(bytes(f"<p><b>Hardware: </b>{self.headers['X-Screenly-hardware']}</p>", "utf-8"))
        self.wfile.write(bytes(f"<p><b>Version: </b>{self.headers['X-Screenly-version']}</p>", "utf-8"))
        self.wfile.write(bytes(f"<p><b>Coordinates: </b>{self.headers['X-Screenly-lat']}, {self.headers['X-Screenly-lng']}</p>", "utf-8"))
        self.wfile.write(bytes(f"<p><b>Tags: </b>{self.headers['X-Screenly-tags']}</p>", "utf-8"))

        self.wfile.write(bytes("</body></html>", "utf-8"))


if __name__ == "__main__":
    webServer = HTTPServer((hostName, serverPort), MyServer)
    print("Server started http://%s:%s" % (hostName, serverPort))

    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.server_close()
    print("Server stopped.")
