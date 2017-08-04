# haar2tjs
Haar classifiers converter to [tracking.js](https://github.com/eduardolundgren/tracking.js) classifiers for object tracking.

## Installation

```shell
npm install haar2tjs --save-dev
```

## Usage & Example

**./example/eye.classifier.xml**
```xml
<?xml version="1.0"?>
<opencv_storage>
    <cascade type_id="opencv-cascade-classifier">
        <stageType>BOOST</stageType>
        <featureType>HAAR</featureType>
        <height>20</height>
        <width>20</width>
        <stageParams>
            <maxWeakCount>1</maxWeakCount>
        </stageParams>
        <featureParams>
            <maxCatCount>0</maxCatCount>
        </featureParams>
        <stageNum>1</stageNum>
        <stages>
            <_>
                <maxWeakCount>1</maxWeakCount>
                <stageThreshold>-1.4562760591506958e+00</stageThreshold>
                <weakClassifiers>
                    <_>
                        <internalNodes>0 -1 0 1.2963959574699402e-01</internalNodes>
                        <leafValues>-7.7304208278656006e-01 6.8350148200988770e-01</leafValues>
                    </_>
                </weakClassifiers>
            </_>
        </stages>
        <features>
            <_>
                <rects>
                    <_>0 8 20 12 -1.</_>
                    <_>0 14 20 6 2.</_>
                </rects>
                <tilted>1</tilted>
            </_>
        </features>
    </cascade>
</opencv_storage>
```

Convert Script Example:

```javascript
const Haar2tjs = require(`haar2tjs`);

const input = `./examples/eye.classifier.xml`;
const output = `./examples/eye.classifier.js`;

const eyeToTjs = new Haar2tjs(input);

eyeToTjs
    // Optional definition for Docblock-Comments
    .setDescription(`Example VJ Classifier for eyes`)
    .setAuthor(`Eduardo Lundgren`, `edu@rdo.io`)
    .setVersion(`v1.0.0`)
    .setLink(`https://trackingjs.com`)
    .setLicense(`BSD`)

    // Save as Viola Jones classifier
    .saveAsVJ(`eye`, output)
    .then((result) => {
        console.log(result);
    })
    .catch((err) => {
        console.log(`Ooops, an error happens...`);
        console.log(err);
    });
```

Output:

**./example/eye.classifier.js*

```javascript
/**
* Example VJ Classifier for eyes
* @author Eduardo Lundgren <edu@rdo.io>
* @version v1.0.0
* @link https://trackingjs.com
* @license BSD
*/
tracking.ViolaJones.classifiers.eye = new Float64Array([20,20,-1.4562760591506958,1,1,2,0,8,20,12,-1,0,14,20,6,2,0.12963959574699402,-0.7730420827865601,0.6835014820098877]);
```

## Credits

Large parts used from Ciro S. Costa's [gulp-converter-tjs](https://github.com/cirocosta/gulp-converter-tjs) ([License](https://github.com/cirocosta/gulp-converter-tjs/blob/master/LICENSE)).

## License

```
MIT License

Copyright (c) 2017 Raphael Wildhaber

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

```