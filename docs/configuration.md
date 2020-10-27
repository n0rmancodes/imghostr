# Configuration
This is where you learn to configure your ImgHostr server, using the ``config.json`` file that you can make or it automatically generates on your first run of the program.

## Quick Notes
You will need a basic understanding of JSON when editing. If you don't know what you are doing, just follow the steps given to edit.

## Example Configuration
```json
{
    "host": "http://localhost:3003",
    "maxSize": 20000000,
    "noHtmlUploads": false,
    "requireAuth": false,
    "allowAutoAuth": false,
    "port": 3003,
    "displayImages": true,
    "makeInfoJson": true
}
```

## Host (``host``)
This is a string (required around to have quotes around it). 
You must set it to where the URL's protocol and domain is. Put quotes around it.

For example if your image URLs are like "http://localhost:3003/JSrPMBuEO9", then the URL would be "http://localhost:3003". 

Default: ``"localhost:3003"``

### Important Note
**Please** do not include the last slash. If you do, URLs will not return correctly in the upload responses.

## Max Size (``maxSize``)
This is a number that tells the maximum size of individual images can be. This must be in *byte* form. Do not put quotes around it.

For example, if you want the maximum size of bytes to be 20 MB images to be uploaded, set ``maxSize`` in the JSON file to ``20000000``. Don't put in commas.

Default: ``20000000``.

## No HTML Uploads (``noHtmlUploads``)
This is a true/false statement. Do not put quotes around it. This tells the server to allow or not allow uploads through the HTML website on it.

Default: ``false``.

### With HTML Uploads
![HTML UI with HTML Uploads](./images/with-html-uploads.png)

### Without HTML Uploads
![HTML UI without HTML Uploads](./images/without-html-uploads.png)

## Require Auth (``requireAuth``)
This is a true/false statement. Do not put quotes around it. This tells if when uploading images if the server should *require* an authentication header or not.

The header codes are generated with ``node utils/generateAuth`` or enabling the setting ``enableAutoAuth`` and visiting ``/generateAuth``.

It is *highly reccomended* to have the setting ``makeInfoJson`` set to ``true`` when this setting is on. 

This is *highly reccomended* to have set to true.

Default: ``false``.

## Enable Auto Auth (``enableAutoAuth``)
This allows the servers frontend to generate authentication codes by going to enter a password, which is in the config file as ``pass``.

Default: ``false``.

## Port (``port``)
This is a 2 to 5 digit number. Do not put quotes around it. This is going to tell the code what port to use. If it is ``3003`` you can access the server on your local machine on [https://localhost:3003/](https://localhost:3003/). 

Default: ``3003``

## Display Images (``displayImages``)
This is a true/false statement. Do not put quotes around it. This tells the frontend to either display or hide recently uploaded images.

Default: ``true``

### With this enabled
![With HTML Display Images Enabled](./images/with-disp-en.png)

### With this disabled
![With HTML Display Images Disabled](./images/with-disp-ds.png)

## Make Info File (``makeInfoJson``)
This is a true/false statement. Do not put quotes around it. This is mainly for server maintainers (for now) to tell who uploaded an image and when. So, if someone uploads something against the server's rules, they can be banned with ease.

Default: ``true``

## Password (``pass``)
This is a string. Put quotes around it. This is for the ``allowAutoAuth`` setting, so all you would need is to give people who want access to upload to the server, a password, instead of a 100-character auth code.

It is highly reccomended that if ``requireAuth`` and ``allowAutoAuth`` are set to on, that you  change it from the default password.

Default: ``password``