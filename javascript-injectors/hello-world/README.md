# Setup web asset with JavaScript Injection

**tl;dr**: Use JavaScript to change the text 'Hello World' to 'Hello John' on page load.

This example shows how to setup a web asset and inject JavaScript into it using the [Screenly CLI](https://github.com/Screenly/cli)

## Setup Screenly CLI

To be able to use this example, you need to setup the [Screenly CLI](https://github.com/Screenly/cli)

## Add a web asset

First we need to add the web asset that we want to use for our JavaScript test. This can be done easily using the CLI:

```bash
$ screenly asset add https://playground.srly.io/hello-world 'Hello World'
+----------------------------+-------------+------+--------+
| Id                         | Title       | Type | Status |
+----------------------------+-------------+------+--------+
| XXXXXXXXXXXXXXXXXXXXXXXXXX | Hello World | N/A  | none   |
+----------------------------+-------------+------+--------+

# Let's store the asset ID for later
$ export ASSSET_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
```

Next, you need to log into the web interface and schedule the web asset titled 'Hello World' to an active playlist such that it will show on one of your screens.

When the asset comes into rotation on your screen, you will notice that it says 'Hello World' on the screen. In the next step, we will use JavaScript to change this to 'Hello John' on load.

## Inject JavaScript

The relevant JavaScript is very simple:

```JavaScript
(function () {
  document.querySelector('.replace-me').innerText = 'John'
})()
```

Again, using our CLI, along with the URL to the JavaScript above, we're able instruct Screenly to run the above JavaScript when loading the page.


```bash
$ export JAVASCRIPT_URL='https://raw.githubusercontent.com/Screenly/playground/master/javascript-injectors/hello-world/hello-world.js'
$ screenly asset inject-js "$ASSET_ID" "$JAVASCRIPT_URL"
20XX-XX-XXTXX:XX:XX.XXXZ INFO  [screenly] Asset updated successfully.
```

That's it!

Upon next load, you will see the text changing from 'Hello World' to 'Hello John'. In reality, this is a rather useless example. What it is is intend to do is to show how you can execute JavaScript onload. For instance, you could use this to lose a GDPR dialogue, or log into a website.
