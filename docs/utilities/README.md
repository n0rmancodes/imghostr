# Utilities
ImgHostr comes with some neat tools you can use to make your experience a lot easier. Some of these require user input for obvious reasons. ***It is highly reccomended you use these utilities in the root folder of ImgHostr, as to prevent loss/gain of files in other areas of your system.***

## Converting your old image library
If you have the option ``makeInfoJson`` in your [config](../config/README.md), you can add JSONs for images that were on beforehand.

You can do this without any input via going to the root of your ImgHostr server in the terminal and running ``node utils/converOldDb.js`` and it will do it instantly.

## Delete All Images/Authentication Keys
If you ever want to start fresh in your server, you can remove your images with ``node utils/deleteAll`` and ``node utils/resetAuth`` to remove all authentication keys you may have had.

## Generate Authentication Keys in Console
You can generate keys without a password via using ``node utils/generateAuth`` and all you have to do is give the key and name. You can find said key in the contents of the ``auth`` folder with the name ``[NAME].key.txt``

### Warning
Make sure to **not** delete ``db.json`` or any of the ``.key.txt`` files. This will remove the keys improperly and may disconfigure your server. See below on how to do it properly.

## Removing Auth Keys
If there's a bad actor posting pictures on your server that are against the rules, you can run ``node removeAuthbyId`` and enter the ID (also referred to as username, user, name) of the person you wish to remove and press enter.